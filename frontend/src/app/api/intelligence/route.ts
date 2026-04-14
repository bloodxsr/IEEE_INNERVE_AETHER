import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    endpoints: [
      "/api/intelligence/readiness",
      "/api/intelligence/pivot",
      "/api/intelligence/landscape",
      "/api/intelligence/team-builder",
      "/api/intelligence/patent-draft",
      "/api/intelligence/plagiarism",
      "/api/intelligence/market-validation",
      "/api/intelligence/prototype-recommendation",
      "/api/intelligence/startup-pipeline",
      "/api/intelligence/timestamp",
      "/api/intelligence/pipeline",
    ],
  });
}
