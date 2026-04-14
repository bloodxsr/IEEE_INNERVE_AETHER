import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";

type NodeStatus = "ONLINE" | "OFFLINE";
type NodeCategory = "service" | "endpoint";

interface TelemetryNode {
    node: string;
    status: NodeStatus;
    latency: number | null;
    error?: string;
    category: NodeCategory;
    path?: string;
    method?: string;
    statusCode?: number;
}

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_HEALTHCHECK_MODEL = process.env.GEMINI_HEALTHCHECK_MODEL || "";
const ARMORCLAW_IAP_ENDPOINT = (process.env.ARMORCLAW_IAP_ENDPOINT || "").trim();
const ARMORCLAW_PROXY_ENDPOINT = (process.env.ARMORCLAW_PROXY_ENDPOINT || "").trim();
const ARMORCLAW_BACKEND_ENDPOINT = (process.env.ARMORCLAW_BACKEND_ENDPOINT || "").trim();
const ARMORCLAW_API_KEY = (process.env.ARMORCLAW_API_KEY || "").trim();
const GEMINI_MODEL_CANDIDATES = Array.from(
    new Set([GEMINI_HEALTHCHECK_MODEL, GEMINI_MODEL, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"].filter(Boolean))
);
const ENDPOINT_PROBE_PATHS = [
    "/api/analyze",
    "/api/collaborators",
    "/api/extract-paper",
    "/api/profile",
    "/api/intelligence",
    "/api/intelligence/readiness",
    "/api/intelligence/pivot",
    "/api/intelligence/landscape",
    "/api/intelligence/team-builder",
    "/api/intelligence/patent-draft",
    "/api/intelligence/plagiarism",
    "/api/intelligence/market-validation",
    "/api/intelligence/prototype-recommendation",
    "/api/intelligence/startup-pipeline",
    "/api/intelligence/timestamp",
    "/api/intelligence/pipeline",
] as const;
const ENDPOINT_SUCCESS_CODES = new Set([200, 204, 400, 401, 403]);

const isGeminiModelUnavailable = (error: any) => {
    const message = String(error?.message || "");
    return (
        error?.status === "NOT_FOUND" ||
        error?.code === 404 ||
        /NOT_FOUND|not found|not supported/i.test(message)
    );
};

const getBaseUrl = (request: Request): string => {
    const configured = (process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "").trim();
    if (configured) {
        try {
            return new URL(configured).origin;
        } catch {
            // Fall back to request origin.
        }
    }

    return new URL(request.url).origin;
};

async function pingArmorClawEndpoint(endpoint: string): Promise<{ statusCode: number }> {
    if (!endpoint) throw new Error("ArmorClaw endpoint is not configured.");

    const headers: Record<string, string> = {};
    if (ARMORCLAW_API_KEY) {
        headers.Authorization = `Bearer ${ARMORCLAW_API_KEY}`;
        headers["x-api-key"] = ARMORCLAW_API_KEY;
    }

    const res = await fetch(endpoint, {
        method: "GET",
        cache: "no-store",
        headers,
    });

    // 4xx generally means route-level mismatch but endpoint is reachable.
    if (res.status >= 500) {
        throw new Error(`Upstream returned ${res.status}`);
    }

    return { statusCode: res.status };
}

async function pingInternalEndpoint(baseUrl: string, path: string): Promise<{ statusCode: number }> {
    const response = await fetch(`${baseUrl}${path}`, {
        method: "GET",
        cache: "no-store",
        headers: {
            "x-telemetry-probe": "1",
        },
    });

    if (response.status === 404) {
        throw new Error(`Endpoint not found (404): ${path}`);
    }
    if (response.status >= 500) {
        throw new Error(`Endpoint returned ${response.status}: ${path}`);
    }
    if (!ENDPOINT_SUCCESS_CODES.has(response.status)) {
        throw new Error(`Unexpected status ${response.status}: ${path}`);
    }

    return { statusCode: response.status };
}

async function pingNode(
    name: string,
    pinger: () => Promise<Partial<TelemetryNode> | void>,
    options: { timeoutMs?: number; category: NodeCategory; path?: string; method?: string }
): Promise<TelemetryNode> {
    const timeoutMs = options.timeoutMs ?? 8000;
    const start = performance.now();
    try {
        const meta = await Promise.race([
            pinger(),
            new Promise<Partial<TelemetryNode>>((_, reject) =>
                setTimeout(() => reject(new Error("Timeout Threshold Exceeded")), timeoutMs)
            )
        ]);

        const ms = performance.now() - start;
        return {
            node: name,
            status: "ONLINE",
            latency: Math.round(ms),
            category: options.category,
            path: options.path,
            method: options.method,
            ...meta,
        };
    } catch (e: any) {
        return {
            node: name,
            status: "OFFLINE",
            latency: null,
            error: e.message,
            category: options.category,
            path: options.path,
            method: options.method,
        };
    }
}

export async function GET(request: Request) {
   const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;
   const pc = PINECONE_API_KEY ? new Pinecone({ apiKey: PINECONE_API_KEY }) : null;
   const baseUrl = getBaseUrl(request);
   let resolvedGeminiModel = GEMINI_MODEL;

   const pingGemini = async (): Promise<void> => {
       if (!ai) {
           throw new Error("GEMINI_API_KEY is missing.");
       }

       let lastError: any;

       for (const model of GEMINI_MODEL_CANDIDATES) {
           try {
               await ai.models.generateContent({ model, contents: "healthcheck" });
               resolvedGeminiModel = model;
               return;
           } catch (error: any) {
               lastError = error;
               if (isGeminiModelUnavailable(error)) {
                   continue;
               }
               throw error;
           }
       }

       throw new Error(
           `No Gemini model available for healthcheck. Tried: ${GEMINI_MODEL_CANDIDATES.join(", ")}. Last error: ${lastError?.message || "unknown"}`
       );
   };

   const serviceChecks: Promise<TelemetryNode>[] = [
       pingNode("Supabase Global (DB)", async () => {
           const { error } = await supabase.from("profiles").select("id").limit(1);
           if (error && error.code !== "PGRST205" && error.code !== "42P01") {
               throw error;
           }
       }, { category: "service" }),

       pingNode("Pinecone (Matrix)", async () => {
           if (!pc) {
               throw new Error("PINECONE_API_KEY is missing.");
           }
           if (!PINECONE_INDEX_NAME) {
               throw new Error("PINECONE_INDEX_NAME is missing.");
           }

           const idx = pc.Index(PINECONE_INDEX_NAME);
           await idx.describeIndexStats();
       }, { category: "service" }),

       pingNode("Gemini (Neural Flash)", async () => {
           await pingGemini();
       }, { category: "service", timeoutMs: 15000 }),

       pingNode("ArmorClaw IAP", async () => {
           return await pingArmorClawEndpoint(ARMORCLAW_IAP_ENDPOINT);
       }, { category: "service" }),

       pingNode("ArmorClaw Proxy", async () => {
           return await pingArmorClawEndpoint(ARMORCLAW_PROXY_ENDPOINT);
       }, { category: "service" }),

       pingNode("ArmorClaw Backend", async () => {
           return await pingArmorClawEndpoint(ARMORCLAW_BACKEND_ENDPOINT);
       }, { category: "service" }),
   ];

   const endpointChecks: Promise<TelemetryNode>[] = ENDPOINT_PROBE_PATHS.map((path) =>
       pingNode(`API ${path}`, async () => {
           return await pingInternalEndpoint(baseUrl, path);
       }, { category: "endpoint", path, method: "GET", timeoutMs: 7000 })
   );

   const telemetry = await Promise.all([...serviceChecks, ...endpointChecks]);

   const geminiNodeIndex = telemetry.findIndex((node) => node.node === "Gemini (Neural Flash)");
   if (geminiNodeIndex >= 0 && telemetry[geminiNodeIndex].status === "ONLINE") {
       telemetry[geminiNodeIndex].node = `Gemini (Neural Flash - ${resolvedGeminiModel})`;
   }

   const summarize = (nodes: TelemetryNode[]) => {
       const online = nodes.filter((node) => node.status === "ONLINE").length;
       return {
           total: nodes.length,
           online,
           offline: nodes.length - online,
       };
   };

   const serviceNodes = telemetry.filter((node) => node.category === "service");
   const endpointNodes = telemetry.filter((node) => node.category === "endpoint");

   return NextResponse.json({
       success: true,
       timestamp: new Date().toISOString(),
       telemetry,
       summary: {
           ...summarize(telemetry),
           services: summarize(serviceNodes),
           endpoints: summarize(endpointNodes),
           probeBaseUrl: baseUrl,
       },
   });
}
