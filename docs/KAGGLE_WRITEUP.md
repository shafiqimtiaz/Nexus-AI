# Kaggle Writeup Fields Reference

Use the fields below to copy-paste directly into your Kaggle Writeup submission form.

---

### **1. Title (Required to save)**
*Limit: 80 characters*
`Nexus AI: Personal Academic Concierge via Gemini & Local MCP`

---

### **2. Subtitle**
*Limit: 140 characters*
`Centralize Google Classroom, Slack, and Discord into a unified calendar and study planner powered by Gemini agentic tools.`

---

### **3. Card and Thumbnail Image**
*Dimensions: 560 x 280 (2:1 aspect ratio)*
* **Image location:** [nexus_ai_thumbnail.jpg](file:///home/shafiq.imtiaz/.gemini/antigravity-cli/brain/b594466c-1e73-48d8-b5de-e4715f8e785e/nexus_ai_thumbnail.jpg)
* *(Note: We generated a custom, high-fidelity dark-emerald themed mockup thumbnail and saved it at the path above for you to download and upload here).*

---

### **4. Submission Tracks**
* **Select Track:** `Concierge Agents`

---

### **5. Media Gallery (Video & Images)**
* **Cover Image:** Upload the generated `nexus_ai_thumbnail.jpg`.
* **Video URL (Must be hosted on YouTube):** `https://www.youtube.com/watch?v=YOUR_YOUTUBE_VIDEO_ID` *(Replace with your uploaded video ID)*

---

### **6. Project Links**
1. **Live Site URL:** `https://nexus-ai-tool.vercel.app/`
2. **GitHub Repository URL:** `https://github.com/shafiqimtiaz/nexus-ai`

---

### **7. Project Description**
*Limit: 2500 words*

Copy the markdown block below for the main **Project Description** body:

```markdown
# Nexus AI — Personal Academic Concierge

Nexus AI is a personal academic concierge designed to resolve the platform fragmentation modern students face. Students manage announcements, deadlines, and study blocks scattered across Google Classroom, Discord, Slack, and Google Calendar. This fragmentation creates a cognitive tax, leading to missed assignments and suboptimal study planning. 

Nexus centralizes these sources into a unified workspace. Powered by Gemini 2.5 Flash and Vercel AI SDK, it utilizes a local Google Classroom MCP server, browser-session tools for Discord and Slack, and a write integration for Google Calendar to turn academic announcements into structured, scheduled actions.

---

## 🏗️ Technical Architecture & Data Flow

Nexus routes operations through a secure Next.js server boundary to prevent token leakage and maintain clean architectural separation:

```text
Google Classroom OAuth  ──>  Classroom MCP Server (local)
                                    │
                                    ▼
Discord / Slack Tokens  ──>  Next.js API Routes (server-only)
                                    │
                                    ├───> Supabase DB (cached data)
                                    │
                                    ▼
                             Owner UI / Guest Demo UI
```

### Stale-While-Revalidate Ingestion
Rather than requesting external APIs on every page load, Nexus implements a 15-minute cached sync pattern:
1. When the user visits the Dashboard, the frontend queries `/api/sync`.
2. If the last sync occurred within 15 minutes, cached data is fetched from Supabase.
3. Otherwise, Next.js calls the local Classroom MCP server and crawls user Discord and Slack channels (using session tokens), caching new data in Supabase.
4. Auto-detected assignments are mapped directly to database events.
5. Gemini parses new announcements to extract exam dates and study resources, logging actions to the Agent Activity tracker.

---

## 🎯 Core Agentic Capabilities & Tool Design

The conversational assistant utilizes a multi-step tool-calling loop (depth capped at 8) powered by Gemini 2.5 Flash via the Vercel AI SDK. The agent is backed by the following capabilities:

1. **Google Classroom MCP Server:** An in-repo MCP server running over an in-memory transport bridge that maps Classroom announcements, coursework, and materials directly to tool schemas.
2. **Google Calendar Write Integration:** Uses the owner's Google OAuth refresh token on the server side to write study events directly to the user's primary calendar using the Google Calendar v3 API.
3. **DuckDuckGo Web Search Tool:** A zero-dependency web parser fetching DuckDuckGo's HTML fallback interface, allowing the agent to research study links and references safely.
4. **Study Planner (`generate_study_plan`):** Reads an upcoming exam date and creates multi-day study blocks on the user's Google Calendar leading up to it.

### Mid-Conversation Model Selector
Users can swap models fluidly at the bottom of the chat interface depending on latency and complexity requirements:
* `gemini-3.1-flash-lite`: For quick questions, retrieval, and summaries.
* `gemini-3.5-flash`: For complex scheduling, study block generation, and multi-step tasks.

The requested model travels with each message request and is validated server-side against an allowlist before execution.

---

## 🔒 Security & The Concierge Guardrail

As an academic concierge handling personal accounts and external tokens, security is central to the design:
* **Row-Level Security (RLS):** All Supabase tables are protected by strict RLS rules denying public reads/writes.
* **Server-Only Execution:** Stored OAuth codes, refresh tokens, and Discord/Slack session cookies never leave the server and are never sent to the browser.
* **Public Guest Demo Mode:** Gated mock system. Guest visitors browse seeded announcements, calendar blocks, and pinned resources in read-only mode. Mutations and the live Gemini chat are disabled for unauthenticated users, preventing abuse and protecting API budgets.

---

## 🎨 Visual Design System

Nexus features a minimal, dark-first UI optimized for high readability and focus:
* **Typography:** Clean, modern typography using Geist Sans and Geist Mono, reserving monospace for timestamps and logs.
* **Palette:** A near-black canvas (`oklch(0.145 0 0)`) with slightly raised containers (`oklch(0.205 0 0)`) and an emerald primary accent (`oklch(0.696 0.155 163)`) for navigation and indicators. Supports system light mode.
* **Styling & Tokens:** Built using Tailwind CSS v4's `@theme` variables; design styles remain centralized rather than hardcoded.
* **Iconography:** Lightweight Hugeicons throughout, creating a consistent visual weight with a collapsible navigation sidebar.

---

## 🎯 Capstone Course Concept Demonstration

| Course Concept | Demonstration | Technical Details |
| :--- | :--- | :--- |
| **MCP Server** | Code | Local in-repo Google Classroom MCP server exposing announcements, assignments, and course details directly to the agent over an in-memory transport. |
| **Antigravity Workflow** | Process | Structured task scheduling via `spec.md`, `plan.md`, and `task.md`. Sandboxed execution limits context pollution. |
| **Security Features** | Code | Gated server-side API endpoints, Supabase RLS, session cookie isolation, and read-only Public Guest Demo Mode. |
| **Deployability** | Configuration | Production-ready setup for Vercel, with automated Supabase migrations and dynamic OAuth redirect callbacks. |
| **Agent Skills** | Code | Custom tools for Google Calendar mutations, DuckDuckGo web lookup, and multi-day study schedule generation. |

---

## 🚀 Future Roadmap

1. **Syllabus PDF Parsing:** Enable file uploads to allow the agent to parse PDF schedules and configure a student's entire semester calendar in a single prompt.
2. **LMS Integrations:** Support Moodle and Canvas API connectors.
3. **Bidirectional Calendar Sync:** Monitor external calendar edits to dynamically adapt and reschedule study blocks.
```
