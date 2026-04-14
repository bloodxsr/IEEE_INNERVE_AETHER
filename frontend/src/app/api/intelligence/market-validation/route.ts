import { NextResponse } from "next/server";

import { badRequest, parseJsonBody, serverError } from "@/server/intelligence/http";
import { validateMarket } from "@/server/intelligence/modules/market";
import type { MarketValidationRequest } from "@/server/intelligence/types";
import { inferDomain, topKeywords } from "@/server/intelligence/utils";

interface MarketRouteRequest extends Partial<MarketValidationRequest> {
  ideaText?: string;
}

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: "/api/intelligence/market-validation",
    accepts: ["POST"],
    message: "Telemetry probe OK. Use POST with ideaText or domain and keywords.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<MarketRouteRequest>(request);

    const ideaText = (body?.ideaText || "").trim();
    const ideaDomain = (body?.ideaDomain || "").trim() || (ideaText ? inferDomain(ideaText) : "");
    const keywords = Array.isArray(body?.keywords) && body?.keywords.length > 0 ? body.keywords : topKeywords(ideaText, 12);

    if (!ideaDomain) {
      return badRequest("Provide ideaText or ideaDomain.");
    }

    const data = await validateMarket({ ideaDomain, keywords });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return serverError(error);
  }
}
