import type { RuntimeContext } from "@/server/intelligence/context";
import type { PatentReadinessRequest, PatentReadinessResponse } from "@/server/intelligence/types";
import { clamp, cosineSimilarity, deterministicEmbedding, topKeywords, weightedScore } from "@/server/intelligence/utils";

const LEGAL_RISK_TERMS = [
  "copy",
  "clone",
  "same as",
  "derived from",
  "reverse engineer",
  "patent pending",
  "infring",
  "licensed",
];

const FEASIBILITY_BONUS_TERMS = [
  "prototype",
  "validation",
  "experiment",
  "tested",
  "benchmark",
  "dataset",
  "simulation",
  "deployment",
];

const MARKET_TERMS = [
  "customer",
  "market",
  "industry",
  "enterprise",
  "startup",
  "business",
  "pricing",
  "go to market",
  "demand",
];

export const scorePatentReadiness = async (
  request: PatentReadinessRequest,
  context: RuntimeContext
): Promise<PatentReadinessResponse> => {
  const idea = context.secureIdea.scrubbedIdeaText;
  const ideaVec = deterministicEmbedding(idea);

  const similarities = request.priorArt.map((item) => {
    const artVec = deterministicEmbedding(`${item.title} ${item.abstract}`);
    return cosineSimilarity(ideaVec, artVec);
  });

  const maxSimilarity = similarities.length ? Math.max(...similarities) : 0;
  const avgSimilarity = similarities.length
    ? similarities.reduce((sum, value) => sum + value, 0) / similarities.length
    : 0;
  const noveltyScore = clamp((1 - (maxSimilarity * 0.75 + avgSimilarity * 0.25)) * 100);

  const legalTermHits = LEGAL_RISK_TERMS.filter((term) => idea.toLowerCase().includes(term)).length;
  const overlapPenalty = clamp(maxSimilarity * 100);
  const ruleBasedLegalRisk = clamp(20 + legalTermHits * 12 + overlapPenalty * 0.4);

  const llmLegal = await context.llm.generateJson(
    `You are a patent attorney assistant. Score legal risk from 0 to 100 and provide one-line reason. Return JSON: {"risk": number, "reason": string}. Idea: ${idea}`,
    { risk: ruleBasedLegalRisk, reason: "Rule-based legal estimate." }
  );

  const llmRisk = typeof llmLegal.risk === "number" ? llmLegal.risk : ruleBasedLegalRisk;
  const legalRiskScore = clamp((ruleBasedLegalRisk * 0.6 + llmRisk * 0.4), 0, 100);

  const feasibilityHits = FEASIBILITY_BONUS_TERMS.filter((term) => idea.toLowerCase().includes(term)).length;
  const complexityPenalty = Math.max(0, topKeywords(idea, 20).length - 10) * 2;
  const technicalFeasibilityScore = clamp(55 + feasibilityHits * 7 - complexityPenalty, 0, 100);

  const marketHits = MARKET_TERMS.filter((term) => idea.toLowerCase().includes(term)).length;
  const marketViabilityScore = clamp(45 + marketHits * 8 + noveltyScore * 0.12, 0, 100);

  const weights = {
    novelty: request.weights?.novelty ?? 0.35,
    legalRisk: request.weights?.legalRisk ?? 0.25,
    technicalFeasibility: request.weights?.technicalFeasibility ?? 0.2,
    marketViability: request.weights?.marketViability ?? 0.2,
  };

  const finalPatentReadinessScore = weightedScore(
    {
      novelty: noveltyScore,
      legalRisk: 100 - legalRiskScore,
      technicalFeasibility: technicalFeasibilityScore,
      marketViability: marketViabilityScore,
    },
    weights
  );

  return {
    noveltyScore: Number(noveltyScore.toFixed(2)),
    legalRiskScore: Number(legalRiskScore.toFixed(2)),
    technicalFeasibilityScore: Number(technicalFeasibilityScore.toFixed(2)),
    marketViabilityScore: Number(marketViabilityScore.toFixed(2)),
    finalPatentReadinessScore: Number(finalPatentReadinessScore.toFixed(2)),
    rationale: {
      novelty: `Similarity against prior-art corpus peaked at ${Math.round(maxSimilarity * 100)}%.`,
      legalRisk: typeof llmLegal.reason === "string" ? llmLegal.reason : "Hybrid rule + LLM legal risk estimation.",
      technicalFeasibility: `Feasibility adjusted by evidence terms (${feasibilityHits}) and complexity penalty (${complexityPenalty}).`,
      marketViability: `Market signal terms detected: ${marketHits}.`,
    },
  };
};
