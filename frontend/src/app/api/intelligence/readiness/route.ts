import { NextResponse } from "next/server";

import { createRuntimeContext } from "@/server/intelligence/context";
import { badRequest, getClientIp, parseJsonBody, serverError } from "@/server/intelligence/http";
import { scorePatentReadiness } from "@/server/intelligence/modules/readiness";
import type { PatentReadinessRequest } from "@/server/intelligence/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: "/api/intelligence/readiness",
    accepts: ["POST"],
    message: "Telemetry probe OK. Use POST with ideaText for readiness scoring.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<PatentReadinessRequest>(request);
    const ideaText = (body?.ideaText || "").trim();
    if (!ideaText) return badRequest("ideaText is required.");

    const context = createRuntimeContext(ideaText, getClientIp(request));
    const data = await scorePatentReadiness(
      {
        ideaText,
        priorArt: body?.priorArt || [],
        weights: body?.weights,
      },
      context
    );

    return NextResponse.json({
      success: true,
      data,
      ingest: {
        ingestedAt: context.secureIdea.ingestedAt,
        ipHash: context.secureIdea.ipHash,
        zeroSyntheticData: context.secureIdea.zeroSyntheticData,
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
