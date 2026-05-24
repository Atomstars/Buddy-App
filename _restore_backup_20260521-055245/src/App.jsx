import React, { useMemo, useState } from 'react';
import { CalendarDays, Moon, Settings, Sun, WalletCards } from 'lucide-react';
import useExpenses from './hooks/useExpenses';
import useGoals from './hooks/useGoals';
import useTimetable from './hooks/useTimetable';
import useLists from './hooks/useLists';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { getCoachState } from './utils/assistantLogic';
import { formatDateISO } from './utils/dateUtils';
import { AddExpenseModal, BudgetModule, SettingsModal } from './components/BudgetModule';
import { TimetableModule } from './components/TimetableModule';
import { TaskHistoryModule } from './components/TaskHistoryModule';
import MyListModule from './components/MyListModule';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import { ServiceHub } from './components/ServiceHub';
import { Taskbar } from './components/Taskbar';
import { UserMenu } from './components/UserMenu';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [currentService, setCurrentService] = useState('budget');
  const [activeTab, setActiveTab] = useState('home');
  const [showSplash, setShowSplash] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleServiceSelect = (service) => {
    setCurrentService(service);
    setActiveTab('home');
  };

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

  const [showTaskHistory, setShowTaskHistory] = useState(false);

  const pageTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2 },
  };

  const isAuthenticated = !!user;
  const showAuth = !showSplash && !authLoading && !isAuthenticated;
  const showApp = !showSplash && !authLoading && isAuthenticated;

  const renderServiceHeader = () => {
    const isBudget = currentService === 'budget';
    const Icon = isBudget ? WalletCards : CalendarDays;

    return (
    <header className="app-shell-header">
      <div className="app-shell-header-inner">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-zinc-950 shadow-lg shadow-white/10">
            <Icon size={21} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Buddy App</p>
            <h1 className="text-lg font-bold tracking-tight text-white">{isBudget ? 'Budget' : 'Schedule'}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.045] text-zinc-400 transition hover:text-white"
            onClick={toggleTheme}
            type="button"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.045] text-zinc-400 transition hover:text-white"
            onClick={() => setShowSettings(true)}
            type="button"
            title="Settings"
          >
            <Settings size={18} />
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans overflow-x-hidden selection:bg-zinc-800">
      <AnimatePresence>
        {(showSplash || authLoading) && (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

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

      {showApp && (
        <>
          <AnimatePresence mode="wait">
            {currentService === 'budget' && (
              <motion.div key="budget" className="page-wrapper" {...pageTransition}>
                {renderServiceHeader()}
                <main className="page-content">
                  <BudgetModule
                    activeTab={activeTab}
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
                    onQuickLog={(amount, sector) => addExpense(amount, sector, 'Quick add', selectedDate)}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                  />
                </main>
              </motion.div>
            )}

            {currentService === 'schedule' && (
              <motion.div key="schedule" className="page-wrapper" {...pageTransition}>
                {renderServiceHeader()}
                <main className="page-content">
                  <TimetableModule
                    activeTab={activeTab}
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
                </main>
              </motion.div>
            )}
          </AnimatePresence>

          <Taskbar activeService={currentService} onServiceSelect={handleServiceSelect} />
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
