import { NextResponse } from "next/server";

import { badRequest, parseJsonBody, serverError } from "@/server/intelligence/http";
import { buildTeam } from "@/server/intelligence/modules/teamBuilder";
import type { TeamBuilderRequest } from "@/server/intelligence/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: "/api/intelligence/team-builder",
    accepts: ["POST"],
    message: "Telemetry probe OK. Use POST with ideaText and collaboratorPool.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<TeamBuilderRequest>(request);
    const ideaText = (body?.ideaText || "").trim();
    if (!ideaText) return badRequest("ideaText is required.");

    const data = await buildTeam({
      ideaText,
      priorArt: body?.priorArt || [],
      collaboratorPool: body?.collaboratorPool || [],
      topN: body?.topN,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return serverError(error);
  }
}
