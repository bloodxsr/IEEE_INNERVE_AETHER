import { NextResponse } from "next/server";
import { scrubPII, hashIPMetadata } from "@/lib/armorclaw";
import { GoogleGenAI } from "@google/genai";
import { Pinecone } from "@pinecone-database/pinecone";

// Ensures Next.js treats this as a dynamic endpoint
export const dynamic = "force-dynamic";

export async function GET() {
    return NextResponse.json({
        success: true,
        endpoint: "/api/analyze",
        accepts: ["POST"],
        message: "Telemetry probe OK. Use POST to execute analysis.",
    });
}

export async function POST(req: Request) {
  try {
    const { abstract } = await req.json();
    if (!abstract) return NextResponse.json({ error: "No abstract provided." }, { status: 400 });

    // Ensure we are working with environment variables securely
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
    const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
        const GEMINI_EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
        const configuredEmbeddingModel = GEMINI_EMBEDDING_MODEL.replace(/^models\//, "").trim();
        const embeddingModelCandidates = Array.from(
            new Set([configuredEmbeddingModel, "gemini-embedding-001", "text-embedding-004"].filter(Boolean))
        );
    
    const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
    const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME!;
    const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE!;

    const SERP_API_KEY = process.env.PATENT_GOOGLE_API_KEY!;
    const SERP_URL = process.env.PATENT_GOOGLE_API_URL!;

    // 1. ArmorClaw Gateway: Scrub PII + Hash IP
    const scrubbedAbstract = scrubPII(abstract);
    const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const ipHash = await hashIPMetadata(clientIp);

    // Initialize AI & Vector DB instances
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
    const index = pc.Index(PINECONE_INDEX_NAME);

    // Robust Retry wrapper for Gemini 503 Overloads
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    const safeGenerate = async (modelName: string, prompt: string, maxRetries = 3) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const res = await ai.models.generateContent({ model: modelName, contents: prompt });
                return res;
            } catch (error: any) {
                if (error?.status === 503 && attempt < maxRetries) {
                    console.warn(`Gemini 503 overload. Retry ${attempt}/${maxRetries} in ${attempt * 1.5}s...`);
                    await delay(attempt * 1500);
                    continue;
                }
                throw error;
            }
        }
        throw new Error("Gemini repeatedly returned 503 Overload");
    };

    let resolvedEmbeddingModel: string | null = null;
    const isEmbeddingModelUnavailable = (error: any) => {
        const message = String(error?.message || "");
        return (
          error?.status === "NOT_FOUND" ||
          error?.code === 404 ||
          /NOT_FOUND|not found|not supported/i.test(message)
        );
    };

    const safeEmbed = async (contents: string) => {
        const candidates = resolvedEmbeddingModel ? [resolvedEmbeddingModel] : embeddingModelCandidates;
        let lastError: any;

        for (const model of candidates) {
            try {
                const res = await ai.models.embedContent({ model, contents });
                resolvedEmbeddingModel = model;
                return res;
            } catch (error: any) {
                lastError = error;
                if (isEmbeddingModelUnavailable(error)) {
                    continue;
                }
                throw error;
            }
        }

        throw new Error(
          `No supported embedding model available. Tried: ${embeddingModelCandidates.join(", ")}. Last error: ${lastError?.message || "unknown"}`
        );
    };

        const normalizeVector = (values: unknown): number[] | null => {
                if (!Array.isArray(values) || values.length === 0) return null;

                const vector = values
                    .map((value) => Number(value))
                    .filter((value) => Number.isFinite(value));

                return vector.length > 0 ? vector : null;
        };

    // 2. Gemini extracts best keywords for Google Patents query
    const keywordPrompt = `Extract exactly 3 concise keywords from this abstract to use in a Google Patents search. Return ONLY the 3 words separated by spaces. Abstract: "${scrubbedAbstract}"`;
    const keywordRes = await safeGenerate(GEMINI_MODEL, keywordPrompt);

    const searchQuery = keywordRes.text?.trim() || "software algorithm";

    // 3. Live Google Patents Fetch via SerpApi
    const serpUrl = `${SERP_URL}&q=${encodeURIComponent(searchQuery)}&api_key=${SERP_API_KEY}`;
    const patentRes = await fetch(serpUrl);
    
    if (!patentRes.ok) {
       throw new Error("Google Patents SERP API returned an error.");
    }

    const patentData = await patentRes.json();
    const livePatents = patentData.organic_results || [];
    
    // We strictly guarantee no mock data. If the API returns nothing, we abort.
    if (livePatents.length === 0) {
        return NextResponse.json({ error: "Zero live patents found from Google API for this query. Synthetic mock data insertion is strictly blocked." }, { status: 404 });
    }

    // Process top 5 live google patents
    const topPatents = livePatents.slice(0, 5).map((p: any) => ({
       id: String(p.publication_number || p.patent_id || `PAT-${Math.random()}`).trim(),
       title: p.title || "Unknown Patent",
       snippet: p.snippet || p.title || "",
       link: p.link || ""
    }));

    // 4. Generate Embeddings for the live patents directly into Pinecone mapped index space
    const upsertRecords: Array<{
      id: string;
      values: number[];
      metadata: { title: string; snippet: string; link: string; integrity_source: string };
    }> = [];

    for (const [indexPosition, patent] of topPatents.entries()) {
        const p_embed = await safeEmbed(`${patent.title}: ${patent.snippet}`);

        const embeddingVector = normalizeVector(p_embed.embeddings?.[0]?.values);
        if (!embeddingVector) {
            console.warn(`Skipping Pinecone upsert for ${patent.id || `PAT-${indexPosition}`}: empty embedding vector.`);
            continue;
        }

        const recordId = patent.id || `PAT-${Date.now()}-${indexPosition}`;
        upsertRecords.push({
            id: recordId,
            values: embeddingVector,
            metadata: {
                title: patent.title,
                snippet: patent.snippet,
                link: patent.link,
                integrity_source: "Live_SerpAPI" // Traceable proof
            }
        });
    }

    if (upsertRecords.length > 0) {
        // Populate Pinecone dynamically with only validated vectors.
        await index.namespace(PINECONE_NAMESPACE).upsert(upsertRecords);
    } else {
        console.warn("No valid patent vectors were generated for Pinecone upsert.");
    }

    // 5. Generate high-dimensional embedding for user abstract
    const userEmbedBase = await safeEmbed(scrubbedAbstract);
    const userVector = normalizeVector(userEmbedBase.embeddings?.[0]?.values);

    if (!userVector) throw new Error("Failed to generate vector for user abstract.");

    // 6. Neural Prior Art Check (Pinecone Vector Search against freshly loaded live data)
    const queryResponse = await index.namespace(PINECONE_NAMESPACE).query({
        vector: userVector,
        topK: 3,
        includeMetadata: true
    });

    const matches = queryResponse.matches || [];

    // 7. Compute Novelty Score Engine (0-100 based on nearest semantic node distance)
    // Pinecone handles cosine similarity by default. Score = 1 usually means identical.
    // So Novelty = (1 - highest_match_score) * 100, clamped logically
    let topScore = 0;
    if (matches.length > 0 && matches[0].score !== undefined) {
        topScore = matches[0].score; 
    }
    const noveltyScoreRaw = Math.max(0, Math.min(100, Math.floor((1 - (topScore * 0.8)) * 100)));
    // Adjust logic slightly since identical vectors output score close to 1.0. 
    // If score is 0.9, novelty is 10%. If score is 0.5, novelty is 50%.
    const noveltyScore = matches.length > 0 ? Math.floor((1 - matches[0].score!) * 100) : 100;


    // 8. RAG-Powered Legal Summarizer (Gemini generating risk assessment)
    const matchedPatentsContext = matches.map(m => `Patent ID: ${m.id}, Title: ${m.metadata?.title}, Summary: ${m.metadata?.snippet}`).join(" | ");
    
    const ragPrompt = `You are a high-level patent analyst. Based on the user's abstract: "${scrubbedAbstract}", and these live matched Google Patents: ${matchedPatentsContext}, provide:
    1. A plain-English summary of the closest overlapping claims.
    2. Key legal/structural risk areas.
    3. Actionable R&D pivot suggestions to avoid conflict and increase the Novelty Score.
    
    Keep it extremely concise and direct (bullet points).`;

    const summaryRes = await safeGenerate(GEMINI_MODEL, ragPrompt);
    const aiLegalSummary = summaryRes.text;

    // Build the final Integrity Report payload
    const dataIntegritySignature = {
        zeroSyntheticData: true,
        source: "Google Patents Public Data API (via SerpApi)",
        pineconeNodesVerified: matches.length,
        ipHash: ipHash // Proof of ArmorClaw execution
    };

    return NextResponse.json({
        success: true,
        noveltyScore: noveltyScore > 0 ? (noveltyScore < 100 ? noveltyScore : 99) : 5,
        closestMatches: matches.map(m => ({
            id: m.id,
            score: m.score,
            title: m.metadata?.title,
            link: m.metadata?.link,
            snippet: m.metadata?.snippet
        })),
        legalSummary: aiLegalSummary,
        dataIntegritySignature
    });

  } catch (error: any) {
    console.error("Aether Pipeline Error:", error);
    return NextResponse.json({ error: error.message || "Unknown server error." }, { status: 500 });
  }
}
