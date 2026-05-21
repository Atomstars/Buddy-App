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
import { UserMenu } from './components/UserMenu';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { GlobalHomeHub } from './components/GlobalHomeHub';
import { ScheduleModule, VisionModule, InvestModule } from './components/PlaceholderModules';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showSplash, setShowSplash] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();

  // Auth
  const {
    user,
    loading: authLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithPhone,
    verifyOTP,
    signInDev,
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

  // Always redirect to Global Home Hub immediately after login
  const prevAuth = React.useRef(false);
  React.useEffect(() => {
    if (!prevAuth.current && isAuthenticated && !showSplash) {
      navigate('/', { replace: true });
    }
    prevAuth.current = isAuthenticated;
  }, [isAuthenticated, showSplash]);


  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-50 font-sans overflow-x-hidden selection:bg-zinc-800 relative">
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
            onDevSignIn={signInDev}
          />
        )}
      </AnimatePresence>

      {showApp && (
        <Routes>
          <Route path="/" element={
            <GlobalHomeHub
              userName={getUserDisplayName()}
              monthlyRemaining={Math.max(0, monthlyStats.remaining)}
              tasksToday={todayTasks?.length || 0}
              streakCount={12}
              visionProgress={40}
              onProfileClick={() => setShowSettings(true)}
            />
          } />

          <Route path="/budget" element={
            <AppShell
              activeTab={activeTab}
              onTabSelect={(tab) => {
                setActiveTab(tab);
              }}
              onProfileClick={() => setShowSettings(true)}
            >
              <AnimatePresence mode="wait">
                {(activeTab === 'home' || activeTab === 'analytics' || activeTab === 'investing' || activeTab === 'transactions') && (
                  <motion.div key={`budget-${activeTab}`} className="page-wrapper" {...pageTransition}>
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
                    {activeTab === 'home' && (
                      <button className="fab" onClick={() => openAddExpense()} aria-label="Add expense">
                        <Plus size={24} />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </AppShell>
          } />

          {/* Working module routes */}
          <Route path="/schedule" element={<ScheduleModule />} />
          <Route path="/vision"   element={<VisionModule />} />
          <Route path="/invest"   element={<InvestModule />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
