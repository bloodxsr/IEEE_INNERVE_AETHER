import { createRuntimeContext } from "@/server/intelligence/context";
import { analyzeLandscape } from "@/server/intelligence/modules/landscape";
import { validateMarket } from "@/server/intelligence/modules/market";
import { generatePatentDraft } from "@/server/intelligence/modules/patentDraft";
import { improveIdea } from "@/server/intelligence/modules/pivot";
import { detectPlagiarismRisk } from "@/server/intelligence/modules/plagiarism";
import { scorePatentReadiness } from "@/server/intelligence/modules/readiness";
import { recommendPrototype } from "@/server/intelligence/modules/prototype";
import { buildStartupAssets } from "@/server/intelligence/modules/startup";
import { issueTimestampCertificate } from "@/server/intelligence/modules/timestamp";
import { buildTeam } from "@/server/intelligence/modules/teamBuilder";
import { fetchLivePatents, retrievePriorArtFromPinecone } from "@/server/intelligence/rag";
import type { PipelineRequest, PipelineResponse, PriorArtItem } from "@/server/intelligence/types";
import { inferDomain, topKeywords } from "@/server/intelligence/utils";

const normalizePriorArt = (items: PriorArtItem[]): PriorArtItem[] => {
  const deduped: PriorArtItem[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const id = (item.id || "").trim();
    const title = (item.title || "Unknown Patent").trim();
    const key = (id || `${title}:${item.sourceUrl || ""}`).toLowerCase();
    if (!key || seen.has(key)) continue;

    seen.add(key);
    deduped.push({
      ...item,
      id: id || `ART-${deduped.length + 1}`,
      title,
      abstract: (item.abstract || "").trim(),
    });
  }

  return deduped;
};

const resolvePriorArt = async (ideaText: string, seedPriorArt: PriorArtItem[], clientIp: string) => {
  if (seedPriorArt.length > 0) return normalizePriorArt(seedPriorArt);

  const context = createRuntimeContext(ideaText, clientIp);
  const [pineconeResults, livePatentResults] = await Promise.all([
    retrievePriorArtFromPinecone(ideaText, context.llm, 8),
    fetchLivePatents(ideaText, context.llm),
  ]);

  return normalizePriorArt([...pineconeResults, ...livePatentResults]);
};

export const runIntelligencePipeline = async (
  request: PipelineRequest,
  options: { clientIp: string; submitterId?: string }
): Promise<PipelineResponse> => {
  const ideaText = (request.ideaText || "").trim();
  const clientIp = options.clientIp;

  const priorArt = await resolvePriorArt(ideaText, request.priorArt || [], clientIp);
  const context = createRuntimeContext(ideaText, clientIp);

  const readiness = await scorePatentReadiness({ ideaText, priorArt }, context);
  const pivots = await improveIdea({ ideaText, priorArt }, context);
  const landscape = await analyzeLandscape({ patents: priorArt });
  const teamBuilder = await buildTeam({
    ideaText,
    priorArt,
    collaboratorPool: request.collaboratorPool || [],
    topN: 5,
  });
  const patentDraft = await generatePatentDraft({ ideaText, priorArt }, context);
  const plagiarismRisk = await detectPlagiarismRisk({
    ideaText,
    corpus:
      request.plagiarismCorpus ||
      priorArt.map((item) => ({
        sourceId: item.id,
        sourceType: "patent" as const,
        text: `${item.title}\n${item.abstract}`,
      })),
  });

  const ideaDomain = inferDomain(ideaText);
  const marketValidation = await validateMarket({
    ideaDomain,
    keywords: topKeywords(ideaText, 12),
  });

  const prototypeRecommendation = await recommendPrototype({
    ideaText,
    priorArt,
    domain: ideaDomain,
  });

  const startupPipeline = await buildStartupAssets({
    ideaText,
    priorArt,
    marketContext: marketValidation.marketSizeEstimate,
  });

  const timestampCertificate = await issueTimestampCertificate({
    ideaText,
    submitterId: options.submitterId,
    metadata: {
      clientIpHash: context.secureIdea.ipHash,
      priorArtCount: priorArt.length,
      readinessScore: readiness.finalPatentReadinessScore,
    },
  });

  return {
    readiness,
    pivots,
    landscape,
    teamBuilder,
    patentDraft,
    plagiarismRisk,
    marketValidation,
    prototypeRecommendation,
    startupPipeline,
    timestampCertificate,
  };
};
