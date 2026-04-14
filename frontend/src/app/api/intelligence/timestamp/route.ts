import { NextResponse } from "next/server";

import { badRequest, parseJsonBody, serverError } from "@/server/intelligence/http";
import { issueTimestampCertificate } from "@/server/intelligence/modules/timestamp";
import type { TimestampRequest } from "@/server/intelligence/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: "/api/intelligence/timestamp",
    accepts: ["POST"],
    message: "Telemetry probe OK. Use POST with ideaText to issue timestamp certificate.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<TimestampRequest>(request);
    const ideaText = (body?.ideaText || "").trim();
    if (!ideaText) return badRequest("ideaText is required.");

    const data = await issueTimestampCertificate({
      ideaText,
      submitterId: body?.submitterId,
      metadata: body?.metadata,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return serverError(error);
  }
}
