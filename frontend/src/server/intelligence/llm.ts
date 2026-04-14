import { GoogleGenAI } from "@google/genai";

import { deterministicEmbedding } from "@/server/intelligence/utils";

const parseJsonObject = (text: string): Record<string, unknown> | null => {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // noop
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[0]);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }

  return null;
};

const extractText = (response: any): string => {
  const text = response?.text;
  if (typeof text === "string" && text.trim()) return text.trim();

  const candidates = response?.candidates;
  if (Array.isArray(candidates)) {
    for (const candidate of candidates) {
      const parts = candidate?.content?.parts;
      if (!Array.isArray(parts)) continue;
      const merged = parts
        .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
        .join("\n")
        .trim();
      if (merged) return merged;
    }
  }

  return "";
};

export class LlmRuntime {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly embeddingModels: string[];
  private readonly client: GoogleGenAI | null;

  constructor(options: { apiKey: string; model: string; embeddingModels: string[] }) {
    this.apiKey = options.apiKey;
    this.model = options.model;
    this.embeddingModels = options.embeddingModels;
    this.client = this.apiKey ? new GoogleGenAI({ apiKey: this.apiKey }) : null;
  }

  async generateText(prompt: string, modelOverride?: string): Promise<string> {
    if (!this.client) {
      return "Fallback output: model unavailable; used deterministic backend logic.";
    }

    const model = modelOverride || this.model;
    const response = await this.client.models.generateContent({ model, contents: prompt });
    const text = extractText(response);
    return text || "";
  }

  async generateJson<T extends Record<string, unknown>>(prompt: string, fallback: T): Promise<T> {
    try {
      const text = await this.generateText(prompt);
      const parsed = parseJsonObject(text);
      if (!parsed) return fallback;
      return { ...fallback, ...parsed } as T;
    } catch {
      return fallback;
    }
  }

  async embed(text: string): Promise<number[]> {
    if (!this.client) {
      return deterministicEmbedding(text);
    }

    let lastError: unknown;

    for (const model of this.embeddingModels) {
      try {
        const response = await this.client.models.embedContent({ model, contents: text });
        const values = response?.embeddings?.[0]?.values;
        if (Array.isArray(values) && values.length > 0) {
          return values.map((value) => Number(value)).filter((value) => Number.isFinite(value));
        }
      } catch (error) {
        lastError = error;
        continue;
      }
    }

    if (lastError) {
      return deterministicEmbedding(text);
    }

    return deterministicEmbedding(text);
  }
}
