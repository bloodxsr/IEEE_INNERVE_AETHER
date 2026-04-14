# Project Aether

This repo runs a JavaScript/TypeScript stack with Next.js API routes for backend logic.

## Local Setup

1. Install dependencies inside `frontend`.

```bash
cd frontend
npm install
```

2. Ensure `frontend/.env.local` contains required keys.

3. Create Supabase table schema by running SQL from `supabase/schema.sql` in Supabase SQL Editor.

4. Optionally add starter records by running SQL from `supabase/seed.sql`.

5. Start frontend.

```bash
npm run dev
```

Open http://localhost:3000.

## Intelligence Backend

- TypeScript backend intelligence services are implemented in `frontend/src/server/intelligence`.
- Module endpoints are available under `/api/intelligence/*`.
- Full endpoint and data-flow documentation is in `frontend/docs/intelligence-backend.md`.

## Identity + Aether Flow

1. Open `/onboarding` and register identity.
2. Continue to `/aether`.
3. Upload paper text/PDF/image or paste abstract.
4. Launch engine to run novelty analysis.
5. Collaborator suggestions are fetched from `profiles` by domain.

## Architecture Note

- Current code uses Next.js API routes, Gemini, Pinecone, and Supabase.
- There is no Python backend service in this repository.
