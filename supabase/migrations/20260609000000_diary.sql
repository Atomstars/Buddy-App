-- ============================================================
-- Diary / Daily Reflection
-- Run in Supabase SQL Editor (safe to re-run)
-- ============================================================

CREATE TABLE IF NOT EXISTS diary_entries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date          DATE NOT NULL,
  mood          SMALLINT,                 -- 1 (rough) .. 5 (great)
  content       TEXT DEFAULT '',          -- free-form "what happened today"
  wins          TEXT[] DEFAULT '{}',      -- what went well
  improvements  TEXT[] DEFAULT '{}',      -- what could be better
  ai_review     TEXT DEFAULT '',          -- cached AI reflection
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS diary_select ON diary_entries;
DROP POLICY IF EXISTS diary_insert ON diary_entries;
DROP POLICY IF EXISTS diary_update ON diary_entries;
DROP POLICY IF EXISTS diary_delete ON diary_entries;

CREATE POLICY diary_select ON diary_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY diary_insert ON diary_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY diary_update ON diary_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY diary_delete ON diary_entries FOR DELETE USING (auth.uid() = user_id);
