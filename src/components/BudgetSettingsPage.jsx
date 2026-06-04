import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Save, DollarSign, Target, Wallet, ShoppingCart, Car, Heart, Utensils, Sparkles, Coffee, Check } from 'lucide-react';
import { formatCurrency, SECTORS } from '../utils/formatters';

const CATEGORY_ICONS = {
  groceries: ShoppingCart, transport: Car, health: Heart, food: Utensils,
  fun: Sparkles, other: Coffee,
};

const InputField = ({ label, value, onChange, prefix = '₹', hint }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>
        {label}
      </label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: focused ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${focused ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 12, padding: '0 14px', transition: 'all 0.2s',
      }}>
        <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{prefix}</span>
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, height: 48, background: 'transparent', border: 'none',
            color: '#fff', fontSize: 16, fontWeight: 600, outline: 'none',
          }}
        />
      </div>
      {hint && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{hint}</p>}
    </div>
  );
};

export const BudgetSettingsPage = ({
  onBack,
  monthlyTarget, weeklyTarget, monthlyIncome,
  budgets,
  onUpdateMonthlyTarget, onUpdateWeeklyTarget, onUpdateMonthlyIncome,
  onUpdateBudget,
}) => {
  const [monthlyBudget, setMonthlyBudget] = useState(String(monthlyTarget || ''));
  const [weeklyBudget, setWeeklyBudget] = useState(String(weeklyTarget || ''));
  const [income, setIncome] = useState(String(monthlyIncome || ''));
  const [categoryBudgets, setCategoryBudgets] = useState(() => {
    const b = {};
    SECTORS.forEach(s => { b[s.id] = String(budgets?.[s.id] || ''); });
    return b;
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setMonthlyBudget(String(monthlyTarget || ''));
    setWeeklyBudget(String(weeklyTarget || ''));
    setIncome(String(monthlyIncome || ''));
  }, [monthlyTarget, weeklyTarget, monthlyIncome]);

  useEffect(() => {
    const b = {};
    SECTORS.forEach(s => { b[s.id] = String(budgets?.[s.id] || ''); });
    setCategoryBudgets(b);
  }, [budgets]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (onUpdateMonthlyTarget) await onUpdateMonthlyTarget(parseFloat(monthlyBudget) || 0);
      if (onUpdateWeeklyTarget) await onUpdateWeeklyTarget(parseFloat(weeklyBudget) || 0);
      if (onUpdateMonthlyIncome) await onUpdateMonthlyIncome(parseFloat(income) || 0);
      if (onUpdateBudget) {
        for (const [sector, amount] of Object.entries(categoryBudgets)) {
          await onUpdateBudget(sector, parseFloat(amount) || 0);
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Save error', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ paddingBottom: 160 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button
          id="budget-settings-back-btn"
          onClick={onBack}
          style={{
            width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: '#fff',
          }}>
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>Budget Settings</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Configure your financial limits</p>
        </div>
      </div>

      {/* ── Financial Targets ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 20, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Target size={18} color="#818cf8" />
          <p style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Financial Targets</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <InputField
            label="Monthly Income"
            value={income}
            onChange={setIncome}
            hint="Your expected total monthly income"
          />
          <InputField
            label="Monthly Budget Cap"
            value={monthlyBudget}
            onChange={setMonthlyBudget}
            hint="Maximum you want to spend this month"
          />
          <InputField
            label="Weekly Budget Cap"
            value={weeklyBudget}
            onChange={setWeeklyBudget}
            hint="Used for week-based analytics"
          />
        </div>
      </motion.div>

      {/* ── Category Limits ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 20, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Wallet size={18} color="#10b981" />
          <p style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Category Limits</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {SECTORS.map(sector => {
            const Icon = CATEGORY_ICONS[sector.id] || ShoppingCart;
            return (
              <div key={sector.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color="rgba(255,255,255,0.6)" />
                </div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{sector.label}</span>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '0 10px', height: 38,
                }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>₹</span>
                  <input
                    type="number"
                    value={categoryBudgets[sector.id]}
                    onChange={e => setCategoryBudgets(prev => ({ ...prev, [sector.id]: e.target.value }))}
                    style={{
                      width: 80, background: 'transparent', border: 'none',
                      color: '#fff', fontSize: 14, fontWeight: 600, outline: 'none', textAlign: 'right',
                    }}
                    placeholder="0"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Save Button ── */}
      <motion.button
        id="save-budget-settings-btn"
        onClick={handleSave}
        disabled={saving}
        whileTap={{ scale: 0.97 }}
        style={{
          width: '100%', height: 56, borderRadius: 18,
          background: saved ? 'rgba(16,185,129,0.9)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none', color: '#fff', fontSize: 16, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          boxShadow: '0 8px 24px rgba(99,102,241,0.3)', transition: 'background 0.3s',
        }}
      >
        {saved ? <><Check size={20} /> Saved!</> : saving ? 'Saving...' : <><Save size={20} /> Save Settings</>}
      </motion.button>
    </div>
  );
};

export default BudgetSettingsPage;
