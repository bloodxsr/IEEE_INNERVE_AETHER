import { NextResponse } from "next/server";

import { badRequest, getClientIp, parseJsonBody, serverError } from "@/server/intelligence/http";
import { runIntelligencePipeline } from "@/server/intelligence/pipeline";
import type { PipelineRequest } from "@/server/intelligence/types";

interface PipelineRouteRequest extends PipelineRequest {
  submitterId?: string;
}

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: "/api/intelligence/pipeline",
    accepts: ["POST"],
    message: "Telemetry probe OK. Use POST with ideaText to run full pipeline.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<PipelineRouteRequest>(request);
    const ideaText = (body?.ideaText || "").trim();
    if (!ideaText) return badRequest("ideaText is required.");

    const data = await runIntelligencePipeline(
      {
        ideaText,
        priorArt: body?.priorArt || [],
        collaboratorPool: body?.collaboratorPool || [],
        plagiarismCorpus: body?.plagiarismCorpus || [],
      },
      {
        clientIp: getClientIp(request),
        submitterId: body?.submitterId,
      }
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return serverError(error);
  }
}
