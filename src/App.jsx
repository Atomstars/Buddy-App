import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import useExpenses from './hooks/useExpenses';
import useGoals from './hooks/useGoals';
import useTimetable from './hooks/useTimetable';
import { getCoachState } from './utils/assistantLogic';
import { AppHeader, AlertDeck, AssistantHero } from './components/AssistantShell';
import { AddExpenseModal, BudgetModule, SettingsModal } from './components/BudgetModule';
import TimetableModule from './components/TimetableModule';

function App() {
  const [activeModule, setActiveModule] = useState('budget');
  const [budgetView, setBudgetView] = useState('today');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSector, setSelectedSector] = useState('groceries');
  const [editingExpense, setEditingExpense] = useState(null);

  const timetable = useTimetable();
  const goals = useGoals();
  const {
    expenses,
    budgets,
    addExpense,
    updateExpense,
    removeExpense,
    updateBudget,
    markNoSpendToday,
    getTodayStats,
    getWeeklyStats,
    getMonthlyStats,
    getTrackingStreak,
  } = useExpenses();

  const todayStats = getTodayStats();
  const weeklyStats = getWeeklyStats();
  const monthlyStats = getMonthlyStats();
  const trackingStreak = getTrackingStreak();
  const activeStats = budgetView === 'month' ? monthlyStats : weeklyStats;
  const coach = useMemo(
    () => getCoachState({ weeklyStats, monthlyStats, todayStats, trackingStreak, tasks: timetable.tasks }),
    [weeklyStats, monthlyStats, todayStats, trackingStreak, timetable.tasks]
  );

  const openAddExpense = (sector = selectedSector) => {
    setEditingExpense(null);
    setSelectedSector(sector);
    setShowExpenseModal(true);
  };

  const openEditExpense = (expense) => {
    setEditingExpense(expense);
    setSelectedSector(expense.sector);
    setShowExpenseModal(true);
  };

  const saveExpense = ({ amount, sector, note }) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, { amount, sector, note });
      return;
    }

    addExpense(amount, sector, note);
  };

  return (
    <div className="app-shell">
      <div className="app-container">
        <AppHeader
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          budgetView={budgetView}
          setBudgetView={setBudgetView}
          onSettings={() => setShowSettings(true)}
        />
        <main>
          <AlertDeck
            coach={coach}
            todayStats={todayStats}
            trackingStreak={trackingStreak}
            onNoSpend={markNoSpendToday}
            activeModule={activeModule}
            setActiveModule={setActiveModule}
          />
          <AssistantHero
            coach={coach}
            todayStats={todayStats}
            weeklyStats={weeklyStats}
            monthlyStats={monthlyStats}
            tasks={timetable.tasks}
          />
          {activeModule === 'budget' ? (
            <BudgetModule
              view={budgetView}
              activeStats={activeStats}
              todayStats={todayStats}
              weeklyStats={weeklyStats}
              monthlyStats={monthlyStats}
              coach={coach}
              expenses={expenses}
              goals={goals.goals}
              goalSummary={goals.goalSummary}
              monthlyRemaining={Math.max(0, monthlyStats.remaining)}
              onAddGoal={goals.addGoal}
              onFundGoal={goals.fundGoal}
              onDeleteGoal={goals.removeGoal}
              onQuickAdd={openAddExpense}
              onEdit={openEditExpense}
              onDelete={removeExpense}
            />
          ) : (
            <TimetableModule
              tasks={timetable.tasks}
              onAddTask={timetable.addTask}
              onToggleTask={timetable.toggleTask}
              onDeleteTask={timetable.removeTask}
              coach={coach}
            />
          )}
        </main>
      </div>

      <button className="floating-add" onClick={() => (activeModule === 'budget' ? openAddExpense() : setActiveModule('timetable'))}>
        <Plus size={28} />
      </button>

      <AddExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSave={saveExpense}
        defaultSector={selectedSector}
        editingExpense={editingExpense}
      />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} budgets={budgets} onUpdateBudget={updateBudget} />
    </div>
  );
}

export default App;
