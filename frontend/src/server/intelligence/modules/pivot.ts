import type { RuntimeContext } from "@/server/intelligence/context";
import type { BaseIdeaRequest, IdeaImproverResponse, PivotSuggestion } from "@/server/intelligence/types";
import { topKeywords } from "@/server/intelligence/utils";

const defaultPivotSuggestions = (ideaText: string): IdeaImproverResponse => {
  const keywords = topKeywords(ideaText, 6);
  const pivots: PivotSuggestion[] = [
    {
      title: "Different data source strategy",
      action: "Use a proprietary or institution-specific dataset pipeline instead of public baseline corpora.",
      expectedImpact: "Reduces overlap with common patent claims and improves novelty positioning.",
    },
    {
      title: "Narrow technical claim scope",
      action: "Split the solution into a core algorithm claim plus an implementation workflow claim.",
      expectedImpact: "Improves defensibility and lowers legal conflict surface.",
    },
    {
      title: "System-level architecture differentiation",
      action: "Introduce a security/latency optimization layer as a claimable architectural differentiator.",
      expectedImpact: "Moves claims from generic features toward protectable technical implementation.",
    },
  ];

  return {
    suggestedPivots: pivots,
    domainShiftRecommendations: [
      `Evaluate adjacency in applied ${keywords[0] || "automation"} workflows.`,
      "Explore regulated-industry variants where compliance constraints create claimable novelty.",
    ],
    architectureImprovements: [
      "Use modular service boundaries for algorithm, evidence, and explainability layers.",
      "Add auditability and reproducibility hooks to strengthen patent narrative quality.",
    ],
  };
};

export const improveIdea = async (
  request: BaseIdeaRequest,
  context: RuntimeContext
): Promise<IdeaImproverResponse> => {
  const overlapContext = request.priorArt
    ?.map((item) => `- ${item.title}: ${item.abstract.slice(0, 200)}`)
    .join("\n");

  const fallback = defaultPivotSuggestions(context.secureIdea.scrubbedIdeaText);

  const llmJson = await context.llm.generateJson(
    `You are an R&D strategy engine.
Return strict JSON with keys: suggestedPivots, domainShiftRecommendations, architectureImprovements.
Each pivot must include title, action, expectedImpact.
Be specific and actionable, not generic.
Idea: ${context.secureIdea.scrubbedIdeaText}
Prior-art overlaps:\n${overlapContext || "None supplied"}`,
    fallback as unknown as Record<string, unknown>
  );

  const parsedPivots = Array.isArray(llmJson.suggestedPivots)
    ? llmJson.suggestedPivots
        .filter((item) => item && typeof item === "object")
        .map((item: any) => ({
          title: String(item.title || "Targeted pivot"),
          action: String(item.action || "Refactor architecture scope for a narrower claim envelope."),
          expectedImpact: String(item.expectedImpact || "Reduces overlap while improving technical differentiation."),
        }))
    : fallback.suggestedPivots;

  return {
    suggestedPivots: parsedPivots.length ? parsedPivots : fallback.suggestedPivots,
    domainShiftRecommendations: Array.isArray(llmJson.domainShiftRecommendations)
      ? llmJson.domainShiftRecommendations.map((item) => String(item))
      : fallback.domainShiftRecommendations,
    architectureImprovements: Array.isArray(llmJson.architectureImprovements)
      ? llmJson.architectureImprovements.map((item) => String(item))
      : fallback.architectureImprovements,
  };
};
