-- Prevent duplicate auto-detected events (e.g. the same exam/quiz/assignment
-- deadline extracted from multiple announcements, or created by two concurrent
-- syncs). Keyed on (title, start_time, event_type) for auto-detected rows only,
-- so manually-created events stay unrestricted.
--
-- The sync concierge already de-duplicates in code, but a concurrent sync can
-- race past that check; this index is the authoritative guard. The insert path
-- already swallows the resulting unique-violation error and skips the row.

-- Clean up any pre-existing duplicates first (keep the earliest row per group).
DELETE FROM events a
USING events b
WHERE a.id <> b.id
  AND a.is_auto_detected = true
  AND b.is_auto_detected = true
  AND a.title = b.title
  AND a.start_time = b.start_time
  AND a.event_type = b.event_type
  AND a.created_at > b.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS events_auto_dedup_idx
  ON events (title, start_time, event_type)
  WHERE is_auto_detected = true;
