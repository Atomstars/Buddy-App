-- ============================================================
-- Phase 2.1: User Data Isolation + New Tables
-- Run in Supabase SQL Editor
-- ============================================================

-- ── 1. Add user_id to existing tables ────────────────────────

ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE budgets
  DROP CONSTRAINT IF EXISTS budgets_sector_key;
ALTER TABLE budgets
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE targets
  DROP CONSTRAINT IF EXISTS targets_type_key;
ALTER TABLE targets
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE timetable_tasks
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE lists
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE savings_goals
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── 2. Enable Row Level Security on all tables ─────────────────

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_entries ENABLE ROW LEVEL SECURITY;

-- ── 3. RLS Policies: expenses ──────────────────────────────────

DROP POLICY IF EXISTS expenses_select ON expenses;
DROP POLICY IF EXISTS expenses_insert ON expenses;
DROP POLICY IF EXISTS expenses_update ON expenses;
DROP POLICY IF EXISTS expenses_delete ON expenses;

CREATE POLICY expenses_select ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY expenses_insert ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY expenses_update ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY expenses_delete ON expenses FOR DELETE USING (auth.uid() = user_id);

-- ── 4. RLS Policies: budgets ───────────────────────────────────

DROP POLICY IF EXISTS budgets_select ON budgets;
DROP POLICY IF EXISTS budgets_insert ON budgets;
DROP POLICY IF EXISTS budgets_update ON budgets;
DROP POLICY IF EXISTS budgets_delete ON budgets;

CREATE POLICY budgets_select ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY budgets_insert ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY budgets_update ON budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY budgets_delete ON budgets FOR DELETE USING (auth.uid() = user_id);

-- ── 5. RLS Policies: targets ───────────────────────────────────

DROP POLICY IF EXISTS targets_select ON targets;
DROP POLICY IF EXISTS targets_insert ON targets;
DROP POLICY IF EXISTS targets_update ON targets;
DROP POLICY IF EXISTS targets_delete ON targets;

CREATE POLICY targets_select ON targets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY targets_insert ON targets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY targets_update ON targets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY targets_delete ON targets FOR DELETE USING (auth.uid() = user_id);

-- ── 6. RLS Policies: timetable_tasks ──────────────────────────

DROP POLICY IF EXISTS tasks_select ON timetable_tasks;
DROP POLICY IF EXISTS tasks_insert ON timetable_tasks;
DROP POLICY IF EXISTS tasks_update ON timetable_tasks;
DROP POLICY IF EXISTS tasks_delete ON timetable_tasks;

CREATE POLICY tasks_select ON timetable_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY tasks_insert ON timetable_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY tasks_update ON timetable_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY tasks_delete ON timetable_tasks FOR DELETE USING (auth.uid() = user_id);

-- ── 7. RLS Policies: lists ─────────────────────────────────────

DROP POLICY IF EXISTS lists_select ON lists;
DROP POLICY IF EXISTS lists_insert ON lists;
DROP POLICY IF EXISTS lists_update ON lists;
DROP POLICY IF EXISTS lists_delete ON lists;

CREATE POLICY lists_select ON lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY lists_insert ON lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY lists_update ON lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY lists_delete ON lists FOR DELETE USING (auth.uid() = user_id);

-- list_items join via lists
DROP POLICY IF EXISTS list_items_select ON list_items;
DROP POLICY IF EXISTS list_items_insert ON list_items;
DROP POLICY IF EXISTS list_items_update ON list_items;
DROP POLICY IF EXISTS list_items_delete ON list_items;

CREATE POLICY list_items_select ON list_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM lists WHERE lists.id = list_items.list_id AND lists.user_id = auth.uid()));
CREATE POLICY list_items_insert ON list_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM lists WHERE lists.id = list_items.list_id AND lists.user_id = auth.uid()));
CREATE POLICY list_items_update ON list_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM lists WHERE lists.id = list_items.list_id AND lists.user_id = auth.uid()));
CREATE POLICY list_items_delete ON list_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM lists WHERE lists.id = list_items.list_id AND lists.user_id = auth.uid()));

-- ── 8. RLS Policies: savings_goals ────────────────────────────

DROP POLICY IF EXISTS goals_select ON savings_goals;
DROP POLICY IF EXISTS goals_insert ON savings_goals;
DROP POLICY IF EXISTS goals_update ON savings_goals;
DROP POLICY IF EXISTS goals_delete ON savings_goals;

CREATE POLICY goals_select ON savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY goals_insert ON savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY goals_update ON savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY goals_delete ON savings_goals FOR DELETE USING (auth.uid() = user_id);

-- goal_entries join via savings_goals
DROP POLICY IF EXISTS goal_entries_select ON goal_entries;
DROP POLICY IF EXISTS goal_entries_insert ON goal_entries;
DROP POLICY IF EXISTS goal_entries_delete ON goal_entries;

CREATE POLICY goal_entries_select ON goal_entries FOR SELECT
  USING (EXISTS (SELECT 1 FROM savings_goals WHERE savings_goals.id = goal_entries.goal_id AND savings_goals.user_id = auth.uid()));
CREATE POLICY goal_entries_insert ON goal_entries FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM savings_goals WHERE savings_goals.id = goal_entries.goal_id AND savings_goals.user_id = auth.uid()));
CREATE POLICY goal_entries_delete ON goal_entries FOR DELETE
  USING (EXISTS (SELECT 1 FROM savings_goals WHERE savings_goals.id = goal_entries.goal_id AND savings_goals.user_id = auth.uid()));

-- ── 9. New Table: bills ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bills (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title         TEXT NOT NULL,
  amount        NUMERIC NOT NULL,
  category      TEXT DEFAULT 'general',
  due_date      DATE NOT NULL,
  is_recurring  BOOLEAN DEFAULT false,
  frequency     TEXT DEFAULT 'monthly',
  is_emi        BOOLEAN DEFAULT false,
  notes         TEXT DEFAULT '',
  is_paid       BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bills_select ON bills;
DROP POLICY IF EXISTS bills_insert ON bills;
DROP POLICY IF EXISTS bills_update ON bills;
DROP POLICY IF EXISTS bills_delete ON bills;

CREATE POLICY bills_select ON bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY bills_insert ON bills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY bills_update ON bills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY bills_delete ON bills FOR DELETE USING (auth.uid() = user_id);

-- ── 10. New Table: budget_plans ───────────────────────────────

CREATE TABLE IF NOT EXISTS budget_plans (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month_key        TEXT NOT NULL,       -- 'YYYY-MM' e.g. '2026-06'
  expected_income  NUMERIC DEFAULT 0,
  target_savings   NUMERIC DEFAULT 0,
  notes            TEXT DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_key)
);

ALTER TABLE budget_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plans_select ON budget_plans;
DROP POLICY IF EXISTS plans_insert ON budget_plans;
DROP POLICY IF EXISTS plans_update ON budget_plans;
DROP POLICY IF EXISTS plans_delete ON budget_plans;

CREATE POLICY plans_select ON budget_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY plans_insert ON budget_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY plans_update ON budget_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY plans_delete ON budget_plans FOR DELETE USING (auth.uid() = user_id);

-- ── 11. New Table: budget_plan_items ──────────────────────────

CREATE TABLE IF NOT EXISTS budget_plan_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id     UUID REFERENCES budget_plans(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type        TEXT NOT NULL,    -- 'fixed' | 'planned'
  category    TEXT NOT NULL,
  label       TEXT NOT NULL,
  amount      NUMERIC NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE budget_plan_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plan_items_select ON budget_plan_items;
DROP POLICY IF EXISTS plan_items_insert ON budget_plan_items;
DROP POLICY IF EXISTS plan_items_update ON budget_plan_items;
DROP POLICY IF EXISTS plan_items_delete ON budget_plan_items;

CREATE POLICY plan_items_select ON budget_plan_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY plan_items_insert ON budget_plan_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY plan_items_update ON budget_plan_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY plan_items_delete ON budget_plan_items FOR DELETE USING (auth.uid() = user_id);

-- ── 12. Add unique constraint to budgets per user ─────────────

CREATE UNIQUE INDEX IF NOT EXISTS budgets_user_sector_unique
  ON budgets(user_id, sector);

-- ── 13. Add unique constraint to targets per user ─────────────

CREATE UNIQUE INDEX IF NOT EXISTS targets_user_type_unique
  ON targets(user_id, type);
