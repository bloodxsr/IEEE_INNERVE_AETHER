import { NextResponse } from "next/server";

import { badRequest, parseJsonBody, serverError } from "@/server/intelligence/http";
import { detectPlagiarismRisk } from "@/server/intelligence/modules/plagiarism";
import type { PlagiarismRiskRequest, PriorArtItem } from "@/server/intelligence/types";

interface PlagiarismRouteRequest extends Partial<PlagiarismRiskRequest> {
  priorArt?: PriorArtItem[];
}

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: "/api/intelligence/plagiarism",
    accepts: ["POST"],
    message: "Telemetry probe OK. Use POST with ideaText and corpus/priorArt.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<PlagiarismRouteRequest>(request);
    const ideaText = (body?.ideaText || "").trim();
    if (!ideaText) return badRequest("ideaText is required.");

    const corpus =
      body?.corpus ||
      (body?.priorArt || []).map((item) => ({
        sourceId: item.id,
        sourceType: "patent" as const,
        text: `${item.title}\n${item.abstract}`,
      }));

    if (!Array.isArray(corpus) || corpus.length === 0) {
      return badRequest("corpus or priorArt is required for plagiarism analysis.");
    }

    const data = await detectPlagiarismRisk({ ideaText, corpus });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return serverError(error);
  }
}
