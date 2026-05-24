import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Receipt,
  Paperclip,
  ShoppingCart,
  Apple,
  UtensilsCrossed,
  CarFront,
  ShoppingBag,
  HeartPulse,
  Sparkles,
} from 'lucide-react';
import { SECTORS, formatCurrency, getPercentage, getSector } from '../utils/formatters';
import { formatDate } from '../utils/dateUtils';

const sectorIcons = {
  groceries: ShoppingCart,
  fruits: Apple,
  food: UtensilsCrossed,
  transport: CarFront,
  shopping: ShoppingBag,
  bills: Receipt,
  health: HeartPulse,
  fun: Sparkles,
  other: Paperclip,
};

export const CategoryInsights = ({ activeStats, expenses, onBack }) => {
  const [selectedSector, setSelectedSector] = useState(null);

  const sectorExpenses = selectedSector
    ? expenses.filter(e => e.sector === selectedSector).sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn-icon" onClick={onBack}>
          <ChevronLeft size={20} />
        </button>
        <div>
          <p className="section-eyebrow">Monthly Breakdown</p>
          <h2 className="section-title" style={{ fontSize: '1.2rem' }}>Category Deep-Dive</h2>
        </div>
      </div>

      {/* Category scroll strip */}
      <div className="category-scroll">
        {activeStats.bySector.map((item) => {
          const sector = getSector(item.sector);
          const Icon = sectorIcons[item.sector] || Paperclip;
          const percent = getPercentage(item.amount, item.budget);
          const isSelected = selectedSector === item.sector;

          return (
            <button
              key={item.sector}
              className={`category-chip ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedSector(isSelected ? null : item.sector)}
              style={isSelected ? { borderColor: sector.color, background: `${sector.color}18` } : {}}
            >
              <div className="category-chip-icon" style={{ color: sector.color }}>
                <Icon size={18} />
              </div>
              <span className="category-chip-name">{sector.shortLabel}</span>
              <span className="category-chip-amount">{formatCurrency(item.amount)}</span>
              <div className="category-chip-bar">
                <div
                  className={`category-chip-bar-fill ${percent >= 100 ? 'danger' : percent >= 80 ? 'warning' : ''}`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary cards */}
      <div className="surface-card" style={{ padding: 20 }}>
        <div className="section-header" style={{ marginBottom: 12 }}>
          <div>
            <p className="section-eyebrow">Overview</p>
            <h3 className="section-title" style={{ fontSize: '1rem' }}>All Categories</h3>
          </div>
          <span className="section-badge">{activeStats.bySector.length} sectors</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activeStats.bySector.map((item) => {
            const sector = getSector(item.sector);
            const Icon = sectorIcons[item.sector] || Paperclip;
            const percent = getPercentage(item.amount, item.budget);
            const left = item.budget - item.amount;
            const isSelected = selectedSector === item.sector;

            return (
              <button
                key={item.sector}
                onClick={() => setSelectedSector(isSelected ? null : item.sector)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                  background: isSelected ? `${sector.color}12` : 'var(--surface-2)',
                  border: isSelected ? `1px solid ${sector.color}40` : '1px solid transparent',
                  borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s', width: '100%', color: 'inherit',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center',
                  color: sector.color, background: `${sector.color}18`, flexShrink: 0,
                }}>
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <strong style={{ fontSize: '0.88rem' }}>{sector.label}</strong>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="progress-track" style={{ height: 4, marginBottom: 4 }}>
                    <div
                      className={`progress-fill ${percent >= 100 ? 'danger' : percent >= 80 ? 'warning' : ''}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-3)' }}>
                    <span>{percent}% used</span>
                    <span style={{ color: left < 0 ? 'var(--rose)' : 'var(--text-3)' }}>
                      {left < 0 ? `${formatCurrency(Math.abs(left))} over` : `${formatCurrency(left)} left`}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Transaction log for selected category */}
      {selectedSector && (
        <motion.div
          className="surface-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: 20 }}
        >
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div>
              <p className="section-eyebrow">Transaction Log</p>
              <h3 className="section-title" style={{ fontSize: '1rem' }}>{getSector(selectedSector).label} History</h3>
            </div>
            <span className="section-badge">{sectorExpenses.length} entries</span>
          </div>

          {sectorExpenses.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <Receipt size={24} />
              <p>No transactions in this category</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {sectorExpenses.map((expense) => {
                const sector = getSector(expense.sector);
                const Icon = sectorIcons[expense.sector] || Paperclip;
                return (
                  <div className="transaction-row" key={expense.id}>
                    <div className="transaction-row-icon" style={{ color: sector.color, background: `${sector.color}18` }}>
                      <Icon size={16} />
                    </div>
                    <div className="transaction-row-info">
                      <strong>{expense.note || 'No note'}</strong>
                      <small>{formatDate(new Date(expense.date))}</small>
                    </div>
                    <div className="transaction-row-amount">
                      <strong>-{formatCurrency(expense.amount)}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
