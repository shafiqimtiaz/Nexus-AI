-- Nexus — Announcement AI summaries
-- Adds an `ai_summary` column so the concierge can store a short, easy-to-read
-- summary of each ingested announcement (generated from the raw content). The
-- dashboard surfaces this summary instead of the raw message body, while the
-- "Open in source" link still points at the original platform post.

ALTER TABLE announcements ADD COLUMN IF NOT EXISTS ai_summary TEXT;
