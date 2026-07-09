-- Broaden auto-detected event de-duplication to survive AI / Google Calendar
-- TITLE VARIANCE. The previous key (description, start_time, event_type) still
-- missed pairs like "Quiz 2" vs "Quiz 2: Clipping Algorithms" at the same time
-- (different titles AND descriptions). We now normalize the title by dropping
-- everything after a colon / em-dash / en-dash (the "subtitle"), so both collapse
-- to "quiz 2" and are treated as the same event.
--
-- Key = (start_time, event_type, normalized_title) for auto-detected rows.
-- Two genuinely different quizzes at the same time with different normalized
-- titles still remain distinct.

DROP INDEX IF EXISTS events_auto_dedup_idx;

-- Purge pre-existing duplicates under the new key (keep the earliest row).
DELETE FROM events a
USING events b
WHERE a.id <> b.id
  AND a.is_auto_detected = true
  AND b.is_auto_detected = true
  AND a.start_time = b.start_time
  AND a.event_type = b.event_type
  AND substring(lower(regexp_replace(a.title, '[:–—].*$', '', 'g')), 1, 60)
    = substring(lower(regexp_replace(b.title, '[:–—].*$', '', 'g')), 1, 60)
  AND a.created_at > b.created_at;

CREATE UNIQUE INDEX events_auto_dedup_idx
  ON events (
    start_time,
    event_type,
    substring(lower(regexp_replace(title, '[:–—].*$', '', 'g')), 1, 60)
  )
  WHERE is_auto_detected = true;
