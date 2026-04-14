import { NextResponse } from "next/server";

import { createRuntimeContext } from "@/server/intelligence/context";
import { badRequest, getClientIp, parseJsonBody, serverError } from "@/server/intelligence/http";
import { improveIdea } from "@/server/intelligence/modules/pivot";
import type { BaseIdeaRequest } from "@/server/intelligence/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: "/api/intelligence/pivot",
    accepts: ["POST"],
    message: "Telemetry probe OK. Use POST with ideaText for pivot suggestions.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<BaseIdeaRequest>(request);
    const ideaText = (body?.ideaText || "").trim();
    if (!ideaText) return badRequest("ideaText is required.");

    const context = createRuntimeContext(ideaText, getClientIp(request));
    const data = await improveIdea(
      {
        ideaText,
        priorArt: body?.priorArt || [],
      },
      context
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return serverError(error);
  }
}
