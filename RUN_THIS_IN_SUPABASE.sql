-- ============================================================
-- Aura — run this ONCE in Supabase SQL Editor to enable the new
-- Diary and Manifest features (Steps 3 & 4).
-- Safe to re-run. (Steps 1/2 needed no new tables.)
-- ============================================================

-- ── Diary / Daily Reflection ───────────────────────────────
CREATE TABLE IF NOT EXISTS diary_entries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date          DATE NOT NULL,
  mood          SMALLINT,
  content       TEXT DEFAULT '',
  wins          TEXT[] DEFAULT '{}',
  improvements  TEXT[] DEFAULT '{}',
  ai_review     TEXT DEFAULT '',
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

-- ── Manifest / Life Goals ──────────────────────────────────
CREATE TABLE IF NOT EXISTS life_goals (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT DEFAULT '',
  category     TEXT DEFAULT 'personal',
  target_date  DATE,
  status       TEXT DEFAULT 'active',
  progress     SMALLINT DEFAULT 0,
  milestones   JSONB DEFAULT '[]'::jsonb,
  is_pinned    BOOLEAN DEFAULT false,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE life_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS life_goals_select ON life_goals;
DROP POLICY IF EXISTS life_goals_insert ON life_goals;
DROP POLICY IF EXISTS life_goals_update ON life_goals;
DROP POLICY IF EXISTS life_goals_delete ON life_goals;
CREATE POLICY life_goals_select ON life_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY life_goals_insert ON life_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY life_goals_update ON life_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY life_goals_delete ON life_goals FOR DELETE USING (auth.uid() = user_id);

-- ── North-star vision (one per user) ───────────────────────
CREATE TABLE IF NOT EXISTS manifest_vision (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  statement  TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE manifest_vision ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS manifest_vision_select ON manifest_vision;
DROP POLICY IF EXISTS manifest_vision_insert ON manifest_vision;
DROP POLICY IF EXISTS manifest_vision_update ON manifest_vision;
CREATE POLICY manifest_vision_select ON manifest_vision FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY manifest_vision_insert ON manifest_vision FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY manifest_vision_update ON manifest_vision FOR UPDATE USING (auth.uid() = user_id);
