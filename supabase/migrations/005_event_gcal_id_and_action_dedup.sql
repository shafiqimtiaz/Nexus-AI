-- 005_event_gcal_id_and_action_dedup.sql
-- Adds gcal_event_id to events so the concierge can update the existing
-- Google Calendar event without overwriting source_external_id (which is the
-- dedup key). Also adds a partial unique index on agent_actions so the
-- concierge dedup check is enforced at the database level, not just by an
-- easily-raced .maybeSingle().

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS gcal_event_id TEXT;

-- Drop the prior unique on (source_platform, source_external_id)? Keep it --
-- the concierge now never mutates those two columns for synced events, so the
-- existing unique still dedupes Classroom coursework rows and concierge rows
-- separately.

-- Idempotent index: a single announcement may log at most one action of each
-- type. Partial on source_id IS NOT NULL so unrelated logs (e.g. global
-- "Concierge Sync Run" with source_id = null) aren't constrained.
CREATE UNIQUE INDEX IF NOT EXISTS agent_actions_dedup_idx
  ON agent_actions (user_id, source_id, action_type)
  WHERE source_id IS NOT NULL;
