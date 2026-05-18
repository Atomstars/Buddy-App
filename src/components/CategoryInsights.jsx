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
  Sparkles 
} from 'lucide-react';
import { SECTORS, formatCurrency, getPercentage, getSector } from '../utils/formatters';
import { formatDate } from '../utils/dateUtils';
import { IconButton, ProgressBar } from './common';

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
    ? expenses.filter(e => e.sector === selectedSector).sort((a,b) => new Date(b.date) - new Date(a.date))
    : [];

  return (
    <motion.div className="module-stack" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <IconButton onClick={onBack}>
          <ChevronLeft size={24} />
        </IconButton>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Category Deep-Dive</h2>
      </div>

      <section className="section-block">
        <p className="eyebrow" style={{ marginBottom: '16px' }}>Select a category to view history</p>
        <div className="category-list">
          {activeStats.bySector.map((item) => {
            const sector = getSector(item.sector);
            const Icon = sectorIcons[item.sector] || Paperclip;
            const percent = getPercentage(item.amount, item.budget);
            const isSelected = selectedSector === item.sector;
            
            return (
              <button 
                key={item.sector} 
                className={`category-list-item ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedSector(isSelected ? null : item.sector)}
                style={{ 
                  width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', 
                  background: isSelected ? 'var(--surface-sunken)' : 'transparent',
                  border: isSelected ? `1px solid ${sector.color}40` : '1px solid transparent',
                  borderRadius: '12px', textAlign: 'left', transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="category-icon" style={{ color: sector.color, backgroundColor: `${sector.color}18`, padding: '8px', borderRadius: '50%' }}>
                      <Icon size={18} />
                    </div>
                    <strong>{sector.label}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong>{formatCurrency(item.amount)}</strong>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>of {formatCurrency(item.budget)}</p>
                  </div>
                </div>
                <ProgressBar value={percent} tone={percent >= 100 ? 'danger' : 'normal'} />
              </button>
            );
          })}
        </div>
      </section>

      {selectedSector && (
        <motion.section className="section-block" style={{ marginTop: '24px' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="section-title">
            <div>
              <p className="eyebrow">Transaction Log</p>
              <h2>{getSector(selectedSector).label} History</h2>
            </div>
            <span>{sectorExpenses.length} entries</span>
          </div>
          
          {sectorExpenses.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px' }}>
              <Receipt size={24} />
              <p>No transactions in this category</p>
            </div>
          ) : (
            <div className="transaction-list">
              {sectorExpenses.map((expense) => {
                const sector = getSector(expense.sector);
                const Icon = sectorIcons[expense.sector] || Paperclip;
                return (
                  <article key={expense.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--surface-sunken)', borderRadius: '12px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span className="transaction-icon" style={{ color: sector.color, backgroundColor: `${sector.color}18`, padding: '8px', borderRadius: '50%' }}>
                        <Icon size={18} />
                      </span>
                      <span className="transaction-copy">
                        <strong>{expense.note || 'No note'}</strong>
                        <small>{formatDate(new Date(expense.date))}</small>
                      </span>
                    </div>
                    <strong>-{formatCurrency(expense.amount)}</strong>
                  </article>
                );
              })}
            </div>
          )}
        </motion.section>
      )}
    </motion.div>
  );
};
