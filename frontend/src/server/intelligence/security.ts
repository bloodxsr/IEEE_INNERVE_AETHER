import crypto from "node:crypto";

import { scrubPII } from "@/lib/armorclaw";

export interface SecureIngestRecord {
  ingestedAt: string;
  scrubbedIdeaText: string;
  ipHash: string;
  payloadHash: string;
  payloadSignature: string;
  zeroSyntheticData: true;
}

const hash = (value: string): string => crypto.createHash("sha256").update(value).digest("hex");

export const secureIngest = (ideaText: string, clientIp: string): SecureIngestRecord => {
  const scrubbedIdeaText = scrubPII(ideaText || "");
  const salt = process.env.ARMORCLAW_IP_SALT || "aether-secure-salt";
  const signingKey = process.env.ARMORCLAW_AES_KEY_BASE64 || salt;

  const ipHash = hash(`${salt}:${clientIp || "unknown"}`);
  const ingestedAt = new Date().toISOString();
  const payloadHash = hash(`${scrubbedIdeaText}:${ipHash}:${ingestedAt}`);
  const payloadSignature = crypto
    .createHmac("sha256", signingKey)
    .update(payloadHash)
    .digest("hex");

  return {
    ingestedAt,
    scrubbedIdeaText,
    ipHash,
    payloadHash,
    payloadSignature,
    zeroSyntheticData: true,
  };
};
