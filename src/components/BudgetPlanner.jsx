import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Plus, Trash2, Pencil, Check, X,
  TrendingUp, Home, Wifi, Zap, ShoppingCart, Car, Heart, Utensils,
  Briefcase, Dumbbell, BookOpen, Coffee, Smartphone, Tv, CreditCard,
  Target, PiggyBank, AlertCircle, CheckCircle2, ArrowDown, ArrowUp,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const CATEGORY_ICONS = {
  rent: Home, internet: Wifi, electricity: Zap, groceries: ShoppingCart,
  fuel: Car, health: Heart, food: Utensils, work: Briefcase,
  gym: Dumbbell, education: BookOpen, coffee: Coffee, phone: Smartphone,
  emi: CreditCard, entertainment: Tv, other: Target,
};

const PRESET_FIXED = [
  { label: 'Rent', category: 'rent' },
  { label: 'EMI', category: 'emi' },
  { label: 'Electricity', category: 'electricity' },
  { label: 'Internet', category: 'internet' },
  { label: 'Phone Bill', category: 'phone' },
];

const PRESET_PLANNED = [
  { label: 'Groceries', category: 'groceries' },
  { label: 'Fuel', category: 'fuel' },
  { label: 'Food & Dining', category: 'food' },
  { label: 'Health', category: 'health' },
  { label: 'Entertainment', category: 'entertainment' },
  { label: 'Shopping', category: 'other' },
];

const ItemRow = ({ item, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(String(item.amount));
  const [editLabel, setEditLabel] = useState(item.label);
  const Icon = CATEGORY_ICONS[item.category] || Target;

  const save = () => {
    const amt = parseFloat(editVal) || 0;
    onUpdate(item.id, { label: editLabel, amount: amt });
    setEditing(false);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '12px 16px',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: item.type === 'fixed' ? 'rgba(244,63,94,0.12)' : 'rgba(99,102,241,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} color={item.type === 'fixed' ? '#f43f5e' : '#818cf8'} />
      </div>

      {editing ? (
        <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={editLabel}
            onChange={e => setEditLabel(e.target.value)}
            style={{
              flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '4px 8px', color: '#fff', fontSize: 13, outline: 'none',
            }}
          />
          <input
            type="number"
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            style={{
              width: 100, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '4px 8px', color: '#fff', fontSize: 13, outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button onClick={save} style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={16} />
            </button>
            <button onClick={() => setEditing(false)} style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#fff' }}>{item.label}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{formatCurrency(item.amount)}</span>
          <button onClick={() => { setEditing(true); setEditVal(String(item.amount)); setEditLabel(item.label); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4 }}>
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(item.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4 }}>
            <Trash2 size={13} />
          </button>
        </>
      )}
    </div>
  );
};

const AddItemRow = ({ type, onAdd, onCancel }) => {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const presets = type === 'fixed' ? PRESET_FIXED : PRESET_PLANNED;

  const handleAdd = () => {
    if (!label.trim() || !amount) return;
    onAdd({ type, label: label.trim(), amount: parseFloat(amount) || 0, category });
    onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      style={{
        background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16,
        border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
        Quick Add
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {presets.map(p => (
          <button key={p.label} onClick={() => { setLabel(p.label); setCategory(p.category); }}
            style={{
              padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
              background: label === p.label ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', color: label === p.label ? '#fff' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
            }}>{p.label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Label"
          value={label}
          onChange={e => setLabel(e.target.value)}
          style={{
            flex: 1, height: 40, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '0 12px', color: '#fff', fontSize: 13, outline: 'none',
          }}
        />
        <input
          type="number"
          placeholder="₹ Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{
            width: 120, height: 40, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '0 12px', color: '#fff', fontSize: 13, outline: 'none',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{
          padding: '8px 16px', borderRadius: 10, background: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer',
        }}>Cancel</button>
        <button onClick={handleAdd} style={{
          padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Add</button>
      </div>
    </motion.div>
  );
};

const SectionCard = ({ title, color, icon: Icon, items, type, total, onAddItem, onUpdateItem, onDeleteItem }) => {
  const [adding, setAdding] = useState(false);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: 20,
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} color={color} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{title}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
              {items.length} item{items.length !== 1 ? 's' : ''} · {formatCurrency(total)}
            </p>
          </div>
        </div>
        <button
          id={`add-${type}-btn`}
          onClick={() => setAdding(true)}
          style={{
            width: 32, height: 32, borderRadius: 10, background: `${color}20`,
            border: `1px solid ${color}40`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
          }}>
          <Plus size={16} color={color} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => (
          <ItemRow
            key={item.id}
            item={item}
            onUpdate={onUpdateItem}
            onDelete={onDeleteItem}
          />
        ))}

        <AnimatePresence>
          {adding && (
            <AddItemRow
              type={type}
              onAdd={(data) => { onAddItem(data); setAdding(false); }}
              onCancel={() => setAdding(false)}
            />
          )}
        </AnimatePresence>

        {!adding && items.length === 0 && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '8px 0' }}>
            No items yet. Tap + to add.
          </p>
        )}
      </div>
    </div>
  );
};

export const BudgetPlanner = ({
  displayLabel, isFutureMonth, isCurrentMonth,
  prevMonth, nextMonth,
  planner,
}) => {
  const {
    plan, fixedItems, plannedItems, loading, saving,
    expectedIncome, targetSavings, totalFixed, totalPlanned,
    expectedSavings, savingsSurplus,
    upsertPlan, addPlanItem, updatePlanItem, deletePlanItem,
  } = planner;

  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeVal, setIncomeVal] = useState('');
  const [editingSavings, setEditingSavings] = useState(false);
  const [savingsVal, setSavingsVal] = useState('');
  const [savingMsg, setSavingMsg] = useState('');

  const handleSaveIncome = async () => {
    await upsertPlan({ expectedIncome: parseFloat(incomeVal) || 0, targetSavings });
    setEditingIncome(false);
    showSaved();
  };

  const handleSaveSavings = async () => {
    await upsertPlan({ expectedIncome, targetSavings: parseFloat(savingsVal) || 0 });
    setEditingSavings(false);
    showSaved();
  };

  const showSaved = () => {
    setSavingMsg('Saved!');
    setTimeout(() => setSavingMsg(''), 2000);
  };

  const savingsColor = expectedSavings >= targetSavings ? '#10b981' : expectedSavings >= 0 ? '#f59e0b' : '#f43f5e';
  const surplusPositive = savingsSurplus >= 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
        Loading plan...
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 160 }}>
      {/* Month Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 24 }}>
        <button onClick={prevMonth} style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronLeft size={18} color="#fff" />
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{displayLabel}</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
            {isFutureMonth ? '🗓 Planning mode' : isCurrentMonth ? '📅 Current month' : '📂 Past month'}
          </p>
        </div>
        <button onClick={nextMonth} style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronRight size={18} color="#fff" />
        </button>
      </div>

      {savingMsg && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '10px 16px', marginBottom: 16, textAlign: 'center', fontSize: 13, color: '#10b981', fontWeight: 600 }}>
          ✓ {savingMsg}
        </motion.div>
      )}

      {/* ── Income ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.03))', borderRadius: 24, padding: 24, border: '1px solid rgba(16,185,129,0.2)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} color="#10b981" />
            <p style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>Expected Income</p>
          </div>
          {!editingIncome && (
            <button id="edit-income-btn" onClick={() => { setIncomeVal(String(expectedIncome)); setEditingIncome(true); }}
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '4px 10px', color: '#10b981', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Edit
            </button>
          )}
        </div>

        {editingIncome ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
            <input
              id="income-input"
              type="number"
              value={incomeVal}
              onChange={e => setIncomeVal(e.target.value)}
              placeholder="Enter expected income"
              autoFocus
              style={{
                flex: 1, height: 44, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(16,185,129,0.4)',
                borderRadius: 12, padding: '0 16px', color: '#fff', fontSize: 16, fontWeight: 600, outline: 'none',
              }}
            />
            <button onClick={handleSaveIncome} id="save-income-btn"
              style={{ height: 44, padding: '0 16px', borderRadius: 12, background: '#10b981', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Save
            </button>
            <button onClick={() => setEditingIncome(false)}
              style={{ height: 44, width: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <p style={{ fontSize: 36, fontWeight: 800, color: '#10b981', letterSpacing: '-1px', marginTop: 4 }}>
            {expectedIncome > 0 ? formatCurrency(expectedIncome) : (
              <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Tap Edit to set income</span>
            )}
          </p>
        )}
      </motion.div>

      {/* ── Fixed Expenses ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{ marginBottom: 20 }}>
        <SectionCard
          title="Fixed Expenses"
          color="#f43f5e"
          icon={CreditCard}
          items={fixedItems}
          type="fixed"
          total={totalFixed}
          onAddItem={addPlanItem}
          onUpdateItem={updatePlanItem}
          onDeleteItem={deletePlanItem}
        />
      </motion.div>

      {/* ── Planned Spending ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 20 }}>
        <SectionCard
          title="Planned Spending"
          color="#818cf8"
          icon={ShoppingCart}
          items={plannedItems}
          type="planned"
          total={totalPlanned}
          onAddItem={addPlanItem}
          onUpdateItem={updatePlanItem}
          onDeleteItem={deletePlanItem}
        />
      </motion.div>

      {/* ── Target Savings ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: 20, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PiggyBank size={18} color="#fbbf24" />
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24' }}>Target Savings</p>
          </div>
          {!editingSavings && (
            <button id="edit-target-savings-btn" onClick={() => { setSavingsVal(String(targetSavings)); setEditingSavings(true); }}
              style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8, padding: '4px 10px', color: '#fbbf24', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Edit
            </button>
          )}
        </div>

        {editingSavings ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              id="target-savings-input"
              type="number"
              value={savingsVal}
              onChange={e => setSavingsVal(e.target.value)}
              placeholder="Target savings amount"
              autoFocus
              style={{
                flex: 1, height: 44, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(251,191,36,0.4)',
                borderRadius: 12, padding: '0 16px', color: '#fff', fontSize: 16, fontWeight: 600, outline: 'none',
              }}
            />
            <button onClick={handleSaveSavings} id="save-target-savings-btn"
              style={{ height: 44, padding: '0 16px', borderRadius: 12, background: '#fbbf24', border: 'none', color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Save
            </button>
            <button onClick={() => setEditingSavings(false)}
              style={{ height: 44, width: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <p style={{ fontSize: 28, fontWeight: 800, color: '#fbbf24', letterSpacing: '-0.5px' }}>
            {targetSavings > 0 ? formatCurrency(targetSavings) : (
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Set your savings goal</span>
            )}
          </p>
        )}
      </motion.div>

      {/* ── Calculation Panel ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
          borderRadius: 28, padding: 24, border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)', marginBottom: 20,
        }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
          Budget Calculation
        </p>

        {[
          { label: 'Expected Income', value: expectedIncome, color: '#10b981', icon: ArrowUp, sign: '+' },
          { label: 'Fixed Expenses', value: totalFixed, color: '#f43f5e', icon: ArrowDown, sign: '-' },
          { label: 'Planned Spending', value: totalPlanned, color: '#818cf8', icon: ArrowDown, sign: '-' },
        ].map(({ label, value, color, icon: Icon, sign }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={14} color={color} />
              </div>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{label}</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: color }}>
              {sign} {formatCurrency(value)}
            </span>
          </div>
        ))}

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '16px 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Expected Savings</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: savingsColor, letterSpacing: '-0.5px' }}>
            {formatCurrency(Math.abs(expectedSavings))}
            {expectedSavings < 0 && ' deficit'}
          </span>
        </div>

        {targetSavings > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: surplusPositive ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
            borderRadius: 16, padding: '12px 16px',
            border: `1px solid ${surplusPositive ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
          }}>
            {surplusPositive
              ? <CheckCircle2 size={18} color="#10b981" />
              : <AlertCircle size={18} color="#f43f5e" />
            }
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: surplusPositive ? '#10b981' : '#f43f5e' }}>
                {surplusPositive ? `₹${Math.abs(savingsSurplus).toLocaleString('en-IN')} surplus` : `₹${Math.abs(savingsSurplus).toLocaleString('en-IN')} shortfall`}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                {surplusPositive ? 'You\'re ahead of your savings target!' : 'Consider reducing expenses to meet your target.'}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BudgetPlanner;
