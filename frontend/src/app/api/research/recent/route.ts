import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ResearchPaper = {
  id: string;
  title: string;
  summary: string;
  published: string;
  updated: string;
  link: string;
  pdfUrl: string | null;
  authors: string[];
  primaryCategory: string;
  categories: string[];
};

const normalizeText = (value: string) =>
  value
    .replace(/\s+/g, " ")
    .trim();

const summarizeText = (value: string, maxLength = 420) => {
  const cleaned = normalizeText(value);
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength - 1)}...`;
};

const rebuildAbstract = (invertedIndex: Record<string, number[]> | null | undefined) => {
  if (!invertedIndex || typeof invertedIndex !== "object") {
    return "";
  }

  const words: string[] = [];
  for (const [token, positions] of Object.entries(invertedIndex)) {
    if (!Array.isArray(positions)) {
      continue;
    }

    positions.forEach((position) => {
      if (typeof position === "number" && position >= 0 && Number.isFinite(position)) {
        words[position] = token;
      }
    });
  }

  return normalizeText(words.filter(Boolean).join(" "));
};

const buildSearchQuery = (query: string, domain: string) => {
  const combined = `${query} ${domain}`.replace(/\s+/g, " ").trim();
  const tokens = combined
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean)
    .slice(0, 8);

  if (tokens.length === 0) {
    return "engineering innovation";
  }

  return tokens.join(" ");
};

const buildFallbackSearchQuery = (query: string, domain: string) => {
  const queryToken = query
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean)[0];
  const domainToken = domain
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean)[0];

  if (queryToken && domainToken) {
    return `${queryToken} ${domainToken} research`;
  }

  if (queryToken) {
    return `${queryToken} research innovation`;
  }

  if (domainToken) {
    return `${domainToken} research innovation`;
  }

  return "research innovation";
};

const mapOpenAlexResults = (rawResults: any[]): ResearchPaper[] => {
  return rawResults
    .map((item: any): ResearchPaper | null => {
      const title = normalizeText(item?.title || item?.display_name || "");
      if (!title) {
        return null;
      }

      const abstract = rebuildAbstract(item?.abstract_inverted_index);
      const summary = summarizeText(abstract || title);

      const authors = Array.isArray(item?.authorships)
        ? item.authorships
            .map((authorship: any) => normalizeText(authorship?.author?.display_name || ""))
            .filter(Boolean)
            .slice(0, 8)
        : [];

      const categoryFromTopic = normalizeText(
        item?.primary_topic?.field?.display_name || item?.primary_topic?.display_name || ""
      );
      const conceptCategories = Array.isArray(item?.concepts)
        ? item.concepts
            .map((concept: any) => normalizeText(concept?.display_name || ""))
            .filter(Boolean)
            .slice(0, 5)
        : [];

      const primaryCategory = categoryFromTopic || conceptCategories[0] || "General";
      const categories = Array.from(new Set([primaryCategory, ...conceptCategories])).slice(0, 6);

      const link =
        item?.primary_location?.landing_page_url ||
        item?.best_oa_location?.landing_page_url ||
        item?.id ||
        "";

      const pdfUrl =
        item?.best_oa_location?.pdf_url ||
        item?.primary_location?.pdf_url ||
        item?.open_access?.oa_url ||
        null;

      const published = normalizeText(item?.publication_date || "") || new Date().toISOString();
      const updated = normalizeText(item?.updated_date || item?.publication_date || "") || new Date().toISOString();

      return {
        id: normalizeText(item?.id || item?.doi || item?.ids?.openalex || "") || `paper-${title.slice(0, 24)}`,
        title,
        summary,
        published,
        updated,
        link,
        pdfUrl,
        authors,
        primaryCategory,
        categories,
      };
    })
    .filter((paper): paper is ResearchPaper => paper !== null);
};

const fetchOpenAlexFeed = async (searchQuery: string, maxResults: number) => {
  const openAlexUrl = `https://api.openalex.org/works?search=${encodeURIComponent(
    searchQuery
  )}&sort=publication_date:desc&per-page=${maxResults}`;

  const response = await fetch(openAlexUrl, {
    method: "GET",
    cache: "no-store",
    headers: {
      "User-Agent": "AetherResearchFeed/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`OpenAlex feed request failed with status ${response.status}`);
  }

  return response.json();
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("query") || "").trim();
  const domain = (url.searchParams.get("domain") || "").trim();

  const parsedMax = Number(url.searchParams.get("max") || "12");
  const maxResults = Number.isFinite(parsedMax) ? Math.min(24, Math.max(4, parsedMax)) : 12;

  const searchQuery = buildSearchQuery(query, domain);

  try {
    const primaryPayload = await fetchOpenAlexFeed(searchQuery, maxResults);
    const primaryResults = Array.isArray(primaryPayload?.results) ? primaryPayload.results : [];
    let papers = mapOpenAlexResults(primaryResults).slice(0, maxResults);
    let resolvedQuery = searchQuery;

    if (papers.length === 0) {
      const fallbackQuery = buildFallbackSearchQuery(query, domain);
      if (fallbackQuery !== searchQuery) {
        const fallbackPayload = await fetchOpenAlexFeed(fallbackQuery, maxResults);
        const fallbackResults = Array.isArray(fallbackPayload?.results) ? fallbackPayload.results : [];
        papers = mapOpenAlexResults(fallbackResults).slice(0, maxResults);
        resolvedQuery = fallbackQuery;
      }
    }

    return NextResponse.json({
      success: true,
      query: resolvedQuery,
      lastUpdated: new Date().toISOString(),
      papers,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unable to load recent research papers.",
        query: searchQuery,
        lastUpdated: new Date().toISOString(),
        papers: [],
      },
      { status: 502 }
    );
  }
}
