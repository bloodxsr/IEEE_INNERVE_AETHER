import { NextResponse } from "next/server";

import { badRequest, parseJsonBody, serverError } from "@/server/intelligence/http";
import { recommendPrototype } from "@/server/intelligence/modules/prototype";
import type { PrototypeRecommendationRequest } from "@/server/intelligence/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: "/api/intelligence/prototype-recommendation",
    accepts: ["POST"],
    message: "Telemetry probe OK. Use POST with ideaText for stack recommendation.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<PrototypeRecommendationRequest>(request);
    const ideaText = (body?.ideaText || "").trim();
    if (!ideaText) return badRequest("ideaText is required.");

    const data = await recommendPrototype({
      ideaText,
      priorArt: body?.priorArt || [],
      domain: body?.domain,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return serverError(error);
  }
}
