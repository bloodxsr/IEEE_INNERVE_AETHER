import { NextResponse } from "next/server";

import { badRequest, parseJsonBody, serverError } from "@/server/intelligence/http";
import { analyzeLandscape } from "@/server/intelligence/modules/landscape";
import type { PatentLandscapeRequest } from "@/server/intelligence/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: "/api/intelligence/landscape",
    accepts: ["POST"],
    message: "Telemetry probe OK. Use POST with patents to analyze landscape.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<PatentLandscapeRequest>(request);
    const patents = body?.patents || [];
    if (!Array.isArray(patents) || patents.length === 0) {
      return badRequest("patents array is required.");
    }

    const data = await analyzeLandscape({
      patents,
      clusters: body?.clusters,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return serverError(error);
  }
}
