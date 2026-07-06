<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Guidelines for Nexus AI

## Architecture & Data Access

- **Auth Separation:** Keep Owner and Demo Mode strictly segregated. All write operations must verify owner privileges via `requireOwner()` before proceeding.
- **Mock DB Client:** Server-side queries must go through `createServerClient()` which returns the mock database builder (`mock-db.ts`). Browser-side client queries go through `createClient()` from `@supabase/ssr`.
- **Classroom MCP Server:** The in-repo Google Classroom MCP Server acts as the tool provider for Classroom integrations. Keep its transport local and in-memory.

## LLM Configurations

- **Gemini Engine:** Use `gemini-2.5-flash` via the `@ai-sdk/google` provider.
- **Dynamic API Keys:** Ensure that the API key fallback chain is maintained: database `platforms` record -> `process.env.GOOGLE_GENERATIVE_AI_API_KEY` -> `process.env.GEMINI_API_KEY`.
