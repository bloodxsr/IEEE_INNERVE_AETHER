import { Pinecone } from "@pinecone-database/pinecone";
import { resizeVector } from "@/server/intelligence/utils";

import type { LlmRuntime } from "@/server/intelligence/llm";
import type { PriorArtItem } from "@/server/intelligence/types";
import { topKeywords } from "@/server/intelligence/utils";


const parseSerpPatents = (payload: any): PriorArtItem[] => {
  const organic = Array.isArray(payload?.organic_results) ? payload.organic_results : [];

  return organic.slice(0, 10).map((item: any) => ({
    id: String(item?.publication_number || item?.patent_id || `PAT-${Math.random().toString(36).slice(2)}`),
    title: String(item?.title || "Unknown Patent"),
    abstract: String(item?.snippet || ""),
    assignee: item?.assignee ? String(item.assignee) : undefined,
    publishedAt: item?.publication_date ? String(item.publication_date) : undefined,
    sourceUrl: item?.link ? String(item.link) : undefined,
    score: 0,
  }));
};

export const fetchLivePatents = async (ideaText: string, llm: LlmRuntime): Promise<PriorArtItem[]> => {
  const base = process.env.PATENT_GOOGLE_API_URL;
  const key = process.env.PATENT_GOOGLE_API_KEY;
  if (!base || !key) return [];

  let query = topKeywords(ideaText, 4).join(" ");
  try {
    const keywordPrompt = `Extract 4 high-signal patent search keywords from this idea and return only plain words separated by spaces: ${ideaText}`;
    const llmKeywords = (await llm.generateText(keywordPrompt)).trim();
    if (llmKeywords) query = llmKeywords;
  } catch {
    // fallback query from keyword heuristic
  }

  const joiner = base.includes("?") ? "&" : "?";
  const url = `${base}${joiner}q=${encodeURIComponent(query)}&api_key=${encodeURIComponent(key)}`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return [];
    const payload = await response.json();
    return parseSerpPatents(payload);
  } catch {
    return [];
  }
};

export const retrievePriorArtFromPinecone = async (
  ideaText: string,
  llm: LlmRuntime,
  topK = 8
): Promise<PriorArtItem[]> => {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME;
  const namespace = process.env.PINECONE_NAMESPACE || "aether";

  if (!apiKey || !indexName) return [];

  try {
    const vector = await llm.embed(ideaText);
    if (!Array.isArray(vector) || vector.length === 0) return [];

    // Resize vector to match Pinecone index dimension (1024)
    const queryVector = resizeVector(vector, 1024);

    const pc = new Pinecone({ apiKey });
    const index = pc.Index(indexName);
    const response: any = await index.namespace(namespace).query({
      vector: queryVector,

      topK,
      includeMetadata: true,
    });

    const matches = Array.isArray(response?.matches) ? response.matches : [];

    return matches.map((match: any) => ({
      id: String(match?.id || "unknown"),
      title: String(match?.metadata?.title || "Unknown Patent"),
      abstract: String(match?.metadata?.snippet || match?.metadata?.abstract || ""),
      assignee: match?.metadata?.assignee ? String(match.metadata.assignee) : undefined,
      publishedAt: match?.metadata?.published_at ? String(match.metadata.published_at) : undefined,
      sourceUrl: match?.metadata?.link ? String(match.metadata.link) : undefined,
      score: typeof match?.score === "number" ? match.score : 0,
      metadata: match?.metadata || undefined,
    }));
  } catch {
    return [];
  }
};
