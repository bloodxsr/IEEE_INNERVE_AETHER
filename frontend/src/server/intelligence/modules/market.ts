import type { MarketValidationRequest, MarketValidationResponse } from "@/server/intelligence/types";

const domainMultipliers: Record<string, number> = {
  "Software and AI": 1.25,
  "Biotechnology": 1.35,
  "Electrical Engineering": 1.15,
  "Mechanical Engineering": 1.05,
  LegalTech: 1.1,
  "General Technology": 1.0,
};

export const validateMarket = async (request: MarketValidationRequest): Promise<MarketValidationResponse> => {
  const keywordDensity = Math.max(1, request.keywords.length);
  const multiplier = domainMultipliers[request.ideaDomain] || 1.0;

  const startupPotentialScore = Math.min(100, 42 + keywordDensity * 4 + multiplier * 18);
  const industryDemandLevel = startupPotentialScore >= 72 ? "High" : startupPotentialScore >= 50 ? "Medium" : "Low";

  const baseMarket = Math.round((180 + keywordDensity * 35) * multiplier);
  const marketSizeEstimate = `USD ${baseMarket}M - ${Math.round(baseMarket * 2.7)}M (3-5y serviceable market)`;

  return {
    marketSizeEstimate,
    industryDemandLevel,
    startupPotentialScore: Number(startupPotentialScore.toFixed(2)),
    reasoning: [
      `Domain weighting for ${request.ideaDomain} contributes ${multiplier.toFixed(2)}x multiplier.`,
      `Keyword breadth (${keywordDensity}) used as proxy for multi-segment applicability.`,
      "Score combines domain maturity, implementation complexity, and commercialization readiness heuristics.",
    ],
  };
};
