import crypto from "node:crypto";

import type { TimestampRequest, TimestampResponse } from "@/server/intelligence/types";

const hash = (value: string): string => crypto.createHash("sha256").update(value).digest("hex");

const stableSerialize = (value: unknown): string => {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableSerialize(entry)).join(",")}]`;

  const entries = Object.entries(value as Record<string, unknown>).sort((a, b) => a[0].localeCompare(b[0]));
  return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`).join(",")}}`;
};

export const issueTimestampCertificate = async (
  request: TimestampRequest
): Promise<TimestampResponse> => {
  const normalizedIdea = (request.ideaText || "").trim();
  const submitterId = request.submitterId || "anonymous";
  const metadataText = stableSerialize(request.metadata || {});

  const ideaHash = hash(normalizedIdea);
  const previousSeed = process.env.AETHER_TIMESTAMP_GENESIS || "aether-genesis-block";
  const previousHash = hash(`${previousSeed}:${submitterId}:${metadataText}`);

  const timestamp = new Date().toISOString();
  const blockHash = hash(`${previousHash}:${ideaHash}:${timestamp}`);
  const certificateId = `CERT-${timestamp.replace(/[-:.TZ]/g, "").slice(0, 14)}-${ideaHash.slice(0, 10).toUpperCase()}`;

  return {
    certificateId,
    ideaHash,
    previousHash,
    blockHash,
    timestamp,
  };
};
