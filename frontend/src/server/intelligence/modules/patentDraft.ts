import type { RuntimeContext } from "@/server/intelligence/context";
import type { BaseIdeaRequest, PatentDraftResponse } from "@/server/intelligence/types";
import { topKeywords } from "@/server/intelligence/utils";

const fallbackDraft = (ideaText: string): PatentDraftResponse => {
  const keywords = topKeywords(ideaText, 6);

  return {
    abstract:
      "A system and method for processing research ideas through secure ingestion, semantic prior-art retrieval, and decision support scoring to improve patent readiness.",
    background:
      "Conventional innovation workflows depend on fragmented evaluation systems and manual prior-art triage, causing delay and legal uncertainty for early-stage inventors.",
    summary:
      `The invention introduces a modular intelligence pipeline combining novelty scoring, legal risk detection, and execution planning around ${keywords.join(", ")}.`,
    claims: [
      "A computer-implemented method comprising: securely ingesting an idea payload, generating semantic embeddings, querying a patent corpus, and computing a readiness score.",
      "The method of claim 1, wherein collaborator recommendations are generated from required-skill extraction and compatibility ranking.",
      "The method of claim 1, further comprising generating a structured patent draft and timestamp certificate for evidentiary traceability.",
    ],
    description:
      "The disclosed architecture consists of ingestion, retrieval, scoring, recommendation, and drafting modules. Each module exchanges structured JSON artifacts and operates asynchronously to support scalable deployment.",
  };
};

export const generatePatentDraft = async (
  request: BaseIdeaRequest,
  context: RuntimeContext
): Promise<PatentDraftResponse> => {
  const overlapContext = request.priorArt
    ?.slice(0, 5)
    .map((item) => `- ${item.title}: ${item.abstract.slice(0, 180)}`)
    .join("\n");

  const fallback = fallbackDraft(context.secureIdea.scrubbedIdeaText);

  const draft = await context.llm.generateJson(
    `You are a patent drafting assistant.
Return strict JSON with keys: abstract, background, summary, claims (array of strings), description.
Keep claims basic and avoid speculative legal guarantees.
Idea: ${context.secureIdea.scrubbedIdeaText}
Prior-art context:\n${overlapContext || "None supplied"}`,
    fallback as unknown as Record<string, unknown>
  );

  return {
    abstract: String(draft.abstract || fallback.abstract),
    background: String(draft.background || fallback.background),
    summary: String(draft.summary || fallback.summary),
    claims: Array.isArray(draft.claims)
      ? draft.claims.map((claim) => String(claim)).filter(Boolean)
      : fallback.claims,
    description: String(draft.description || fallback.description),
  };
};
