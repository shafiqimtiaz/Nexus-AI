# Privacy Policy — Nexus

Nexus is a single-owner personal academic organizer built for the Kaggle AI Agents Capstone. This document describes what data the app touches and how it is handled.

## What data Nexus stores

| Data                           | Source                                                             | Where it lives                               |
| ------------------------------ | ------------------------------------------------------------------ | -------------------------------------------- |
| Announcements & assignments    | Google Classroom, Discord, Slack                                   | Supabase (owner) / local mock DB (demo)      |
| Calendar events & study blocks | Synced platforms, the AI agent, or manual entry                    | Supabase / local mock DB                     |
| Resource links & labels        | Saved by the owner or the AI agent                                 | Supabase / local mock DB                     |
| Connection credentials         | Google OAuth tokens, Discord/Slack user tokens pasted by the owner | Supabase `platforms` table, server-side only |

## Token handling

- All platform tokens (Google OAuth, Discord user token, Slack `xoxc`/`xoxd`) are stored and used **server-side only**. They are never returned to the browser, embedded in pages, or written to logs.
- API routes that read platform data deliberately strip tokens from every response.
- Row Level Security is enabled on all Supabase tables with no public policies, so browser clients cannot query the database directly.

## AI processing

- Announcement text is sent to the **Google Gemini API** to detect exam dates, deadlines, and resource links during sync.
- Chat messages on the AI Chat page are sent to Gemini with the tools needed to answer (calendar, resources, announcements).
- No data is used to train models by Nexus; refer to [Google's Gemini API terms](https://ai.google.dev/gemini-api/terms) for provider-side handling.

## Google Calendar access

The optional Google Calendar connection uses a write scope so the agent can create study blocks and exam events on the owner's primary calendar. Events are only created in response to a sync detection or an explicit chat request, and every autonomous action is recorded in the dashboard's **Agent Activity** log.

## Demo mode (public visitors)

Visitors who are not signed in see **seeded mock data only** — no real announcements, tokens, or personal information. All mutations and live AI calls are disabled for demo users, so public traffic cannot spend API quota or touch owner data.

## Analytics & tracking

Nexus includes no analytics, advertising, or tracking scripts.

## Data removal

- Disconnecting a platform on the **Options** page deletes its stored tokens.
- All cached content (announcements, events, resources) can be deleted by the owner directly in Supabase; nothing is retained elsewhere.
