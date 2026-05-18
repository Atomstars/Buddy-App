import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import useExpenses from './hooks/useExpenses';
import useGoals from './hooks/useGoals';
import useTimetable from './hooks/useTimetable';
import useLists from './hooks/useLists';
import { useTheme } from './hooks/useTheme';
import { getCoachState } from './utils/assistantLogic';
import { getLocalTodayDateString, formatDateISO } from './utils/dateUtils';
import { AppHeader, AlertDeck, AssistantHero } from './components/AssistantShell';
import { AddExpenseModal, BudgetModule, SettingsModal } from './components/BudgetModule';
import { TimetableModule } from './components/TimetableModule';
import { TaskHistoryModule } from './components/TaskHistoryModule';
import MyListModule from './components/MyListModule';
import SplashScreen from './components/SplashScreen';
import ModuleSelector from './components/ModuleSelector';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);

  const [currentView, setCurrentView] = useState('splash'); // 'splash' | 'selector' | 'budget' | 'timetable'
  const [userProfile, setUserProfile] = useState({ name: 'Akash', avatar: null });
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { theme, toggleTheme } = useTheme();
  const timetable = useTimetable();
  const goals = useGoals();
  const listData = useLists();
  const [budgetView, setBudgetView] = useState('today');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSector, setSelectedSector] = useState('groceries');
  const [editingExpense, setEditingExpense] = useState(null);

  const {
    expenses,
    budgets,
    addExpense,
    updateExpense,
    removeExpense,
    updateBudget,
    updateWeeklyTarget,
    updateMonthlyTarget,
    markNoSpendToday,
    getTodayStats,
    getWeeklyStats,
    getMonthlyStats,
    getZeroDayStreak,
    weeklyTarget,
    monthlyTarget,
  } = useExpenses();

  const todayStats = getTodayStats(selectedDate);
  const weeklyStats = getWeeklyStats(selectedDate);
  const monthlyStats = getMonthlyStats(selectedDate);
  const zeroDayStreak = getZeroDayStreak();
  const activeStats = budgetView === 'month' ? monthlyStats : weeklyStats;
  
  const todayTasks = useMemo(() => {
    const dateStr = formatDateISO(selectedDate);
    return timetable.tasks.filter(t => t.date === dateStr);
  }, [timetable.tasks, selectedDate]);

  const coach = useMemo(
    () => getCoachState({ weeklyStats, monthlyStats, todayStats, zeroDayStreak, tasks: todayTasks }),
    [weeklyStats, monthlyStats, todayStats, zeroDayStreak, todayTasks]
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

  const saveExpense = ({ amount, sector, note, date }) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, { amount, sector, note, date });
      return;
    }

    addExpense(amount, sector, note, date);
  };

  return (
    <div className="app-shell">
      <AnimatePresence mode="wait">
        {currentView === 'splash' && (
          <SplashScreen key="splash" onEnter={() => setCurrentView('selector')} />
        )}

        {currentView === 'selector' && (
          <ModuleSelector 
            key="selector" 
            onSelect={(id) => setCurrentView(id)} 
            userProfile={userProfile} 
          />
        )}

        {(currentView === 'budget' || currentView === 'timetable' || currentView === 'lists' || currentView === 'task-history') && (
          <motion.div 
            key="app-main"
            className="app-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AppHeader
              activeModule={currentView}
              onBack={() => setCurrentView('selector')}
              onSettings={() => setShowSettings(true)}
              theme={theme}
              toggleTheme={toggleTheme}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            <main>
              {currentView === 'budget' && (
                <>
                  <BudgetModule
                    view={budgetView}
                    setView={setBudgetView}
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
                    selectedDate={selectedDate}
                  />
                </>
              )}
              {currentView === 'timetable' && (
                <>
                  <TimetableModule
                    tasks={timetable.tasks}
                    onAddTask={timetable.addTask}
                    onToggleTask={timetable.toggleTask}
                    onEditTask={timetable.editTask}
                    onDeleteTask={timetable.removeTask}
                    onRescheduleTask={timetable.rescheduleTaskToNextDay}
                    coach={coach}
                    selectedDate={selectedDate}
                    onViewHistory={() => setCurrentView('task-history')}
                  />
                </>
              )}
              {currentView === 'task-history' && (
                <TaskHistoryModule
                  tasks={timetable.tasks}
                  onBack={() => setCurrentView('timetable')}
                />
              )}
              {currentView === 'lists' && (
                <MyListModule
                  lists={listData.lists}
                  onAddList={listData.addList}
                  onRemoveList={listData.removeList}
                  onAddItem={listData.addItemToList}
                  onToggleItem={listData.toggleItem}
                  onRemoveItem={listData.removeItem}
                />
              )}
            </main>

            <button className="floating-add" onClick={() => (currentView === 'budget' ? openAddExpense() : null)}>
              <Plus size={28} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AddExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSave={saveExpense}
        defaultSector={selectedSector}
        editingExpense={editingExpense}
        selectedDate={selectedDate}
      />
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        budgets={budgets} 
        onUpdateBudget={updateBudget} 
        weeklyTarget={weeklyTarget}
        monthlyTarget={monthlyTarget}
        onUpdateWeeklyTarget={updateWeeklyTarget}
        onUpdateMonthlyTarget={updateMonthlyTarget}
      />
      <div id="debug-env" style={{ display: 'none' }}>
        DEBUG_URL:{import.meta.env.VITE_SUPABASE_URL}
      </div>
    </div>
  );
}

export default App;
