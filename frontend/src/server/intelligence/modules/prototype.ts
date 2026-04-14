import type {
  PrototypeRecommendationRequest,
  PrototypeRecommendationResponse,
} from "@/server/intelligence/types";
import { inferDomain, topKeywords } from "@/server/intelligence/utils";

const domainPlaybook: Record<
  string,
  { stack: string[]; tools: string[]; cost: string; timeline: string; rationale: string[] }
> = {
  "Software and AI": {
    stack: ["TypeScript", "Node.js API", "Pinecone", "Gemini", "PostgreSQL"],
    tools: ["Docker", "GitHub Actions", "Jupyter", "Postman", "Vercel"],
    cost: "USD 2,500 - 12,000",
    timeline: "8-14 weeks",
    rationale: [
      "Rapid MVP possible with managed inference and vector infrastructure.",
      "API-first design shortens productization cycle.",
    ],
  },
  Biotechnology: {
    stack: ["TypeScript", "Rust", "WASM compute", "ML Ops", "Data Lake"],
    tools: ["Benchling", "Snakemake", "Notebook workflows", "Cloud GPU"],
    cost: "USD 15,000 - 90,000",
    timeline: "16-40 weeks",
    rationale: [
      "Validation cycles are experiment-heavy and compliance-aware.",
      "Lab integration increases setup cost and lead time.",
    ],
  },
  "Electrical Engineering": {
    stack: ["Embedded C/C++", "Rust", "Edge Runtime", "Telemetry Backend"],
    tools: ["KiCad/Altium", "MATLAB", "Oscilloscope", "Hardware-in-loop rig"],
    cost: "USD 8,000 - 45,000",
    timeline: "12-28 weeks",
    rationale: [
      "Prototype success depends on hardware iteration quality.",
      "Firmware + instrumentation drives core delivery risk.",
    ],
  },
  "Mechanical Engineering": {
    stack: ["Simulation pipeline", "Control firmware", "Analytics backend"],
    tools: ["SolidWorks", "ANSYS", "Fusion 360", "Test bench instrumentation"],
    cost: "USD 10,000 - 70,000",
    timeline: "14-32 weeks",
    rationale: [
      "Mechanical validation requires iterative physical testing.",
      "Tooling and prototyping cycles dominate timeline.",
    ],
  },
  LegalTech: {
    stack: ["TypeScript", "Retrieval pipeline", "Policy rule engine", "Audit trail DB"],
    tools: ["Document parsers", "Workflow automation", "Compliance sandbox"],
    cost: "USD 4,000 - 20,000",
    timeline: "10-20 weeks",
    rationale: [
      "Domain accuracy and explainability are key adoption drivers.",
      "Regulatory reliability impacts rollout sequence.",
    ],
  },
};

export const recommendPrototype = async (
  request: PrototypeRecommendationRequest
): Promise<PrototypeRecommendationResponse> => {
  const domain = request.domain || inferDomain(request.ideaText);
  const selected = domainPlaybook[domain] || domainPlaybook["Software and AI"];
  const keywords = topKeywords(request.ideaText, 5);

  return {
    suggestedTechStack: selected.stack,
    recommendedTools: selected.tools,
    estimatedCostRange: selected.cost,
    developmentTimeline: selected.timeline,
    rationale: [...selected.rationale, `Primary concept anchors: ${keywords.join(", ") || "general innovation"}.`],
  };
};
