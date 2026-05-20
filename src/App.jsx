import React, { useMemo, useState } from 'react';
import { Plus, ChevronLeft, Moon, Sun } from 'lucide-react';
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
  const [currentService, setCurrentService] = useState(null); // null = Hub
  const [activeTab, setActiveTab] = useState('home');
  const [showSplash, setShowSplash] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleServiceSelect = (service) => {
    setCurrentService(service);
    setActiveTab('home'); // reset to home tab when switching service
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

  // Header for active service
  const renderServiceHeader = (title) => (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 pb-4 backdrop-blur-xl bg-zinc-950/70 border-b border-white/5 pt-safe">
      <div className="flex items-center gap-2">
        <button 
          className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors text-zinc-400 hover:text-white" 
          onClick={() => setCurrentService(null)} 
          title="Back to Hub"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          className="p-2 rounded-full hover:bg-white/5 transition-colors text-zinc-400 hover:text-white" 
          onClick={toggleTheme} 
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      
      <h1 className="text-lg font-semibold tracking-tight text-white flex-1 text-center">{title}</h1>
      
      <div className="flex items-center justify-end min-w-[80px]">
        <UserMenu />
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans pb-24 overflow-x-hidden selection:bg-zinc-800">
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
            {currentService === null && (
              <motion.div key="hub" className="page-wrapper" {...pageTransition}>
                <ServiceHub
                  userName={getUserDisplayName()}
                  onSelectService={handleServiceSelect}
                  theme={theme}
                  toggleTheme={toggleTheme}
                  onSettings={() => setShowSettings(true)}
                  todayStats={todayStats}
                  weeklyStats={weeklyStats}
                  todayTasks={todayTasks}
                  lists={listData.lists}
                />
              </motion.div>
            )}

            {currentService === 'budget' && (
              <motion.div key="budget" className="page-wrapper" {...pageTransition}>
                {renderServiceHeader('Budget Tracker')}
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
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                  />
                </main>
                <button className="fab" onClick={() => openAddExpense()} aria-label="Add expense">
                  <Plus size={24} />
                </button>
              </motion.div>
            )}

            {currentService === 'investing' && (
              <motion.div key="investing" className="page-wrapper" {...pageTransition}>
                {renderServiceHeader('AI Investing')}
                <main className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                  <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>
                    <h2 style={{ color: 'var(--text-1)' }}>Coming Soon</h2>
                    <p>Advanced AI portfolio insights</p>
                  </div>
                </main>
              </motion.div>
            )}

            {currentService === 'schedule' && (
              <motion.div key="schedule" className="page-wrapper" {...pageTransition}>
                {renderServiceHeader('Schedule')}
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

            {currentService === 'manifest' && (
              <motion.div key="manifest" className="page-wrapper" {...pageTransition}>
                {renderServiceHeader('Vision Board')}
                <main className="page-content">
                  <MyListModule
                    activeTab={activeTab}
                    lists={listData.lists}
                    onAddList={listData.addList}
                    onRemoveList={listData.removeList}
                    onAddItem={listData.addItemToList}
                    onToggleItem={listData.toggleItem}
                    onRemoveItem={listData.removeItem}
                  />
                </main>
              </motion.div>
            )}
          </AnimatePresence>

          {currentService && (
            <Taskbar activeService={currentService} activeTab={activeTab} onTabSelect={setActiveTab} />
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
