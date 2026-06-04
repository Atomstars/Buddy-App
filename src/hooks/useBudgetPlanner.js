import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

/**
 * useBudgetPlanner
 * Manages budget_plans + budget_plan_items for a given user + month.
 * 
 * @param {string} userId  - auth user id
 * @param {string} monthKey - 'YYYY-MM' e.g. '2026-06'
 */
export const useBudgetPlanner = (userId, monthKey) => {
  const [plan, setPlan] = useState(null);          // budget_plans row
  const [planItems, setPlanItems] = useState([]);  // budget_plan_items rows
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Fetch plan for this user+month ────────────────────────────
  const fetchPlan = useCallback(async () => {
    if (!userId || !monthKey) return;
    setLoading(true);
    try {
      const { data: planData } = await supabase
        .from('budget_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('month_key', monthKey)
        .single();

      if (planData) {
        setPlan(planData);
        // Fetch items for this plan
        const { data: itemsData } = await supabase
          .from('budget_plan_items')
          .select('*')
          .eq('plan_id', planData.id)
          .order('created_at', { ascending: true });
        setPlanItems(itemsData || []);
      } else {
        setPlan(null);
        setPlanItems([]);
      }
    } catch (err) {
      console.error('useBudgetPlanner fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [userId, monthKey]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  // ── Upsert plan header (income + target savings) ──────────────
  const upsertPlan = useCallback(async ({ expectedIncome, targetSavings, notes }) => {
    if (!userId || !monthKey) return;
    setSaving(true);
    try {
      const payload = {
        user_id: userId,
        month_key: monthKey,
        expected_income: Number(expectedIncome) || 0,
        target_savings: Number(targetSavings) || 0,
        notes: notes || '',
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('budget_plans')
        .upsert(payload, { onConflict: 'user_id,month_key' })
        .select()
        .single();

      if (!error && data) {
        setPlan(data);
        return data;
      }
    } catch (err) {
      console.error('upsertPlan error', err);
    } finally {
      setSaving(false);
    }
  }, [userId, monthKey]);

  // ── Add item (fixed expense or planned spending) ──────────────
  const addPlanItem = useCallback(async ({ type, category, label, amount }) => {
    if (!userId) return;

    // Ensure plan exists first
    let currentPlan = plan;
    if (!currentPlan) {
      currentPlan = await upsertPlan({ expectedIncome: 0, targetSavings: 0 });
    }
    if (!currentPlan) return;

    const payload = {
      plan_id: currentPlan.id,
      user_id: userId,
      type,       // 'fixed' | 'planned'
      category,
      label,
      amount: Number(amount) || 0,
    };

    const { data, error } = await supabase
      .from('budget_plan_items')
      .insert([payload])
      .select()
      .single();

    if (!error && data) {
      setPlanItems(prev => [...prev, data]);
    }
  }, [userId, plan, upsertPlan]);

  // ── Update existing item ──────────────────────────────────────
  const updatePlanItem = useCallback(async (id, updates) => {
    const dbUpdates = {};
    if (updates.label !== undefined) dbUpdates.label = updates.label;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.amount !== undefined) dbUpdates.amount = Number(updates.amount) || 0;
    if (updates.type !== undefined) dbUpdates.type = updates.type;

    const { error } = await supabase
      .from('budget_plan_items')
      .update(dbUpdates)
      .eq('id', id);

    if (!error) {
      setPlanItems(prev => prev.map(item => item.id === id ? { ...item, ...dbUpdates } : item));
    }
  }, []);

  // ── Delete item ───────────────────────────────────────────────
  const deletePlanItem = useCallback(async (id) => {
    const { error } = await supabase
      .from('budget_plan_items')
      .delete()
      .eq('id', id);

    if (!error) {
      setPlanItems(prev => prev.filter(item => item.id !== id));
    }
  }, []);

  // ── Computed totals ───────────────────────────────────────────
  const fixedItems = planItems.filter(i => i.type === 'fixed');
  const plannedItems = planItems.filter(i => i.type === 'planned');
  const totalFixed = fixedItems.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalPlanned = plannedItems.reduce((sum, i) => sum + Number(i.amount), 0);
  const expectedIncome = Number(plan?.expected_income) || 0;
  const targetSavings = Number(plan?.target_savings) || 0;
  const expectedSavings = expectedIncome - totalFixed - totalPlanned;
  const savingsSurplus = expectedSavings - targetSavings;

  return {
    plan,
    planItems,
    fixedItems,
    plannedItems,
    loading,
    saving,
    // computed
    expectedIncome,
    targetSavings,
    totalFixed,
    totalPlanned,
    expectedSavings,
    savingsSurplus,
    // actions
    upsertPlan,
    addPlanItem,
    updatePlanItem,
    deletePlanItem,
    refetch: fetchPlan,
  };
};

export default useBudgetPlanner;
