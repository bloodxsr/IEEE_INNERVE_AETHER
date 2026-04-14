import type { PlagiarismRiskRequest, PlagiarismRiskResponse } from "@/server/intelligence/types";
import { clamp, cosineSimilarity, deterministicEmbedding, topKeywords } from "@/server/intelligence/utils";

export const detectPlagiarismRisk = async (request: PlagiarismRiskRequest): Promise<PlagiarismRiskResponse> => {
  const ideaVec = deterministicEmbedding(request.ideaText);
  const ideaKeywords = new Set(topKeywords(request.ideaText, 16));

  const overlaps = request.corpus
    .map((source) => {
      const sourceVec = deterministicEmbedding(source.text);
      const similarity = cosineSimilarity(ideaVec, sourceVec);
      const sourceKeywords = topKeywords(source.text, 16);
      const overlappingConcepts = sourceKeywords.filter((keyword) => ideaKeywords.has(keyword)).slice(0, 6);

      return {
        sourceId: source.sourceId,
        sourceType: source.sourceType,
        similarity: Number(clamp(similarity * 100, 0, 100).toFixed(2)),
        overlappingConcepts,
      };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 8);

  const topSimilarity = overlaps.length ? overlaps[0].similarity : 0;
  const similarityScore = Number(clamp(topSimilarity, 0, 100).toFixed(2));

  const riskLevel = similarityScore >= 75 ? "High" : similarityScore >= 45 ? "Medium" : "Low";

  return {
    similarityScore,
    overlaps,
    riskLevel,
  };
};
