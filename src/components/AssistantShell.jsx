import React from 'react';
import { Settings, Moon, Sun } from 'lucide-react';
import { formatDateISO, isToday } from '../utils/dateUtils';

const tabNames = {
  budget: 'Budget',
  schedule: 'Schedule',
  manifest: 'Manifest',
};

export const AppHeader = ({
  activeTab,
  theme,
  toggleTheme,
  onSettings,
  selectedDate,
  onDateSelect,
  userName,
}) => {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="page-header">
      <div className="page-header-row">
        <div className="header-left">
          <div>
            <p className="header-greeting">{greeting}{userName ? `, ${userName}` : ''}</p>
            <h1 className="header-title">{tabNames[activeTab]}</h1>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="btn-icon" onClick={onSettings} aria-label="Settings">
            <Settings size={18} />
          </button>
        </div>
      </div>
      <DateSelectionBar selectedDate={selectedDate} onDateSelect={onDateSelect} />
    </header>
  );
};

const DateSelectionBar = ({ selectedDate, onDateSelect }) => {
  const dates = React.useMemo(() => {
    const list = [];
    for (let i = -14; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      list.push(d);
    }
    return list;
  }, []);

  const activeRef = React.useRef(null);

  React.useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedDate]);

  return (
    <div className="date-scroll">
      {dates.map((date) => {
        const isSelected = formatDateISO(date) === formatDateISO(selectedDate);
        const current = isToday(date);
        return (
          <button
            key={formatDateISO(date)}
            ref={isSelected ? activeRef : null}
            className={`date-chip ${isSelected ? 'active' : ''} ${current ? 'today' : ''}`}
            onClick={() => onDateSelect(date)}
          >
            <span className="day-label">
              {date.toLocaleDateString('en-IN', { weekday: 'short' })}
            </span>
            <span className="day-num">{date.getDate()}</span>
            {current && <div className="today-dot" />}
          </button>
        );
      })}
    </div>
  );
};
