"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent } from "react";
import { WhiteSpaceMap, type MapPoint } from "@/components/WhiteSpaceMap";
import { IntegrityReport, type IntegrityState } from "@/components/IntegrityReport";

type PriorArt = {
  id: string;
  score: number;
  title: string;
  abstract: string;
};

type LegalSummary = {
  patent_id: string;
  title: string;
  summary: string;
};

type Collaborator = {
  id: string;
  name: string;
  skills: string[];
  department: string;
  synergy_score: number;
};

type AetherResponse = {
  novelty_score: number;
  prior_art: PriorArt[];
  white_space_map: MapPoint[];
  legal_summaries: LegalSummary[];
  integrity: IntegrityState;
};

type AnalyzeResponse = {
  noveltyScore: number;
  closestMatches: Array<{
    id: string;
    score: number;
    title: string;
    snippet: string;
  }>;
  legalSummary: string;
  dataIntegritySignature: IntegrityState;
};

type IntelligencePipelineResponse = {
  readiness: {
    noveltyScore: number;
    legalRiskScore: number;
    technicalFeasibilityScore: number;
    marketViabilityScore: number;
    finalPatentReadinessScore: number;
  };
  pivots: {
    suggestedPivots: Array<{ title: string; action: string; expectedImpact: string }>;
    domainShiftRecommendations: string[];
    architectureImprovements: string[];
  };
  landscape: {
    topOrganizations: Array<{ organization: string; count: number }>;
    patentClusterCategories: Array<{ clusterId: number; label: string; count: number; representativeKeywords: string[] }>;
    trendDirection: string;
    whiteSpaceOpportunities: string[];
  };
  teamBuilder: {
    requiredSkills: string[];
    skillGaps: string[];
    rankedCollaborators: Array<{ collaboratorId: string; name: string; compatibilityScore: number; reasoning: string }>;
  };
  patentDraft: {
    abstract: string;
    background: string;
    summary: string;
    claims: string[];
    description: string;
  };
  plagiarismRisk: {
    similarityScore: number;
    riskLevel: "Low" | "Medium" | "High";
    overlaps: Array<{ sourceId: string; sourceType: string; similarity: number; overlappingConcepts: string[] }>;
  };
  marketValidation: {
    marketSizeEstimate: string;
    industryDemandLevel: "Low" | "Medium" | "High";
    startupPotentialScore: number;
    reasoning: string[];
  };
  prototypeRecommendation: {
    suggestedTechStack: string[];
    recommendedTools: string[];
    estimatedCostRange: string;
    developmentTimeline: string;
    rationale: string[];
  };
  startupPipeline: {
    problemStatement: string;
    valueProposition: string;
    pitchOutline: string[];
    monetizationSuggestions: string[];
  };
  timestampCertificate: {
    certificateId: string;
    ideaHash: string;
    previousHash: string;
    blockHash: string;
    timestamp: string;
  };
};

const GRAIN_STYLE: React.CSSProperties = {
  backgroundImage:
    'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
  backgroundRepeat: "repeat",
  backgroundSize: "120px 120px"
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const buildWhiteSpaceMap = (priorArt: PriorArt[]) => {
  const nodes: MapPoint[] = [
    {
      id: "user",
      x: 50,
      y: 50,
      type: "user",
      label: "Your Concept"
    }
  ];

  priorArt.forEach((patent, index) => {
    const seed = hashString(patent.id);
    const x = 10 + ((seed + index * 37) % 80);
    const y = 10 + ((seed + index * 41) % 80);

    nodes.push({
      id: patent.id,
      x,
      y,
      type: "patent",
      label: `v-${Math.floor(patent.score * 100)}%`
    });
  });

  return nodes;
};

export default function AetherDashboard() {
  const router = useRouter();

  const [abstract, setAbstract] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paperStatus, setPaperStatus] = useState<string | null>(null);
  const [paperName, setPaperName] = useState<string | null>(null);
  const [isIdentityReady, setIsIdentityReady] = useState(false);
  const [identityDomain, setIdentityDomain] = useState("Computer Science");
  const [identityId, setIdentityId] = useState("local-user");

  const [results, setResults] = useState<AetherResponse | null>(null);
  const [pipeline, setPipeline] = useState<IntelligencePipelineResponse | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [collaboratorsLoaded, setCollaboratorsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsIdentityReady(localStorage.getItem("aether_identity_registered") === "true");
    setIdentityDomain(localStorage.getItem("aether_identity_domain") || "Computer Science");
    setIdentityId(localStorage.getItem("aether_identity_id") || "local-user");
  }, []);

  const extractPaperText = async (file: File) => {
    setIsExtracting(true);
    setPaperStatus("Extracting text from uploaded paper...");
    setError(null);

    try {
      const isText = file.type.startsWith("text/");
      if (isText) {
        const text = await file.text();
        setAbstract(text.trim());
        setPaperStatus("Text imported from document.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-paper", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Paper extraction failed");
      }

      const data = await res.json();
      if (!data.text || typeof data.text !== "string") {
        throw new Error("No text returned from extractor");
      }

      setAbstract(data.text.trim());
      setPaperStatus("Text extracted using computer vision.");
    } catch (err: any) {
      setPaperStatus(null);
      setError(err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handlePaperUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPaperName(file.name);
    await extractPaperText(file);
  };

  const runAnalysis = async () => {
    if (abstract.length < 20) {
      setError("Abstract must be at least 20 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    setPipeline(null);
    setPipelineError(null);
    setCollaborators([]);
    setCollaboratorsLoaded(false);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abstract })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Analysis failed");
      }

      const data: AnalyzeResponse = await res.json();
      const priorArt = (data.closestMatches || []).map((match) => ({
        id: match.id,
        score: match.score,
        title: match.title,
        abstract: match.snippet
      }));

      const mappedResults: AetherResponse = {
        novelty_score: data.noveltyScore,
        prior_art: priorArt,
        white_space_map: buildWhiteSpaceMap(priorArt),
        legal_summaries: data.legalSummary
          ? [{ patent_id: "summary", title: "RAG Legal Summary", summary: data.legalSummary }]
          : [],
        integrity: data.dataIntegritySignature
      };

      setResults(mappedResults);

      const domainParam = encodeURIComponent(identityDomain);
      const userIdParam = encodeURIComponent(identityId);
      let collaboratorPool: Array<{
        id: string;
        name: string;
        department: string;
        skills: string[];
      }> = [];

      try {
        const collaboratorRes = await fetch(
          `/api/collaborators?user_id=${userIdParam}&domain=${domainParam}`
        );

        if (collaboratorRes.ok) {
          const collaboratorPayload = await collaboratorRes.json();
          const fetchedCollaborators: Collaborator[] = Array.isArray(collaboratorPayload?.collaborators)
            ? collaboratorPayload.collaborators
            : [];

          setCollaborators(fetchedCollaborators);
          collaboratorPool = fetchedCollaborators.map((c) => ({
            id: c.id,
            name: c.name,
            department: c.department,
            skills: c.skills,
          }));
        }
      } catch {
        // Keep pipeline execution available even if collaborator service is temporarily unavailable.
      } finally {
        setCollaboratorsLoaded(true);
      }

      try {
        const pipelineRes = await fetch("/api/intelligence/pipeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ideaText: abstract,
            submitterId: identityId,
            priorArt: mappedResults.prior_art,
            collaboratorPool,
          }),
        });

        if (!pipelineRes.ok) {
          const pipelineErr = await pipelineRes.json();
          throw new Error(pipelineErr.error || "Intelligence pipeline failed");
        }

        const pipelinePayload = await pipelineRes.json();
        if (pipelinePayload?.data) {
          setPipeline(pipelinePayload.data as IntelligencePipelineResponse);
        }
      } catch (pipelineFailure: any) {
        setPipelineError(pipelineFailure.message || "Intelligence modules could not be loaded.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrimaryAction = () => {
    if (!isIdentityReady) {
      router.push("/onboarding");
      return;
    }

    void runAnalysis();
  };

  const abstractCharCount = abstract.trim().length;
  const readinessScore = pipeline ? Math.round(pipeline.readiness.finalPatentReadinessScore) : null;
  const readinessLabel =
    results?.novelty_score === undefined
      ? "Awaiting Run"
      : results.novelty_score >= 70
        ? "High Clearance"
        : results.novelty_score >= 40
          ? "Moderate Competition"
          : "Crowded Sector";

  const modulePreview = [
    "Readiness Scoring",
    "Pivot Suggestions",
    "Landscape Mapping",
    "Team Builder",
    "Patent Draft",
    "Plagiarism Risk",
    "Market Validation",
    "Prototype Reco",
    "Startup Pipeline",
    "Timestamp Certificate",
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030507] text-[#e9edf0]">
      <div style={GRAIN_STYLE} className="pointer-events-none absolute inset-0 z-0" />
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-[-180px] z-0 h-[420px] w-[920px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-[1820px] px-4 py-6 sm:px-8 lg:px-12">
        <header className="mb-7 border border-white/15 bg-black/40 p-6 backdrop-blur-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-mono text-[38px] font-black uppercase tracking-[-0.03em] text-white sm:text-[54px]">
                Aether Intelligence Console
              </h1>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-200/85">
                Create / Research / Release
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.15em]">
                <span className="inline-flex items-center gap-2 border border-emerald-400/35 bg-emerald-400/10 px-3 py-1 text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> ArmorClaw Secure Ingestion
                </span>
                <span className="border border-white/15 bg-black/55 px-3 py-1 text-white/70">Domain: {identityDomain}</span>
                <span className="border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-cyan-200">10 Intelligence Modules</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/status"
                className="inline-flex items-center justify-center border border-cyan-300/30 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-200 transition hover:bg-cyan-300/10"
              >
                System Telemetry
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center border border-white/25 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                Return to Root
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-12">
          <section className="lg:col-span-5">
            <div className="space-y-4 lg:sticky lg:top-6">
              <div className="border border-white/15 bg-black/45 p-5 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">Input Channel</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">{abstractCharCount} chars</p>
                </div>

                <div className="rounded-none border border-white/15 bg-black/50 p-4">
                  <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">
                    Upload Research Paper
                  </label>
                  <input
                    type="file"
                    accept=".txt,.md,.pdf,image/*"
                    onChange={handlePaperUpload}
                    disabled={isExtracting || isLoading}
                    className="mt-3 block w-full text-xs text-white/70 file:mr-4 file:border file:border-white/20 file:bg-white/95 file:px-3 file:py-2 file:font-mono file:text-[10px] file:font-bold file:uppercase file:tracking-[0.12em] file:text-black hover:file:bg-white"
                  />
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
                    TXT / MD / PDF / IMAGE OCR
                  </p>
                  {paperName && <p className="mt-1 font-mono text-[11px] text-white/60">Loaded: {paperName}</p>}
                  {paperStatus && <p className="mt-1 font-mono text-[11px] text-cyan-200/90">{paperStatus}</p>}
                </div>

                <div className="mt-4">
                  <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">
                    Submit Project Abstract
                  </label>
                  <textarea
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    disabled={isLoading || isExtracting}
                    placeholder="Explain the invention clearly: what problem, what method, why technically novel."
                    className="mt-3 h-[280px] w-full resize-none border border-white/20 bg-black/65 p-4 font-mono text-[18px] leading-relaxed tracking-[0.01em] text-white/90 placeholder:text-white/35 focus:border-cyan-300/45 focus:outline-none"
                  />
                </div>

                {error && <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-rose-300">{error}</p>}

                <button
                  onClick={handlePrimaryAction}
                  disabled={isLoading || isExtracting || (!isIdentityReady && isLoading)}
                  className="mt-4 w-full border border-white/20 bg-white py-4 font-mono text-[13px] font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isExtracting
                    ? "Extracting Paper Text"
                    : isLoading
                      ? "Running Engine + Intelligence Stack"
                      : isIdentityReady
                        ? "Execute Novelty + Modules"
                        : "Register Identity to Execute"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="border border-white/15 bg-black/45 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Flow</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-cyan-200">Create / Research / Release</p>
                </div>
                <div className="border border-white/15 bg-black/45 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Identity</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/75">
                    {isIdentityReady ? "Registered" : "Required"}
                  </p>
                </div>
                <div className="border border-white/15 bg-black/45 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Readiness</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-emerald-300">{readinessLabel}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="lg:col-span-7">
            {!results ? (
              <div className="border border-dashed border-white/20 bg-black/35 p-6">
                <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="font-mono text-[20px] uppercase tracking-[0.18em] text-white/80">Awaiting Execution</h2>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">Engine idle</span>
                </div>
                <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-white/45">
                  Run analysis to unlock live prior-art, novelty score, and all ten intelligence modules.
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {modulePreview.map((module) => (
                    <div key={module} className="border border-white/10 bg-black/45 p-3">
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/70">{module}</p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">Standby</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="border border-white/15 bg-black/45 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Novelty Score</p>
                    <p className="mt-2 font-mono text-5xl font-black text-white">{results.novelty_score}</p>
                  </div>
                  <div className="border border-white/15 bg-black/45 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Prior Art Hits</p>
                    <p className="mt-2 font-mono text-5xl font-black text-cyan-200">{results.prior_art.length}</p>
                  </div>
                  <div className="border border-white/15 bg-black/45 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">Readiness</p>
                    <p className="mt-2 font-mono text-5xl font-black text-emerald-300">
                      {readinessScore !== null ? readinessScore : "--"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="border border-white/15 bg-black/40 p-3">
                    <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">White Space Map</div>
                    <div className="h-[300px] border border-white/10 bg-black/45 p-2">
                      <WhiteSpaceMap nodes={results.white_space_map} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border border-white/15 bg-black/40 p-4">
                      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">RAG Legal Summary</div>
                      <div className="mt-3 max-h-[210px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-white/80">
                        {results.legal_summaries[0]?.summary?.replace(/\*\*/g, "").replace(/\*/g, "•") ||
                          "No legal summary generated."}
                      </div>
                    </div>
                    <div className="border border-white/15 bg-black/40 p-3">
                      <IntegrityReport state={results.integrity} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="border border-white/15 bg-black/40 p-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">Prior Art Matches</div>
                    <div className="mt-3 max-h-[280px] space-y-2 overflow-y-auto">
                      {results.prior_art.length === 0 ? (
                        <p className="font-mono text-xs text-white/45">No direct matches found.</p>
                      ) : (
                        results.prior_art.map((p) => (
                          <div key={p.id} className="border border-white/10 bg-black/45 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold text-white/90">{p.title}</p>
                              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-200">
                                SIM {Math.round(p.score * 100)}%
                              </span>
                            </div>
                            <p className="mt-1 font-mono text-[10px] text-white/40">{p.id}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="border border-white/15 bg-black/40 p-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">Collaborator Signals</div>
                    <div className="mt-3 max-h-[280px] space-y-2 overflow-y-auto">
                      {!collaboratorsLoaded ? (
                        <p className="font-mono text-xs text-white/45">Locating collaborator profiles...</p>
                      ) : collaborators.length === 0 ? (
                        <p className="font-mono text-xs text-white/45">No collaborators available yet.</p>
                      ) : (
                        collaborators.map((c) => (
                          <div key={c.id} className="border border-white/10 bg-black/45 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-white">{c.name}</p>
                              <span className="font-mono text-xs text-emerald-300">{c.synergy_score}%</span>
                            </div>
                            <p className="mt-1 font-mono text-[11px] text-white/45">{c.department}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="border border-white/15 bg-black/40 p-5">
                  <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-200/80">Intelligence Modules Output</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/45">Live pipeline feed</p>
                  </div>

                  {pipelineError && <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-rose-300">{pipelineError}</p>}

                  {!pipeline ? (
                    <div className="border border-dashed border-white/15 p-5 font-mono text-xs uppercase tracking-[0.14em] text-white/45">
                      Computing module stack output...
                    </div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="border border-white/10 bg-black/45 p-4">
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">Readiness</div>
                        <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-xs text-white/80">
                          <p>Final: {Math.round(pipeline.readiness.finalPatentReadinessScore)}</p>
                          <p>Novelty: {Math.round(pipeline.readiness.noveltyScore)}</p>
                          <p>Legal: {Math.round(pipeline.readiness.legalRiskScore)}</p>
                          <p>Feasibility: {Math.round(pipeline.readiness.technicalFeasibilityScore)}</p>
                        </div>
                      </div>

                      <div className="border border-white/10 bg-black/45 p-4">
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">Market</div>
                        <p className="mt-2 text-sm text-white/80">{pipeline.marketValidation.marketSizeEstimate}</p>
                        <p className="mt-1 font-mono text-xs uppercase tracking-[0.1em] text-emerald-300">
                          {pipeline.marketValidation.industryDemandLevel} / {Math.round(pipeline.marketValidation.startupPotentialScore)}
                        </p>
                      </div>

                      <div className="border border-white/10 bg-black/45 p-4">
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">Pivots</div>
                        <div className="mt-2 space-y-1 text-sm text-white/80">
                          {(pipeline.pivots.suggestedPivots || []).slice(0, 3).map((pivot) => (
                            <p key={pivot.title}>• {pivot.title}</p>
                          ))}
                        </div>
                      </div>

                      <div className="border border-white/10 bg-black/45 p-4">
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">Landscape</div>
                        <p className="mt-2 font-mono text-xs uppercase tracking-[0.1em] text-cyan-200/85">
                          Trend: {pipeline.landscape.trendDirection}
                        </p>
                        <div className="mt-2 space-y-1 text-sm text-white/80">
                          {(pipeline.landscape.topOrganizations || []).slice(0, 3).map((org) => (
                            <p key={org.organization}>• {org.organization} ({org.count})</p>
                          ))}
                        </div>
                      </div>

                      <div className="border border-white/10 bg-black/45 p-4">
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">Team Builder</div>
                        <div className="mt-2 space-y-1 text-sm text-white/80">
                          {(pipeline.teamBuilder.rankedCollaborators || []).slice(0, 3).map((person) => (
                            <p key={person.collaboratorId}>• {person.name} ({Math.round(person.compatibilityScore)}%)</p>
                          ))}
                        </div>
                        <p className="mt-2 font-mono text-xs text-white/55">
                          Skill gaps: {(pipeline.teamBuilder.skillGaps || []).slice(0, 4).join(", ") || "None"}
                        </p>
                      </div>

                      <div className="border border-white/10 bg-black/45 p-4">
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">Patent Draft</div>
                        <p className="mt-2 text-sm leading-relaxed text-white/75">{pipeline.patentDraft.summary}</p>
                        <div className="mt-2 space-y-1 text-sm text-white/80">
                          {(pipeline.patentDraft.claims || []).slice(0, 2).map((claim, idx) => (
                            <p key={`${idx}-${claim.slice(0, 20)}`}>• {claim}</p>
                          ))}
                        </div>
                      </div>

                      <div className="border border-white/10 bg-black/45 p-4">
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">Plagiarism</div>
                        <p className="mt-2 font-mono text-xs uppercase tracking-[0.1em] text-white/70">
                          {pipeline.plagiarismRisk.riskLevel} / {Math.round(pipeline.plagiarismRisk.similarityScore)}
                        </p>
                        <div className="mt-2 space-y-1 text-sm text-white/80">
                          {(pipeline.plagiarismRisk.overlaps || []).slice(0, 2).map((overlap) => (
                            <p key={overlap.sourceId}>• {overlap.sourceType}: {Math.round(overlap.similarity)}%</p>
                          ))}
                        </div>
                      </div>

                      <div className="border border-white/10 bg-black/45 p-4">
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">Prototype</div>
                        <p className="mt-2 text-sm text-white/80">Timeline: {pipeline.prototypeRecommendation.developmentTimeline}</p>
                        <p className="mt-1 text-sm text-white/80">Cost: {pipeline.prototypeRecommendation.estimatedCostRange}</p>
                        <p className="mt-2 font-mono text-xs text-white/55">
                          Stack: {(pipeline.prototypeRecommendation.suggestedTechStack || []).slice(0, 4).join(", ")}
                        </p>
                      </div>

                      <div className="border border-white/10 bg-black/45 p-4">
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">Startup</div>
                        <p className="mt-2 text-sm leading-relaxed text-white/80">{pipeline.startupPipeline.valueProposition}</p>
                        <div className="mt-2 space-y-1 text-sm text-white/80">
                          {(pipeline.startupPipeline.monetizationSuggestions || []).slice(0, 2).map((suggestion) => (
                            <p key={suggestion}>• {suggestion}</p>
                          ))}
                        </div>
                      </div>

                      <div className="border border-white/10 bg-black/45 p-4 md:col-span-2">
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">Timestamp Certificate</div>
                        <div className="mt-2 grid gap-2 font-mono text-[11px] text-white/70 md:grid-cols-2">
                          <p>CERT: {pipeline.timestampCertificate.certificateId}</p>
                          <p>TIME: {new Date(pipeline.timestampCertificate.timestamp).toLocaleString()}</p>
                          <p>IDEA HASH: {pipeline.timestampCertificate.ideaHash.slice(0, 20)}...</p>
                          <p>BLOCK HASH: {pipeline.timestampCertificate.blockHash.slice(0, 20)}...</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
