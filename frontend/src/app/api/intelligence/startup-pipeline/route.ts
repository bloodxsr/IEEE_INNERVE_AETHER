import { NextResponse } from "next/server";

import { badRequest, parseJsonBody, serverError } from "@/server/intelligence/http";
import { buildStartupAssets } from "@/server/intelligence/modules/startup";
import type { StartupPipelineRequest } from "@/server/intelligence/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: "/api/intelligence/startup-pipeline",
    accepts: ["POST"],
    message: "Telemetry probe OK. Use POST with ideaText for startup assets.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<StartupPipelineRequest>(request);
    const ideaText = (body?.ideaText || "").trim();
    if (!ideaText) return badRequest("ideaText is required.");

    const data = await buildStartupAssets({
      ideaText,
      priorArt: body?.priorArt || [],
      marketContext: body?.marketContext,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return serverError(error);
  }
}
