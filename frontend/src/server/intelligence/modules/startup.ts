import type { StartupPipelineRequest, StartupPipelineResponse } from "@/server/intelligence/types";
import { inferDomain, topKeywords } from "@/server/intelligence/utils";

export const buildStartupAssets = async (
  request: StartupPipelineRequest
): Promise<StartupPipelineResponse> => {
  const domain = inferDomain(request.ideaText);
  const keywords = topKeywords(request.ideaText, 8);

  const problemStatement =
    `Current ${domain.toLowerCase()} workflows are slow, fragmented, and difficult to scale with consistent quality outcomes.`;

  const valueProposition =
    `Aether translates early research ideas into execution-grade outputs (readiness, draftability, team design) so builders move from concept to defensible product faster.`;

  const pitchOutline = [
    "Problem: R&D teams lose momentum between concept validation and patent-safe execution.",
    "Solution: AI intelligence stack for novelty, legal risk, and productization planning.",
    `Wedge: domain-first rollout starting from ${keywords[0] || "high-friction R&D"} workflows.`,
    "Moat: integrated prior-art retrieval, collaborator matching, and timestamped idea provenance.",
    "Roadmap: pilot with academic labs, then enterprise innovation teams.",
  ];

  const monetizationSuggestions = [
    "SaaS subscriptions by seat with usage-based AI analysis credits.",
    "Enterprise compliance and private-deployment licensing tier.",
    "Premium IP acceleration package (drafting + legal workflow exports).",
  ];

  return {
    problemStatement,
    valueProposition,
    pitchOutline,
    monetizationSuggestions,
  };
};
