import React from 'react';
import { formatCurrency, getSector } from '../utils/formatters';
import { formatDate } from '../utils/dateUtils';
import { Wallet } from 'lucide-react';

export const BudgetTransactions = ({ expenses }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 100 }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', paddingTop: 20 }}>History</h2>
      
      <div className="fin-card" style={{ padding: 20 }}>
        <h3 className="fin-card-title" style={{ marginBottom: 16 }}>All Transactions</h3>
        {expenses.length === 0 ? (
           <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>No transactions found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {expenses.map((exp) => {
              const sector = getSector(exp.sector);
              return (
                <div key={exp.id} className="fin-txn-row">
                  <div className="fin-txn-icon" style={{ background: `${sector.color}20`, color: sector.color }}>
                    <Wallet size={16} />
                  </div>
                  <div className="fin-txn-info">
                    <strong>{sector.shortLabel}</strong>
                    <small>{exp.note || formatDate(new Date(exp.date))}</small>
                  </div>
                  <div className="fin-txn-amount">
                    -{formatCurrency(exp.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
