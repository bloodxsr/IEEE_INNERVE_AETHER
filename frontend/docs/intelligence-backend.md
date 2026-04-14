# Aether Intelligence Backend (TypeScript)

This backend is implemented as Next.js API routes and TypeScript service modules.
No Python runtime is required.

## Capability Matrix

Already in project before this expansion:
- Gemini integration and generation runtime.
- Pinecone vector index integration.
- SerpApi patent retrieval integration.
- Supabase profile persistence and collaborator lookup.
- ArmorClaw-style secure ingestion and telemetry checks.

Added in this expansion:
- 10 modular intelligence services under src/server/intelligence/modules.
- Unified multi-module orchestration pipeline under src/server/intelligence/pipeline.ts.
- Dedicated API routes under /api/intelligence/* for each module.
- Timestamp certificate generation with deterministic hash chain fields.

## Service Modules

1. Patent readiness scoring
- File: src/server/intelligence/modules/readiness.ts
- Output: novelty/legal-risk/feasibility/market + final weighted score.

2. Pivot recommendation
- File: src/server/intelligence/modules/pivot.ts
- Output: claim-safe strategy pivots, domain shifts, architecture improvements.

3. Patent landscape analysis
- File: src/server/intelligence/modules/landscape.ts
- Output: top organizations, cluster categories, trend direction, whitespace opportunities.

4. Team builder
- File: src/server/intelligence/modules/teamBuilder.ts
- Output: required skills, gaps, ranked collaborator matches.

5. Patent draft generation
- File: src/server/intelligence/modules/patentDraft.ts
- Output: abstract, background, summary, claims, description.

6. Plagiarism risk scoring
- File: src/server/intelligence/modules/plagiarism.ts
- Output: similarity score, overlap details, risk level.

7. Market validation
- File: src/server/intelligence/modules/market.ts
- Output: market size estimate, demand level, startup potential score.

8. Prototype recommendation
- File: src/server/intelligence/modules/prototype.ts
- Output: suggested stack, tools, estimated cost range, timeline.

9. Startup pipeline assets
- File: src/server/intelligence/modules/startup.ts
- Output: problem statement, value proposition, pitch outline, monetization options.

10. Timestamp certificate
- File: src/server/intelligence/modules/timestamp.ts
- Output: certificate id, idea hash, previous hash, block hash, timestamp.

## API Endpoints

Base listing endpoint:
- GET /api/intelligence

Module endpoints:
- POST /api/intelligence/readiness
- POST /api/intelligence/pivot
- POST /api/intelligence/landscape
- POST /api/intelligence/team-builder
- POST /api/intelligence/patent-draft
- POST /api/intelligence/plagiarism
- POST /api/intelligence/market-validation
- POST /api/intelligence/prototype-recommendation
- POST /api/intelligence/startup-pipeline
- POST /api/intelligence/timestamp
- POST /api/intelligence/pipeline

## Pipeline Data Flow

1. Input idea text enters secure ingestion (PII scrubbing + IP hashing).
2. Prior art is resolved from request payload or live retrieval (Pinecone + SerpApi).
3. Readiness and pivot modules run with prior-art context.
4. Landscape and plagiarism modules evaluate overlap structures.
5. Team, market, prototype, and startup modules create execution outputs.
6. Timestamp module produces a certificate artifact.
7. Pipeline endpoint returns all module outputs as one response payload.

## Example Pipeline Request

POST /api/intelligence/pipeline

{
  "ideaText": "A secure AI copilot for prior-art patent screening in university labs",
  "submitterId": "user-123",
  "collaboratorPool": [
    {
      "id": "c1",
      "name": "A. Sharma",
      "department": "Software and AI",
      "skills": ["LLM", "RAG"],
      "experienceYears": 6
    }
  ]
}

## Example Pipeline Response Shape

{
  "success": true,
  "data": {
    "readiness": { "finalPatentReadinessScore": 74.4 },
    "pivots": { "suggestedPivots": [] },
    "landscape": { "trendDirection": "increasing" },
    "teamBuilder": { "rankedCollaborators": [] },
    "patentDraft": { "claims": [] },
    "plagiarismRisk": { "riskLevel": "Low" },
    "marketValidation": { "industryDemandLevel": "High" },
    "prototypeRecommendation": { "developmentTimeline": "8-14 weeks" },
    "startupPipeline": { "pitchOutline": [] },
    "timestampCertificate": { "certificateId": "CERT-..." }
  }
}
