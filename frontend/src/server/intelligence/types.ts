export type RiskLevel = "Low" | "Medium" | "High";

export interface PriorArtItem {
  id: string;
  title: string;
  abstract: string;
  score?: number;
  assignee?: string;
  publishedAt?: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface BaseIdeaRequest {
  ideaText: string;
  priorArt?: PriorArtItem[];
}

export interface PatentReadinessRequest extends BaseIdeaRequest {
  weights?: {
    novelty?: number;
    legalRisk?: number;
    technicalFeasibility?: number;
    marketViability?: number;
  };
}

export interface PatentReadinessResponse {
  noveltyScore: number;
  legalRiskScore: number;
  technicalFeasibilityScore: number;
  marketViabilityScore: number;
  finalPatentReadinessScore: number;
  rationale: {
    novelty: string;
    legalRisk: string;
    technicalFeasibility: string;
    marketViability: string;
  };
}

export interface PivotSuggestion {
  title: string;
  action: string;
  expectedImpact: string;
}

export interface IdeaImproverResponse {
  suggestedPivots: PivotSuggestion[];
  domainShiftRecommendations: string[];
  architectureImprovements: string[];
}

export interface PatentLandscapeRequest {
  patents: PriorArtItem[];
  clusters?: number;
}

export interface ClusterCategory {
  clusterId: number;
  label: string;
  count: number;
  representativeKeywords: string[];
}

export interface PatentLandscapeResponse {
  topOrganizations: Array<{ organization: string; count: number }>;
  patentClusterCategories: ClusterCategory[];
  trendDirection: "increasing" | "decreasing" | "stable" | "insufficient-data";
  whiteSpaceOpportunities: string[];
}

export interface CollaboratorProfile {
  id: string;
  name: string;
  department: string;
  skills: string[];
  experienceYears?: number;
}

export interface TeamBuilderRequest extends BaseIdeaRequest {
  collaboratorPool: CollaboratorProfile[];
  topN?: number;
}

export interface TeamMatch {
  collaboratorId: string;
  name: string;
  compatibilityScore: number;
  matchedSkills: string[];
  reasoning: string;
}

export interface TeamBuilderResponse {
  requiredSkills: string[];
  skillGaps: string[];
  rankedCollaborators: TeamMatch[];
}

export interface PatentDraftResponse {
  abstract: string;
  background: string;
  summary: string;
  claims: string[];
  description: string;
}

export interface PlagiarismSource {
  sourceId: string;
  sourceType: "paper" | "repo" | "patent" | "other";
  text: string;
}

export interface PlagiarismRiskRequest {
  ideaText: string;
  corpus: PlagiarismSource[];
}

export interface SimilarityMatch {
  sourceId: string;
  sourceType: string;
  similarity: number;
  overlappingConcepts: string[];
}

export interface PlagiarismRiskResponse {
  similarityScore: number;
  overlaps: SimilarityMatch[];
  riskLevel: RiskLevel;
}

export interface MarketValidationRequest {
  ideaDomain: string;
  keywords: string[];
}

export interface MarketValidationResponse {
  marketSizeEstimate: string;
  industryDemandLevel: "Low" | "Medium" | "High";
  startupPotentialScore: number;
  reasoning: string[];
}

export interface PrototypeRecommendationRequest extends BaseIdeaRequest {
  domain?: string;
}

export interface PrototypeRecommendationResponse {
  suggestedTechStack: string[];
  recommendedTools: string[];
  estimatedCostRange: string;
  developmentTimeline: string;
  rationale: string[];
}

export interface StartupPipelineRequest extends BaseIdeaRequest {
  marketContext?: string;
}

export interface StartupPipelineResponse {
  problemStatement: string;
  valueProposition: string;
  pitchOutline: string[];
  monetizationSuggestions: string[];
}

export interface TimestampRequest {
  ideaText: string;
  submitterId?: string;
  metadata?: Record<string, unknown>;
}

export interface TimestampResponse {
  certificateId: string;
  ideaHash: string;
  previousHash: string;
  blockHash: string;
  timestamp: string;
}

export interface PipelineRequest {
  ideaText: string;
  collaboratorPool?: CollaboratorProfile[];
  plagiarismCorpus?: PlagiarismSource[];
  priorArt?: PriorArtItem[];
}

export interface PipelineResponse {
  readiness: PatentReadinessResponse;
  pivots: IdeaImproverResponse;
  landscape: PatentLandscapeResponse;
  teamBuilder: TeamBuilderResponse;
  patentDraft: PatentDraftResponse;
  plagiarismRisk: PlagiarismRiskResponse;
  marketValidation: MarketValidationResponse;
  prototypeRecommendation: PrototypeRecommendationResponse;
  startupPipeline: StartupPipelineResponse;
  timestampCertificate: TimestampResponse;
}

export interface ServiceContext {
  clientIp: string;
  ingestedAt: string;
  scrubbedIdeaText: string;
  ipHash: string;
}
