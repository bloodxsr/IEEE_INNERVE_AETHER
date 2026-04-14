import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: "/api/profile",
    accepts: ["POST"],
    message: "Telemetry probe OK. Use POST to create or update a profile.",
  });
}

export async function POST(req: Request) {
  try {
    const { full_name, academic_domain, skills, profile_id } = await req.json();
    const normalizedName = String(full_name || "").trim();
    const normalizedDomain = String(academic_domain || "").trim();
    const normalizedSkills = Array.isArray(skills)
      ? skills
          .filter((skill) => typeof skill === "string")
          .map((skill) => skill.trim().toUpperCase())
          .filter(Boolean)
      : [];

    if (!normalizedName || !normalizedDomain) {
      return NextResponse.json({ error: "Missing identity payloads." }, { status: 400 });
    }

    let resolvedProfileId = typeof profile_id === "string" && profile_id.trim() ? profile_id.trim() : "";

    // Try to reuse an existing profile so repeat onboarding doesn't create duplicates.
    if (!resolvedProfileId) {
      const { data: existingProfile, error: lookupError } = await supabaseServer
        .from("profiles")
        .select("id")
        .eq("full_name", normalizedName)
        .eq("academic_domain", normalizedDomain)
        .limit(1)
        .maybeSingle();

      if (lookupError && lookupError.code !== "PGRST205" && lookupError.code !== "42P01") {
        throw lookupError;
      }

      resolvedProfileId = existingProfile?.id || crypto.randomUUID();
    }

    // Upsert keeps the same profile identity and avoids duplicate row explosions.
    const { data, error } = await supabaseServer
      .from("profiles")
      .upsert(
        [
          {
            id: resolvedProfileId,
            full_name: normalizedName,
            academic_domain: normalizedDomain,
            skills: normalizedSkills
          }
        ],
        { onConflict: "id" }
      )
      .select();

    if (error) {
      if (error.code === "PGRST205" || error.code === "42P01") {
        return NextResponse.json({
          success: true,
          localOnly: true,
          warning: "profiles table not found; onboarding continued with local profile.",
          profile: [
            {
              id: resolvedProfileId,
              full_name: normalizedName,
              academic_domain: normalizedDomain,
              skills: normalizedSkills
            }
          ]
        });
      }

      throw error;
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (error: any) {
    console.error("Supabase Injection Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
