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

type HistoryEntry = {
  id: string;
  createdAt: string;
  abstract: string;
  results: AetherResponse;
  pipeline: IntelligencePipelineResponse | null;
  pipelineError: string | null;
  collaborators: Collaborator[];
};

type ResearchPaper = {
  id: string;
  title: string;
  summary: string;
  published: string;
  updated: string;
  link: string;
  pdfUrl: string | null;
  authors: string[];
  primaryCategory: string;
  categories: string[];
};

type ResearchFeedResponse = {
  success: boolean;
  query: string;
  lastUpdated: string;
  papers: ResearchPaper[];
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
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [researchPapers, setResearchPapers] = useState<ResearchPaper[]>([]);
  const [researchCategories, setResearchCategories] = useState<string[]>([]);
  const [selectedResearchCategory, setSelectedResearchCategory] = useState("All");
  const [newResearchPaperIds, setNewResearchPaperIds] = useState<string[]>([]);
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [researchLastUpdated, setResearchLastUpdated] = useState<string | null>(null);

  const getHistoryStorageKey = (profileId: string) => `aether_generation_history_${profileId || "local-user"}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsIdentityReady(localStorage.getItem("aether_identity_registered") === "true");
    setIdentityDomain(localStorage.getItem("aether_identity_domain") || "Computer Science");
    setIdentityId(localStorage.getItem("aether_identity_id") || "local-user");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !identityId) return;

    try {
      const raw = localStorage.getItem(getHistoryStorageKey(identityId));
      if (!raw) {
        setHistory([]);
        setHistoryLoaded(true);
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        setHistory([]);
        setHistoryLoaded(true);
        return;
      }

      setHistory(parsed as HistoryEntry[]);
      setHistoryLoaded(true);
    } catch {
      setHistory([]);
      setHistoryLoaded(true);
    }
  }, [identityId]);

  useEffect(() => {
    if (selectedResearchCategory !== "All" && !researchCategories.includes(selectedResearchCategory)) {
      setSelectedResearchCategory("All");
    }
  }, [researchCategories, selectedResearchCategory]);

  const persistHistory = (entries: HistoryEntry[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(getHistoryStorageKey(identityId), JSON.stringify(entries));
  };

  const pushHistoryEntry = (entry: HistoryEntry) => {
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 20);
      persistHistory(next);
      return next;
    });
  };

  const restoreHistoryEntry = (entry: HistoryEntry) => {
    setAbstract(entry.abstract);
    setResults(entry.results);
    setPipeline(entry.pipeline);
    setPipelineError(entry.pipelineError);
    setCollaborators(entry.collaborators || []);
    setCollaboratorsLoaded(true);
    setError(null);
  };

  const clearHistory = () => {
    setHistory([]);
    persistHistory([]);
  };

  const fetchRecentResearch = async (querySeed?: string, silent = false) => {
    const queryCandidate = (querySeed || abstract || identityDomain || "engineering innovation")
      .replace(/\s+/g, " ")
      .trim();
    const query = queryCandidate.length > 0 ? queryCandidate : "engineering innovation";

    if (!silent) {
      setResearchLoading(true);
    }
    setResearchError(null);

    try {
      const res = await fetch(
        `/api/research/recent?query=${encodeURIComponent(query)}&domain=${encodeURIComponent(identityDomain)}&max=12`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        const errPayload = await res.json().catch(() => ({ error: "Unable to load recent research feed." }));
        throw new Error(errPayload.error || "Unable to load recent research feed.");
      }

      const payload = (await res.json()) as ResearchFeedResponse;
      const nextPapers = Array.isArray(payload.papers) ? payload.papers : [];

      setResearchPapers((previous) => {
        const previousIds = new Set(previous.map((paper) => paper.id));
        const freshIds = nextPapers
          .filter((paper) => !previousIds.has(paper.id))
          .map((paper) => paper.id);

        setNewResearchPaperIds(previous.length === 0 ? [] : freshIds);
        return nextPapers;
      });

      const categories = Array.from(
        new Set(nextPapers.map((paper) => (paper.primaryCategory || "General").trim() || "General"))
      ).sort((left, right) => left.localeCompare(right));

      setResearchCategories(categories);
      setResearchLastUpdated(payload.lastUpdated || new Date().toISOString());
    } catch (feedError: any) {
      setResearchError(feedError.message || "Failed to load recent research feed.");
    } finally {
      if (!silent) {
        setResearchLoading(false);
      }
    }
  };

  useEffect(() => {
    void fetchRecentResearch(undefined, false);

    const intervalId = setInterval(() => {
      void fetchRecentResearch(undefined, true);
    }, 180000);

    return () => clearInterval(intervalId);
  }, [identityDomain]);

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
      let fetchedCollaborators: Collaborator[] = [];
      let resolvedPipeline: IntelligencePipelineResponse | null = null;
      let resolvedPipelineError: string | null = null;

      try {
        const collaboratorRes = await fetch(
          `/api/collaborators?user_id=${userIdParam}&domain=${domainParam}`
        );

        if (collaboratorRes.ok) {
          const collaboratorPayload = await collaboratorRes.json();
          fetchedCollaborators = Array.isArray(collaboratorPayload?.collaborators)
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
          resolvedPipeline = pipelinePayload.data as IntelligencePipelineResponse;
          setPipeline(resolvedPipeline);
        }
      } catch (pipelineFailure: any) {
        resolvedPipelineError = pipelineFailure.message || "Intelligence modules could not be loaded.";
        setPipelineError(resolvedPipelineError);
      }

      pushHistoryEntry({
        id: `run-${Date.now()}`,
        createdAt: new Date().toISOString(),
        abstract,
        results: mappedResults,
        pipeline: resolvedPipeline,
        pipelineError: resolvedPipelineError,
        collaborators: fetchedCollaborators,
      });

      void fetchRecentResearch(abstract, true);
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

  const formatPaperDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown date";

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredResearchPapers =
    selectedResearchCategory === "All"
      ? researchPapers
      : researchPapers.filter((paper) => (paper.primaryCategory || "General") === selectedResearchCategory);

  const groupedResearchPapers =
    selectedResearchCategory === "All"
      ? researchCategories
          .map((category) => ({
            category,
            papers: researchPapers.filter((paper) => (paper.primaryCategory || "General") === category),
          }))
          .filter((group) => group.papers.length > 0)
      : [{ category: selectedResearchCategory, papers: filteredResearchPapers }];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030507] text-[#e9f5ee]">
      <div style={GRAIN_STYLE} className="pointer-events-none absolute inset-0 z-0 opacity-15" />
      <div className="pointer-events-none absolute -left-24 top-[-80px] z-0 h-[360px] w-[360px] rounded-full bg-emerald-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-100px] top-[260px] z-0 h-[360px] w-[360px] rounded-full bg-green-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-140px] left-1/3 z-0 h-[320px] w-[420px] rounded-full bg-lime-400/15 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-[1860px] px-4 py-6 sm:px-8 lg:px-12">
        <header className="mb-6 rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/90 via-[#0a150f]/92 to-[#050a07]/95 p-6 shadow-[0_22px_60px_rgba(0,0,0,0.55)] backdrop-blur">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Aether Research to IP Intelligence</p>
              <h1 className="mt-3 text-[clamp(34px,4vw,58px)] font-semibold leading-[1.02] text-emerald-50">
                Engine Workspace
              </h1>
              <p className="mt-3 max-w-4xl text-base leading-relaxed text-emerald-200/75">
                This workspace now maps your full proposal flow: secure ingestion, neural prior-art detection, white-space mapping, and collaborator matchmaking.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-300">ArmorClaw secured</span>
                <span className="rounded-full bg-[#0d1a14] px-3 py-1 text-emerald-200">Domain: {identityDomain}</span>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300">10 intelligence modules</span>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300">Identity {isIdentityReady ? "ready" : "required"}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/status"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-300/35 bg-[#0a130e] px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-[#10301f]"
              >
                System telemetry
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-400/20 bg-[#0a130e] px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-[#08110d]"
              >
                Home
              </Link>
            </div>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/90 via-[#0a150f]/92 to-[#050a07]/95 p-3 text-sm shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur">
          <span className="px-2 font-medium text-emerald-200/70">Jump to:</span>
          <a href="#upload-panel" className="rounded-full bg-[#0d1a14] px-3 py-1 text-emerald-200 transition hover:bg-[#143823]">Upload</a>
          <a href="#analysis-panel" className="rounded-full bg-[#0d1a14] px-3 py-1 text-emerald-200 transition hover:bg-[#143823]">Analysis</a>
          <a href="#research-panel" className="rounded-full bg-[#0d1a14] px-3 py-1 text-emerald-200 transition hover:bg-[#143823]">Recent papers</a>
          <a href="#results-panel" className="rounded-full bg-[#0d1a14] px-3 py-1 text-emerald-200 transition hover:bg-[#143823]">Results</a>
          <a href="#history-panel" className="rounded-full bg-[#0d1a14] px-3 py-1 text-emerald-200 transition hover:bg-[#143823]">History</a>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <section className="space-y-6 xl:col-span-5">
            <article id="upload-panel" className="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/90 via-[#0a150f]/92 to-[#050a07]/95 p-5 shadow-lg shadow-black/40 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-emerald-50">Upload research material</h3>
                <span className="rounded-full bg-[#0d1a14] px-3 py-1 text-xs font-medium text-emerald-200/75">Step 1</span>
              </div>

              <label className="text-sm font-medium text-emerald-200">Document input</label>
              <input
                type="file"
                accept=".txt,.md,.pdf,image/*"
                onChange={handlePaperUpload}
                disabled={isExtracting || isLoading}
                className="mt-3 block w-full rounded-xl border border-emerald-400/20 bg-[#0a130e] p-3 text-sm text-emerald-200 file:mr-3 file:rounded-lg file:border-0 file:bg-[#0d1d14] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
              />

              <p className="mt-2 text-xs text-emerald-200/55">Supported: TXT, MD, PDF, and image OCR extraction.</p>
              {paperName && <p className="mt-2 text-sm text-emerald-200/75">Loaded file: {paperName}</p>}
              {paperStatus && <p className="mt-2 text-sm text-emerald-300">{paperStatus}</p>}
            </article>

            <article id="analysis-panel" className="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/90 via-[#0a150f]/92 to-[#050a07]/95 p-5 shadow-lg shadow-black/40 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-emerald-50">Run abstract analysis</h3>
                <span className="rounded-full bg-[#0d1a14] px-3 py-1 text-xs font-medium text-emerald-200/75">{abstractCharCount} chars</span>
              </div>

              <label className="text-sm font-medium text-emerald-200">Project abstract</label>
              <textarea
                value={abstract}
                onChange={(event) => setAbstract(event.target.value)}
                disabled={isLoading || isExtracting}
                placeholder="Describe the problem, your method, and what makes your approach novel."
                className="mt-3 h-[260px] w-full resize-none rounded-2xl border border-emerald-400/20 bg-[#0a130e] p-4 text-base leading-relaxed text-emerald-100 placeholder:text-emerald-200/35 focus:border-emerald-300/50 focus:outline-none"
              />

              {error && <p className="mt-3 rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-300">{error}</p>}

              <button
                onClick={handlePrimaryAction}
                disabled={isLoading || isExtracting || (!isIdentityReady && isLoading)}
                className="mt-4 w-full rounded-xl bg-[#0d1d14] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#174629] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExtracting
                  ? "Extracting paper text..."
                  : isLoading
                    ? "Running analysis and intelligence modules..."
                    : isIdentityReady
                      ? "Run novelty and module analysis"
                      : "Register identity to continue"}
              </button>
            </article>

            <div className="grid grid-cols-3 gap-3">
              <article className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/88 via-[#0a150f]/90 to-[#050a07]/94 p-3 text-sm shadow-lg shadow-black/40">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-emerald-200/55">Workflow</p>
                <p className="mt-1 text-sm font-medium text-emerald-100">Create, research, release</p>
              </article>
              <article className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/88 via-[#0a150f]/90 to-[#050a07]/94 p-3 text-sm shadow-lg shadow-black/40">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-emerald-200/55">Identity</p>
                <p className="mt-1 text-sm font-medium text-emerald-100">{isIdentityReady ? "Registered" : "Required"}</p>
              </article>
              <article className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/88 via-[#0a150f]/90 to-[#050a07]/94 p-3 text-sm shadow-lg shadow-black/40">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-emerald-200/55">Readiness</p>
                <p className="mt-1 text-sm font-medium text-emerald-100">{readinessLabel}</p>
              </article>
            </div>

            <article id="research-panel" className="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/90 via-[#0a150f]/92 to-[#050a07]/95 p-5 shadow-lg shadow-black/40 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-50">Recent research feed</h3>
                  <p className="text-sm text-emerald-200/75">
                    Auto-refreshes every 3 minutes and highlights newly seen papers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void fetchRecentResearch(abstract, false)}
                  className="rounded-xl border border-emerald-400/20 bg-[#0a130e] px-3 py-2 text-sm font-medium text-emerald-200 transition hover:bg-[#08110d]"
                >
                  Refresh feed
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-emerald-200/55">
                <span className="rounded-full bg-[#0d1a14] px-3 py-1">Domain: {identityDomain}</span>
                {researchLastUpdated && <span className="rounded-full bg-[#0d1a14] px-3 py-1">Updated: {new Date(researchLastUpdated).toLocaleTimeString()}</span>}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedResearchCategory("All")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    selectedResearchCategory === "All"
                      ? "bg-[#0d1d14] text-white"
                      : "bg-[#0d1a14] text-emerald-200 hover:bg-[#143823]"
                  }`}
                >
                  All categories
                </button>
                {researchCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedResearchCategory(category)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      selectedResearchCategory === category
                        ? "bg-[#0d1d14] text-white"
                        : "bg-[#0d1a14] text-emerald-200 hover:bg-[#143823]"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="mt-4 max-h-[520px] space-y-4 overflow-y-auto pr-1">
                {researchLoading ? (
                  <p className="rounded-xl bg-[#0d1a14] px-4 py-3 text-sm text-emerald-200/75">Loading recent papers...</p>
                ) : researchError ? (
                  <p className="rounded-xl bg-rose-500/15 px-4 py-3 text-sm text-rose-300">{researchError}</p>
                ) : researchPapers.length === 0 ? (
                  <p className="rounded-xl bg-[#0d1a14] px-4 py-3 text-sm text-emerald-200/75">No papers available yet for this query context.</p>
                ) : (
                  groupedResearchPapers.map((group) => (
                    <div key={group.category} className="space-y-2">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-200/55">{group.category}</h4>
                      {group.papers.slice(0, 4).map((paper) => (
                        <article key={paper.id} className="rounded-2xl border border-emerald-400/20 bg-[#08110d] p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="line-clamp-2 flex-1 text-sm font-semibold text-emerald-50">{paper.title}</p>
                            {newResearchPaperIds.includes(paper.id) && (
                              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
                                New
                              </span>
                            )}
                          </div>
                          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-emerald-200/75">{paper.summary}</p>
                          <p className="mt-2 text-xs text-emerald-200/55">
                            {paper.authors.slice(0, 4).join(", ")} • {formatPaperDate(paper.published)}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <a
                              href={paper.link}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border border-emerald-400/20 bg-[#0a130e] px-3 py-1 font-medium text-emerald-200 transition hover:bg-[#0d1a14]"
                            >
                              Open abstract
                            </a>
                            {paper.pdfUrl && (
                              <a
                                href={paper.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-emerald-400/20 bg-[#0a130e] px-3 py-1 font-medium text-emerald-200 transition hover:bg-[#0d1a14]"
                              >
                                Open PDF
                              </a>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>

          <section id="results-panel" className="xl:col-span-7">
            {!results ? (
              <article className="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/90 via-[#0a150f]/92 to-[#050a07]/95 p-6 shadow-lg shadow-black/40 backdrop-blur">
                <div className="mb-5 flex items-center justify-between border-b border-emerald-400/20 pb-4">
                  <h2 className="text-2xl font-semibold text-emerald-50">Ready for analysis</h2>
                  <span className="rounded-full bg-[#0d1a14] px-3 py-1 text-xs font-medium text-emerald-200/75">Waiting for run</span>
                </div>
                <p className="text-sm leading-relaxed text-emerald-200/75">
                  Execute the engine to generate novelty score, prior-art overlap, legal summary, collaborator recommendations, and all intelligence module outputs.
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {modulePreview.map((module) => (
                    <div key={module} className="rounded-xl border border-emerald-400/20 bg-[#08110d] p-3">
                      <p className="text-sm font-semibold text-emerald-100">{module}</p>
                      <p className="mt-1 text-xs text-emerald-200/55">Standby</p>
                    </div>
                  ))}
                </div>
              </article>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <article className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/90 via-[#0a150f]/92 to-[#050a07]/95 p-4 shadow-lg shadow-black/40">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-200/55">Novelty score</p>
                    <p className="mt-1 text-5xl font-semibold text-emerald-50">{results.novelty_score}</p>
                  </article>
                  <article className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/90 via-[#0a150f]/92 to-[#050a07]/95 p-4 shadow-lg shadow-black/40">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-200/55">Prior-art hits</p>
                    <p className="mt-1 text-5xl font-semibold text-emerald-50">{results.prior_art.length}</p>
                  </article>
                  <article className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/90 via-[#0a150f]/92 to-[#050a07]/95 p-4 shadow-lg shadow-black/40">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-200/55">Readiness score</p>
                    <p className="mt-1 text-5xl font-semibold text-emerald-50">{readinessScore !== null ? readinessScore : "--"}</p>
                  </article>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <article className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/90 via-[#0a150f]/92 to-[#050a07]/95 p-4 shadow-lg shadow-black/40">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-200/55">White-space map</h3>
                    <div className="mt-3 h-[300px] rounded-xl border border-emerald-400/20 bg-[#0a130e] p-2">
                      <WhiteSpaceMap nodes={results.white_space_map} />
                    </div>
                  </article>

                  <div className="space-y-4">
                    <article className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/90 via-[#0a150f]/92 to-[#050a07]/95 p-4 shadow-lg shadow-black/40">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-200/55">Legal summary</h3>
                      <div className="mt-3 max-h-[210px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-emerald-200">
                        {results.legal_summaries[0]?.summary?.replace(/\*\*/g, "").replace(/\*/g, "•") ||
                          "No legal summary generated."}
                      </div>
                    </article>
                    <article className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/90 via-[#0a150f]/92 to-[#050a07]/95 p-3 shadow-lg shadow-black/40">
                      <IntegrityReport state={results.integrity} />
                    </article>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <article className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/90 via-[#0a150f]/92 to-[#050a07]/95 p-4 shadow-lg shadow-black/40">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-200/55">Prior-art matches</h3>
                    <div className="mt-3 max-h-[280px] space-y-2 overflow-y-auto">
                      {results.prior_art.length === 0 ? (
                        <p className="text-sm text-emerald-200/55">No direct matches found.</p>
                      ) : (
                        results.prior_art.map((paper) => (
                          <article key={paper.id} className="rounded-xl border border-emerald-400/20 bg-[#08110d] p-3">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold text-emerald-50">{paper.title}</p>
                              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
                                Similarity {Math.round(paper.score * 100)}%
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-emerald-200/55">{paper.id}</p>
                          </article>
                        ))
                      )}
                    </div>
                  </article>

                  <article className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/90 via-[#0a150f]/92 to-[#050a07]/95 p-4 shadow-lg shadow-black/40">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-200/55">Collaborator recommendations</h3>
                    <div className="mt-3 max-h-[280px] space-y-2 overflow-y-auto">
                      {!collaboratorsLoaded ? (
                        <p className="text-sm text-emerald-200/55">Loading collaborator profiles...</p>
                      ) : collaborators.length === 0 ? (
                        <p className="text-sm text-emerald-200/55">No collaborators available yet.</p>
                      ) : (
                        collaborators.map((person) => (
                          <article key={person.id} className="rounded-xl border border-emerald-400/20 bg-[#08110d] p-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-emerald-50">{person.name}</p>
                              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
                                {person.synergy_score}% fit
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-emerald-200/75">{person.department}</p>
                          </article>
                        ))
                      )}
                    </div>
                  </article>
                </div>

                <article className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/90 via-[#0a150f]/92 to-[#050a07]/95 p-5 shadow-lg shadow-black/40">
                  <div className="mb-4 flex items-center justify-between border-b border-emerald-400/20 pb-3">
                    <h3 className="text-lg font-semibold text-emerald-50">Intelligence module outputs</h3>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-emerald-200/55">Live pipeline</p>
                  </div>

                  {pipelineError && <p className="mb-4 rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-300">{pipelineError}</p>}

                  {!pipeline ? (
                    <div className="rounded-xl border border-dashed border-emerald-400/25 bg-[#08110d] p-5 text-sm text-emerald-200/55">
                      Computing module stack output...
                    </div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      <article className="rounded-xl border border-emerald-400/20 bg-[#08110d] p-4">
                        <h4 className="text-sm font-semibold text-emerald-100">Readiness breakdown</h4>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-emerald-200/75">
                          <p>Final: {Math.round(pipeline.readiness.finalPatentReadinessScore)}</p>
                          <p>Novelty: {Math.round(pipeline.readiness.noveltyScore)}</p>
                          <p>Legal: {Math.round(pipeline.readiness.legalRiskScore)}</p>
                          <p>Feasibility: {Math.round(pipeline.readiness.technicalFeasibilityScore)}</p>
                        </div>
                      </article>

                      <article className="rounded-xl border border-emerald-400/20 bg-[#08110d] p-4">
                        <h4 className="text-sm font-semibold text-emerald-100">Market validation</h4>
                        <p className="mt-2 text-sm text-emerald-200/75">{pipeline.marketValidation.marketSizeEstimate}</p>
                        <p className="mt-2 text-sm font-medium text-emerald-300">
                          {pipeline.marketValidation.industryDemandLevel} demand • {Math.round(pipeline.marketValidation.startupPotentialScore)} startup score
                        </p>
                      </article>

                      <article className="rounded-xl border border-emerald-400/20 bg-[#08110d] p-4">
                        <h4 className="text-sm font-semibold text-emerald-100">Pivot suggestions</h4>
                        <div className="mt-2 space-y-1 text-sm text-emerald-200/75">
                          {(pipeline.pivots.suggestedPivots || []).slice(0, 3).map((pivot) => (
                            <p key={pivot.title}>• {pivot.title}</p>
                          ))}
                        </div>
                      </article>

                      <article className="rounded-xl border border-emerald-400/20 bg-[#08110d] p-4">
                        <h4 className="text-sm font-semibold text-emerald-100">Landscape insights</h4>
                        <p className="mt-2 text-sm font-medium text-emerald-300">Trend: {pipeline.landscape.trendDirection}</p>
                        <div className="mt-2 space-y-1 text-sm text-emerald-200/75">
                          {(pipeline.landscape.topOrganizations || []).slice(0, 3).map((org) => (
                            <p key={org.organization}>• {org.organization} ({org.count})</p>
                          ))}
                        </div>
                      </article>

                      <article className="rounded-xl border border-emerald-400/20 bg-[#08110d] p-4">
                        <h4 className="text-sm font-semibold text-emerald-100">Team builder</h4>
                        <div className="mt-2 space-y-1 text-sm text-emerald-200/75">
                          {(pipeline.teamBuilder.rankedCollaborators || []).slice(0, 3).map((person) => (
                            <p key={person.collaboratorId}>• {person.name} ({Math.round(person.compatibilityScore)}%)</p>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-emerald-200/55">
                          Skill gaps: {(pipeline.teamBuilder.skillGaps || []).slice(0, 4).join(", ") || "None"}
                        </p>
                      </article>

                      <article className="rounded-xl border border-emerald-400/20 bg-[#08110d] p-4">
                        <h4 className="text-sm font-semibold text-emerald-100">Patent draft</h4>
                        <p className="mt-2 text-sm leading-relaxed text-emerald-200/75">{pipeline.patentDraft.summary}</p>
                        <div className="mt-2 space-y-1 text-sm text-emerald-200/75">
                          {(pipeline.patentDraft.claims || []).slice(0, 2).map((claim, index) => (
                            <p key={`${index}-${claim.slice(0, 20)}`}>• {claim}</p>
                          ))}
                        </div>
                      </article>

                      <article className="rounded-xl border border-emerald-400/20 bg-[#08110d] p-4">
                        <h4 className="text-sm font-semibold text-emerald-100">Plagiarism risk</h4>
                        <p className="mt-2 text-sm font-medium text-emerald-200">
                          {pipeline.plagiarismRisk.riskLevel} risk • {Math.round(pipeline.plagiarismRisk.similarityScore)} similarity
                        </p>
                        <div className="mt-2 space-y-1 text-sm text-emerald-200/75">
                          {(pipeline.plagiarismRisk.overlaps || []).slice(0, 2).map((overlap) => (
                            <p key={overlap.sourceId}>• {overlap.sourceType}: {Math.round(overlap.similarity)}%</p>
                          ))}
                        </div>
                      </article>

                      <article className="rounded-xl border border-emerald-400/20 bg-[#08110d] p-4">
                        <h4 className="text-sm font-semibold text-emerald-100">Prototype recommendation</h4>
                        <p className="mt-2 text-sm text-emerald-200/75">Timeline: {pipeline.prototypeRecommendation.developmentTimeline}</p>
                        <p className="mt-1 text-sm text-emerald-200/75">Cost: {pipeline.prototypeRecommendation.estimatedCostRange}</p>
                        <p className="mt-2 text-xs text-emerald-200/55">
                          Suggested stack: {(pipeline.prototypeRecommendation.suggestedTechStack || []).slice(0, 4).join(", ")}
                        </p>
                      </article>

                      <article className="rounded-xl border border-emerald-400/20 bg-[#08110d] p-4">
                        <h4 className="text-sm font-semibold text-emerald-100">Startup pipeline</h4>
                        <p className="mt-2 text-sm leading-relaxed text-emerald-200/75">{pipeline.startupPipeline.valueProposition}</p>
                        <div className="mt-2 space-y-1 text-sm text-emerald-200/75">
                          {(pipeline.startupPipeline.monetizationSuggestions || []).slice(0, 2).map((suggestion) => (
                            <p key={suggestion}>• {suggestion}</p>
                          ))}
                        </div>
                      </article>

                      <article className="rounded-xl border border-emerald-400/20 bg-[#08110d] p-4 md:col-span-2">
                        <h4 className="text-sm font-semibold text-emerald-100">Timestamp certificate</h4>
                        <div className="mt-2 grid gap-2 text-sm text-emerald-200/75 md:grid-cols-2">
                          <p>Certificate: {pipeline.timestampCertificate.certificateId}</p>
                          <p>Time: {new Date(pipeline.timestampCertificate.timestamp).toLocaleString()}</p>
                          <p>Idea hash: {pipeline.timestampCertificate.ideaHash.slice(0, 20)}...</p>
                          <p>Block hash: {pipeline.timestampCertificate.blockHash.slice(0, 20)}...</p>
                        </div>
                      </article>
                    </div>
                  )}
                </article>
              </div>
            )}
          </section>
        </div>

        <section id="history-panel" className="mt-6 rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-[#102218]/90 via-[#0a150f]/92 to-[#050a07]/95 p-5 shadow-lg shadow-black/40 backdrop-blur">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-400/20 pb-3">
            <h3 className="text-lg font-semibold text-emerald-50">Past generations</h3>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#0d1a14] px-3 py-1 text-xs font-medium text-emerald-200/75">{history.length} saved</span>
              <button
                type="button"
                onClick={clearHistory}
                disabled={history.length === 0}
                className="rounded-lg border border-emerald-400/20 bg-[#0a130e] px-3 py-1 text-xs font-medium text-emerald-200 transition hover:bg-[#08110d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </div>

          {!historyLoaded ? (
            <p className="text-sm text-emerald-200/55">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-emerald-200/55">No previous generations yet. Run analysis to save snapshots.</p>
          ) : (
            <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
              {history.map((entry) => (
                <article key={entry.id} className="rounded-2xl border border-emerald-400/20 bg-[#08110d] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-emerald-200/55">{new Date(entry.createdAt).toLocaleString()}</p>
                    <button
                      type="button"
                      onClick={() => restoreHistoryEntry(entry)}
                      className="rounded-lg border border-emerald-300/35 bg-[#0a130e] px-3 py-1 text-xs font-medium text-emerald-300 transition hover:bg-[#10301f]"
                    >
                      Load snapshot
                    </button>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-emerald-200">{entry.abstract}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-emerald-200/75">
                    <span className="rounded-full bg-[#0a130e] px-2 py-1">Novelty {Math.round(entry.results.novelty_score)}</span>
                    <span className="rounded-full bg-[#0a130e] px-2 py-1">
                      Readiness {entry.pipeline ? Math.round(entry.pipeline.readiness.finalPatentReadinessScore) : "--"}
                    </span>
                    <span className="rounded-full bg-[#0a130e] px-2 py-1">Prior art {entry.results.prior_art.length}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


