# Kaggle Capstone Project Write-Up — Concierge Track

**Project Name:** Nexus AI — Personal Academic Concierge  
**Live Site:** [https://nexus-ai-tool.vercel.app/](https://nexus-ai-tool.vercel.app/)  
**GitHub Repository:** [https://github.com/shafiqimtiaz/nexus-ai](https://github.com/shafiqimtiaz/nexus-ai)  
**Track:** Concierge Track (Google AI Agents Intensive Hackathon)

---

## 1. Executive Summary & Abstract

**Nexus AI** is a personal academic concierge designed to address the fragmentation of modern digital classrooms. Students today face a constant cognitive tax: class announcements are scattered across Discord and Slack, course assignments are listed on Google Classroom, and study blocks must be manually scheduled on Google Calendar. This fragmentation leads to missed deadlines, sub-optimal preparation, and constant platform-switching.

Nexus centralizes these feeds into a single unified workspace. At its core is an **Agentic AI Concierge** powered by Gemini. By leveraging custom tools, a local Model Context Protocol (MCP) server for Google Classroom, and a web-scraping search engine, the agent dynamically parses announcements, syncs assignments, manages calendar events, indexes resources, and builds multi-day study schedules. By integrating write permissions directly to the user's **Google Calendar**, Nexus turns conversations into scheduled, structured actions.

---

## 2. Technical Architecture & Data Flow

Nexus routes all operations through a secure Next.js server boundary to prevent token leakage and maintain clean architectural separation.

```
                  ┌──────────────────┐          ┌─────────────┐
                  │ Google Classroom │          │Discord/Slack│
                  └────────┬─────────┘          └──────┬──────┘
                           │ OAuth token                │ user tokens
  ┌────────────────────────▼─────────┐                  │
  │  Classroom MCP Server (in-repo)  │                  │
  └────────────────────────┬─────────┘                  │
                           │                            │
                     ┌─────▼────────────────────────────▼────┐
                     │          Next.js Backend API          │
                     │  - Ingests /api/sync                  ├─► Supabase Database (RLS)
                     │  - Chat endpoint /api/chat            │   (Stores cached data)
                     │  - Tool-calling agent: Gemini         │
                     └───────────────────┬───────────────────┘
                                         │ JSON Responses
                                         │ (No sensitive tokens leaked)
                     ┌───────────────────▼───────────────────┐
                     │          Next.js Frontend UI          │
                     │  - Logged-in Owner (Full access)      │
                     │  - Demo User (Read-only Seeded data)  │
                     └───────────────────────────────────────┘
```

### The Ingestion Pipeline & Syncing
Instead of loading external APIs on every render (which triggers rate limits), Nexus implements a **Stale-While-Revalidate Sync-on-Load** routine.
* When a user visits the Dashboard, the frontend hits `/api/sync`.
* If data was synced within the last 15 minutes, it returns cached records from Supabase.
* Otherwise, it asynchronously pulls from Google Classroom (via MCP tools) and from Discord and Slack channels (using the owner's own paste-in session tokens — no bots to create or invite), parses new assignments, creates countdowns, and updates the local cache database.

---

## 3. Core Agentic Capabilities & Tool Design

Nexus uses the **Vercel AI SDK** to implement a multi-step, tool-calling loop (capped at a depth of 8 steps). The model can chain tool executions—for example, searching recent announcements, detecting a math exam date, and immediately creating a Google Calendar event.

The agent's capabilities are divided into dedicated tools inside [tools.ts](file:///home/shafiq.imtiaz/Documents/nexus-ai/src/lib/ai/tools.ts):

1. **Google Classroom MCP Integration:** Communicates with a local, in-repo MCP server running over an in-memory transport bridge. The model uses this to fetch courses, announcements, and attachments without querying Google's APIs directly.
2. **Google Calendar Write Integration:** Using OAuth scopes, the concierge agent can write events directly to the user's primary Google Calendar. Whenever the agent schedules a study plan or logs an exam, it performs a real-time post request to Google's Calendar v3 API.
3. **DuckDuckGo Web Search Tool:** A zero-dependency web parser that scrapes DuckDuckGo's HTML fallback interface. It allows the agent to lookup study resources, definitions, and tutorials on the web.
4. **Study Planner (`generate_study_plan`):** Dynamically inserts study blocks into the calendar leading up to an exam, ensuring the student has dedicated review times.

### Mid-Conversation Model Selector
To accommodate different latency and cost budgets, the frontend features a **mid-conversation model selector** at the bottom of the prompt interface. It supports:
* `gemini-3.1-flash-lite` (Default — low latency, quick answers)
* `gemini-3.5-flash` (For complex scheduling and multi-step planning tasks)

The selected model travels with each request, so users can swap models fluidly mid-conversation based on the complexity of their request. The server validates the requested model against an allowlist before routing to Gemini.

---

## 4. Security & The Concierge Guardrail

As a concierge application connecting to personal accounts, security is paramount. Nexus implements three core security guardrails:

* **Row-Level Security (RLS):** Every database table in Supabase is protected by strict RLS policies. User data and external connection tokens (Google Classroom OAuth codes, Discord/Slack user tokens) are stored securely and never exposed to the client browser.
* **Server-Only API execution:** The frontend never connects to Supabase data tables or Google API endpoints directly. All mutations and token exchanges happen server-side within Next.js API route handlers, gated by an owner check (`requireOwner`) that verifies the session against Supabase Auth before any write.
* **Public Guest Demo Mode:** To meet the hackathon requirements of a public link without requiring judges to link their private Google Classroom accounts, Nexus implements a gated **Demo Mode**. Guest users browse a fully-featured, read-only mocked state with seeded data, while write features and Gemini API routing are completely locked.

---

## 5. Visual Design System

Nexus uses a minimal, dark-first interface that keeps a student's attention on dates and deadlines rather than on chrome.

* **Typography:** Geist Sans and Geist Mono, loaded through `next/font`, give the UI a clean, contemporary voice with monospace reserved for timestamps and data.
* **Palette:** A near-black canvas (`oklch(0.145 0 0)`) with slightly raised cards (`oklch(0.205 0 0)`) and a single emerald primary accent (`oklch(0.696 0.155 163)`) reserved for active navigation and stat icons. A mirrored light-mode token set follows the system preference via `next-themes`.
* **Design tokens:** Every color is defined once as a CSS variable and consumed through Tailwind CSS v4's `@theme` mapping, so components never hard-code a color.
* **Iconography:** Hugeicons throughout at a consistent small sizing, for a lighter visual weight than filled icon sets, with a collapsible sidebar for a focused reading column.

---

## 6. Future Roadmap

1. **Syllabus PDF Processing:** Equipping the agent with tools to parse uploaded syllabus PDFs and automatically schedule the entire semester's calendar in one click.
2. **Moodle & Canvas Integrations:** Supporting additional platform ingestions for universities that host coursework on Moodle or Canvas.
3. **Bidirectional Calendar Sync:** Monitoring changes made directly on Google Calendar to automatically reschedule study sessions if the student moves a conflict.
