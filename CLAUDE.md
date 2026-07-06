# Developer Guide & Commands

## Build and Run Commands
- Start development server: `npm run dev`
- Build production application: `npm run build`
- Run linting: `npm run lint`

## Project Context
- **Tech Stack:** Next.js (App Router, v16), Tailwind CSS v4, React 19, Lucide icons, Supabase (with `@supabase/ssr` on client, mocked database on server).
- **Database Schema:** SQLite-styled schema mapped to PostgreSQL in `supabase/migrations/001_initial_schema.sql`. Mock data is located in `supabase/seed.sql`.
- **Database Client:** Client actions use the browser-side Supabase client. Server actions and routes use a lightweight mock database client (`src/lib/supabase/mock-db.ts`) configured in `src/lib/supabase/server.ts` to allow fully-functional offline/Demo Mode execution without breaking client token limits.
- **AI Agent Chat:** Powered by Gemini 2.5 Flash via Vercel AI SDK (`ai`, `@ai-sdk/google`). Supported tools reside in `src/lib/ai/tools.ts` (calendar and resource management).

## Code Style & Rules
- Use TypeScript strictly.
- Prefer server components and server actions unless client-side state is required (use `"use client"`).
- Database mutations and API key access must happen on the server-side to enforce the security boundary.
- Do not import `@ai-sdk/openai` since all LLM functionality relies exclusively on `@ai-sdk/google`.
