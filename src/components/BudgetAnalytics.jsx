import React, { useMemo } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, getSector } from '../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: 12, borderRadius: 12 }}>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-3)' }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontWeight: 700, color: 'var(--text-1)' }}>
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export const BudgetAnalytics = ({ monthlyStats }) => {
  // Area Chart Data (Daily)
  const dailyData = useMemo(() => {
    const grouped = {};
    monthlyStats.expenses.forEach(exp => {
      const d = new Date(exp.date);
      const dayKey = `${d.getMonth() + 1}/${d.getDate()}`;
      if (!grouped[dayKey]) grouped[dayKey] = 0;
      grouped[dayKey] += exp.amount;
    });
    return Object.entries(grouped).map(([day, amount]) => ({ name: day, amount }));
  }, [monthlyStats.expenses]);

  // Pie Chart Data (Category)
  const categoryData = useMemo(() => {
    const grouped = {};
    monthlyStats.expenses.forEach(exp => {
      const sector = getSector(exp.sector);
      if (!grouped[sector.id]) grouped[sector.id] = { name: sector.label, value: 0, color: sector.color };
      grouped[sector.id].value += exp.amount;
    });
    return Object.values(grouped);
  }, [monthlyStats.expenses]);

  return (
    <div className="flex flex-col gap-6 pb-24 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center pt-6 text-white">Analytics</h2>
      
      {/* Spend by Category Pie Chart */}
      <div className="fin-card">
        <div style={{ padding: 20, paddingBottom: 0 }}>
          <h3 className="fin-card-title">Spend by Category</h3>
          <p className="fin-card-sub">Where your money goes</p>
        </div>
        <div style={{ width: '100%', height: 250 }}>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={5} stroke="none">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--text-3)' }}>No data</div>
          )}
        </div>
      </div>

      {/* Spending Trend Area Chart */}
      <div className="fin-card">
        <div style={{ padding: 20 }}>
          <h3 className="fin-card-title">Spending Trend</h3>
          <p className="fin-card-sub">Daily accumulation</p>
        </div>
        <div style={{ width: '100%', height: 200 }}>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#00f3ff" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--text-3)' }}>No data</div>
          )}
        </div>
      </div>
    </div>
  );
};
