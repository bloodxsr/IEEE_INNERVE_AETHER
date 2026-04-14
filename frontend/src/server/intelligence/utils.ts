import crypto from "node:crypto";

export const clamp = (value: number, min = 0, max = 100): number => Math.max(min, Math.min(max, value));

export const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter(Boolean);

export const unique = <T>(items: T[]): T[] => Array.from(new Set(items));

export const topKeywords = (text: string, max = 12): string[] => {
  const stopWords = new Set([
    "the",
    "and",
    "for",
    "with",
    "from",
    "that",
    "this",
    "into",
    "using",
    "use",
    "into",
    "about",
    "have",
    "has",
    "will",
    "can",
    "are",
    "is",
    "of",
    "to",
    "in",
    "on",
    "a",
    "an",
  ]);

  const counts = new Map<string, number>();
  for (const token of tokenize(text)) {
    if (token.length < 3 || stopWords.has(token)) continue;
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([token]) => token);
};

export const deterministicEmbedding = (text: string, dim = 256): number[] => {
  const vector = Array.from({ length: dim }, () => 0);
  const tokens = tokenize(text);
  if (tokens.length === 0) return vector;

  for (const token of tokens) {
    const digest = crypto.createHash("sha256").update(token).digest("hex");
    const slot = parseInt(digest.slice(0, 8), 16) % dim;
    const sign = parseInt(digest.slice(8, 10), 16) % 2 === 0 ? 1 : -1;
    const weight = 0.5 + parseInt(digest.slice(10, 14), 16) / 65535;
    vector[slot] += sign * weight;
  }

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (norm === 0) return vector;
  return vector.map((value) => value / norm);
};

export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (!a.length || !b.length || a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const average = (values: number[]): number => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export const weightedScore = (
  scores: Record<string, number>,
  weights: Record<string, number>
): number => {
  let numerator = 0;
  let denominator = 0;

  for (const [key, score] of Object.entries(scores)) {
    const weight = weights[key] ?? 0;
    numerator += score * weight;
    denominator += weight;
  }

  if (denominator === 0) return 0;
  return clamp(numerator / denominator, 0, 100);
};

export const inferTrendDirection = (years: number[]): "increasing" | "decreasing" | "stable" | "insufficient-data" => {
  if (years.length < 3) return "insufficient-data";

  const grouped = new Map<number, number>();
  for (const year of years) {
    grouped.set(year, (grouped.get(year) || 0) + 1);
  }

  const sorted = [...grouped.entries()].sort((a, b) => a[0] - b[0]);
  if (sorted.length < 3) return "insufficient-data";

  const first = average(sorted.slice(0, Math.ceil(sorted.length / 2)).map((entry) => entry[1]));
  const second = average(sorted.slice(Math.ceil(sorted.length / 2)).map((entry) => entry[1]));

  if (second > first * 1.15) return "increasing";
  if (second < first * 0.85) return "decreasing";
  return "stable";
};

export const parseYear = (value?: string | null): number | null => {
  if (!value) return null;
  const match = value.match(/(19|20)\d{2}/);
  if (!match) return null;
  return Number(match[0]);
};

export const kMeans = (
  vectors: number[][],
  clusters: number,
  iterations = 12
): { assignments: number[]; centroids: number[][] } => {
  if (!vectors.length) return { assignments: [], centroids: [] };

  const k = Math.max(2, Math.min(clusters, vectors.length));
  const dim = vectors[0].length;

  let centroids = vectors.slice(0, k).map((vector) => vector.slice());
  let assignments = Array.from({ length: vectors.length }, () => 0);

  for (let iter = 0; iter < iterations; iter += 1) {
    assignments = vectors.map((vector) => {
      let best = 0;
      let bestScore = Number.POSITIVE_INFINITY;

      for (let c = 0; c < centroids.length; c += 1) {
        let dist = 0;
        for (let i = 0; i < dim; i += 1) {
          const delta = vector[i] - centroids[c][i];
          dist += delta * delta;
        }
        if (dist < bestScore) {
          best = c;
          bestScore = dist;
        }
      }

      return best;
    });

    const nextCentroids = Array.from({ length: k }, () => Array.from({ length: dim }, () => 0));
    const counts = Array.from({ length: k }, () => 0);

    assignments.forEach((cluster, index) => {
      counts[cluster] += 1;
      for (let i = 0; i < dim; i += 1) {
        nextCentroids[cluster][i] += vectors[index][i];
      }
    });

    for (let c = 0; c < k; c += 1) {
      if (counts[c] === 0) continue;
      for (let i = 0; i < dim; i += 1) {
        nextCentroids[c][i] /= counts[c];
      }
    }

    centroids = nextCentroids;
  }

  return { assignments, centroids };
};

export const inferDomain = (text: string): string => {
  const lower = text.toLowerCase();

  if (/biotech|genome|protein|drug|clinical|diagnostic/.test(lower)) return "Biotechnology";
  if (/battery|motor|power electronics|pcb|signal|antenna/.test(lower)) return "Electrical Engineering";
  if (/cad|robot|mechanical|manufactur|thermal|fluid/.test(lower)) return "Mechanical Engineering";
  if (/legal|compliance|contract|policy|patent law/.test(lower)) return "LegalTech";
  if (/model|ai|ml|llm|data|algorithm|software|cloud/.test(lower)) return "Software and AI";
  return "General Technology";
};

export const extractRequiredSkills = (ideaText: string): string[] => {
  const keywords = tokenize(ideaText);
  const skills = new Set<string>();

  const skillMap: Array<[RegExp, string[]]> = [
    [/(llm|nlp|transformer|prompt)/, ["LLM", "NLP"]],
    [/(vector|embedding|semantic)/, ["VECTOR DB", "EMBEDDINGS"]],
    [/(react|typescript|frontend|ui)/, ["REACT", "TYPESCRIPT", "UI ENGINEERING"]],
    [/(backend|api|microservice|fastapi|node)/, ["API DESIGN", "BACKEND ENGINEERING"]],
    [/(hardware|sensor|iot|edge|firmware)/, ["EMBEDDED SYSTEMS", "IOT"]],
    [/(cad|mechanical|simulation)/, ["CAD", "SIMULATION"]],
    [/(market|customer|business|startup|gtm)/, ["PRODUCT STRATEGY", "GO-TO-MARKET"]],
    [/(legal|patent|ip|compliance)/, ["IP LAW", "PATENT ANALYSIS"]],
  ];

  const joined = keywords.join(" ");
  for (const [pattern, mappedSkills] of skillMap) {
    if (pattern.test(joined)) {
      for (const skill of mappedSkills) skills.add(skill);
    }
  }

  if (skills.size === 0) {
    skills.add("DOMAIN EXPERTISE");
    skills.add("R&D");
  }

  return [...skills];
};
