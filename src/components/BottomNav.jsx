import React from 'react';
import { IndianRupee, CalendarDays, Sparkles } from 'lucide-react';

const tabs = [
  { id: 'budget', label: 'Budget', icon: IndianRupee },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'manifest', label: 'Manifest', icon: Sparkles },
];

const BottomNav = ({ activeTab, onTabChange }) => (
  <nav className="bottom-nav">
    {tabs.map((tab) => {
      const Icon = tab.icon;
      return (
        <button
          key={tab.id}
          className={`bottom-nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <Icon size={22} />
          <span>{tab.label}</span>
        </button>
      );
    })}
  </nav>
);

export default BottomNav;
