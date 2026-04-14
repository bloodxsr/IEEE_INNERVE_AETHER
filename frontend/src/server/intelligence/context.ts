import { LlmRuntime } from "@/server/intelligence/llm";
import { secureIngest } from "@/server/intelligence/security";

export interface RuntimeContext {
  llm: LlmRuntime;
  secureIdea: ReturnType<typeof secureIngest>;
}

export const createRuntimeContext = (ideaText: string, clientIp: string): RuntimeContext => {
  const embeddingModels = [
    (process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001").replace("models/", "").trim(),
    "gemini-embedding-001",
    "text-embedding-004",
  ].filter(Boolean);

  const llm = new LlmRuntime({
    apiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    embeddingModels: Array.from(new Set(embeddingModels)),
  });

  return {
    llm,
    secureIdea: secureIngest(ideaText, clientIp),
  };
};
