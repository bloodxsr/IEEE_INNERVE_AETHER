import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const fallbackCollaborators = (domain: string) => {
  return [
    {
      id: "fallback-1",
      name: "A. Sharma",
      skills: ["LLM", "RAG", "PATENT ANALYSIS"],
      department: domain,
      synergy_score: 82
    },
    {
      id: "fallback-2",
      name: "R. Banerjee",
      skills: ["VECTOR DB", "EMBEDDINGS", "ML OPS"],
      department: domain,
      synergy_score: 78
    },
    {
      id: "fallback-3",
      name: "N. Verma",
      skills: ["IP LAW", "TECH REVIEW", "PRIOR ART"],
      department: domain,
      synergy_score: 74
    }
  ];
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain") || "Computer Science";

    let query = supabaseServer
      .from("profiles")
      .select("id, full_name, academic_domain, skills");

    query = query.eq("academic_domain", domain);

    const { data, error } = await query.limit(8);

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({ collaborators: fallbackCollaborators(domain) });
    }

    const collaborators = (data || []).map((row, index) => ({
      id: row.id,
      name: row.full_name,
      skills: row.skills || [],
      department: row.academic_domain,
      synergy_score: 78 - index * 3
    }));

    return NextResponse.json({ collaborators });
  } catch (error: any) {
    console.error("Collaborator fetch error:", error);
    return NextResponse.json({ collaborators: fallbackCollaborators("Computer Science") });
  }
}
