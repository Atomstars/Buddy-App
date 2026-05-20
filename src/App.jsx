import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import useExpenses from './hooks/useExpenses';
import useGoals from './hooks/useGoals';
import useTimetable from './hooks/useTimetable';
import useLists from './hooks/useLists';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { getCoachState } from './utils/assistantLogic';
import { formatDateISO } from './utils/dateUtils';
import { AppHeader } from './components/AssistantShell';
import { AddExpenseModal, BudgetModule, SettingsModal } from './components/BudgetModule';
import { TimetableModule } from './components/TimetableModule';
import { TaskHistoryModule } from './components/TaskHistoryModule';
import MyListModule from './components/MyListModule';
import SplashScreen from './components/SplashScreen';
import BottomNav from './components/BottomNav';
import AuthScreen from './components/AuthScreen';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [currentTab, setCurrentTab] = useState('budget');
  const [showSplash, setShowSplash] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Auth
  const {
    user,
    loading: authLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithPhone,
    verifyOTP,
    signOut,
    getUserDisplayName,
  } = useAuth();

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
    return timetable.tasks.filter((t) => t.date === dateStr);
  }, [timetable.tasks, selectedDate]);

  const coach = useMemo(
    () =>
      getCoachState({
        weeklyStats,
        monthlyStats,
        todayStats,
        zeroDayStreak,
        tasks: todayTasks,
      }),
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

  // Timetable internal history navigation
  const [showTaskHistory, setShowTaskHistory] = useState(false);

  const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2 },
  };

  // Determine what to show
  const isAuthenticated = !!user;
  const showAuth = !showSplash && !authLoading && !isAuthenticated;
  const showApp = !showSplash && !authLoading && isAuthenticated;

  return (
    <div className="app-root">
      {/* Splash Screen */}
      <AnimatePresence>
        {(showSplash || authLoading) && (
          <SplashScreen
            key="splash"
            onComplete={() => setShowSplash(false)}
          />
        )}
      </AnimatePresence>

      {/* Auth Screen — shown when not logged in */}
      <AnimatePresence>
        {showAuth && (
          <AuthScreen
            key="auth"
            onSignIn={signIn}
            onSignUp={signUp}
            onGoogleSignIn={signInWithGoogle}
            onPhoneSignIn={signInWithPhone}
            onVerifyOTP={verifyOTP}
          />
        )}
      </AnimatePresence>

      {/* Main App — shown after authentication */}
      {showApp && (
        <>
          <AppHeader
            activeTab={currentTab}
            theme={theme}
            toggleTheme={toggleTheme}
            onSettings={() => setShowSettings(true)}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            userName={getUserDisplayName()}
          />

          <main className="page-content">
            <AnimatePresence mode="wait">
              {currentTab === 'budget' && (
                <motion.div key="budget" {...pageTransition}>
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
                </motion.div>
              )}

              {currentTab === 'schedule' && (
                <motion.div key="schedule" {...pageTransition}>
                  {!showTaskHistory ? (
                    <TimetableModule
                      tasks={timetable.tasks}
                      onAddTask={timetable.addTask}
                      onToggleTask={timetable.toggleTask}
                      onEditTask={timetable.editTask}
                      onDeleteTask={timetable.removeTask}
                      onRescheduleTask={timetable.rescheduleTaskToNextDay}
                      coach={coach}
                      selectedDate={selectedDate}
                      onViewHistory={() => setShowTaskHistory(true)}
                    />
                  ) : (
                    <TaskHistoryModule
                      tasks={timetable.tasks}
                      onBack={() => setShowTaskHistory(false)}
                    />
                  )}
                </motion.div>
              )}

              {currentTab === 'manifest' && (
                <motion.div key="manifest" {...pageTransition}>
                  <MyListModule
                    lists={listData.lists}
                    onAddList={listData.addList}
                    onRemoveList={listData.removeList}
                    onAddItem={listData.addItemToList}
                    onToggleItem={listData.toggleItem}
                    onRemoveItem={listData.removeItem}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <BottomNav activeTab={currentTab} onTabChange={setCurrentTab} />

          {currentTab === 'budget' && (
            <button
              className="fab"
              onClick={() => openAddExpense()}
              aria-label="Add expense"
            >
              <Plus size={24} />
            </button>
          )}
        </>
      )}

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
        onSignOut={signOut}
        userName={getUserDisplayName()}
        userEmail={user?.email}
      />
    </div>
  );
}

export default App;
