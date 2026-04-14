import type { PatentLandscapeRequest, PatentLandscapeResponse, PriorArtItem } from "@/server/intelligence/types";
import { deterministicEmbedding, inferTrendDirection, kMeans, parseYear, topKeywords } from "@/server/intelligence/utils";

const clusterLabel = (items: PriorArtItem[]): string => {
  const keywordPool = items
    .flatMap((item) => topKeywords(`${item.title} ${item.abstract}`, 5))
    .slice(0, 30);

  const counts = new Map<string, number>();
  for (const keyword of keywordPool) counts.set(keyword, (counts.get(keyword) || 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([keyword]) => keyword);
  return top.length ? top.join(" / ") : "Unlabeled cluster";
};

export const analyzeLandscape = async (request: PatentLandscapeRequest): Promise<PatentLandscapeResponse> => {
  const patents = request.patents || [];

  const organizationCounts = new Map<string, number>();
  for (const patent of patents) {
    const org = (patent.assignee || "Unknown").trim() || "Unknown";
    organizationCounts.set(org, (organizationCounts.get(org) || 0) + 1);
  }

  const topOrganizations = [...organizationCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([organization, count]) => ({ organization, count }));

  const vectors = patents.map((item) => deterministicEmbedding(`${item.title} ${item.abstract}`));
  const clusterCount = request.clusters ?? Math.min(4, Math.max(2, patents.length || 2));
  const { assignments } = kMeans(vectors, clusterCount, 10);

  const grouped = new Map<number, PriorArtItem[]>();
  assignments.forEach((clusterId, index) => {
    const current = grouped.get(clusterId) || [];
    current.push(patents[index]);
    grouped.set(clusterId, current);
  });

  const patentClusterCategories = [...grouped.entries()].map(([clusterId, items]) => {
    const representativeKeywords = topKeywords(items.map((item) => `${item.title} ${item.abstract}`).join(" "), 6);
    return {
      clusterId,
      label: clusterLabel(items),
      count: items.length,
      representativeKeywords,
    };
  });

  const years = patents.map((item) => parseYear(item.publishedAt)).filter((year): year is number => year !== null);
  const trendDirection = inferTrendDirection(years);

  const occupiedKeywords = new Set(patents.flatMap((item) => topKeywords(`${item.title} ${item.abstract}`, 8)));
  const whiteSpaceOpportunities = [
    "privacy-preserving workflow orchestration",
    "domain-specific compliance automation",
    "edge deployment optimization",
    "human-in-the-loop validation pipelines",
    "explainability-first decision layers",
  ].filter((candidate) => !occupiedKeywords.has(candidate.split(" ")[0])).slice(0, 4);

  return {
    topOrganizations,
    patentClusterCategories,
    trendDirection,
    whiteSpaceOpportunities,
  };
};
