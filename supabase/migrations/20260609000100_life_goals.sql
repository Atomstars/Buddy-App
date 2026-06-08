-- ============================================================
-- Manifest / Life Goals (distinct from financial savings_goals)
-- Run in Supabase SQL Editor (safe to re-run)
-- ============================================================

CREATE TABLE IF NOT EXISTS life_goals (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT DEFAULT '',
  category     TEXT DEFAULT 'personal',   -- personal | health | career | finance | learning | relationships
  target_date  DATE,
  status       TEXT DEFAULT 'active',      -- active | done | paused
  progress     SMALLINT DEFAULT 0,         -- 0..100
  milestones   JSONB DEFAULT '[]'::jsonb,  -- [{ text, done }]
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

-- Optional: a single "north star" statement per user
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
