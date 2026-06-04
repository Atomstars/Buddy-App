import React, { useMemo, useState, useEffect, useRef } from 'react';
import useExpenses from './hooks/useExpenses';
import useTimetable from './hooks/useTimetable';
import { useAuth } from './hooks/useAuth';
import { formatDateISO } from './utils/dateUtils';
import { TimetableModule } from './components/TimetableModule';
import { TaskHistoryModule } from './components/TaskHistoryModule';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import Onboarding from './components/Onboarding';
import useBills from './hooks/useBills';
import useMonthNavigation from './hooks/useMonthNavigation';
import useBudgetPlanner from './hooks/useBudgetPlanner';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { GlobalHomeHub } from './components/GlobalHomeHub';
import { BudgetDashboard } from './components/BudgetDashboard';
import HistoryPage from './components/HistoryPage';
import AIInsightsPage from './components/AIInsightsPage';
import MorePage from './components/MorePage';
import VisionPage from './components/VisionPage';
import { AddExpenseModal } from './components/AddExpenseModal';
import { AIAssistantReview } from './components/AIAssistantReview';
import { TransactionEditModal } from './components/TransactionEditModal';
import { BudgetSettingsPage } from './components/BudgetSettingsPage';

function App() {
  const [appState, setAppState] = useState('splash');
  const [showTaskHistory, setShowTaskHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modals
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAIReview, setShowAIReview] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const navigate = useNavigate();

  // Auth
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle, signInWithPhone, verifyOTP, signInDev, signOut, getUserDisplayName } = useAuth();
  const userId = user?.id ?? null;

  // Month navigation (shared across budget + planner)
  const monthNav = useMonthNavigation();
  const { selectedMonth, monthKey, displayLabel, isCurrentMonth, isFutureMonth, monthStart, monthEnd, prevMonth, nextMonth } = monthNav;

  // Data hooks — all receive userId for isolation
  const timetable = useTimetable(userId);
  const {
    expenses, budgets, weeklyTarget, monthlyTarget, monthlyIncome,
    addExpense, updateExpense, removeExpense,
    updateBudget, updateWeeklyTarget, updateMonthlyTarget, updateMonthlyIncome,
    getTodayStats, getWeeklyStats, getMonthlyStats, getZeroDayStreak,
  } = useExpenses(userId);

  const { bills, addBill, updateBill, removeBill, togglePaid } = useBills(userId);

  // Budget planner for selected month
  const planner = useBudgetPlanner(userId, monthKey);

  // Stats — use selectedDate for today/weekly but monthNav for monthly display
  const targetDateForMonth = useMemo(() => new Date(selectedMonth.year, selectedMonth.month, 15), [selectedMonth]);
  const todayStats  = getTodayStats(selectedDate);
  const weeklyStats = getWeeklyStats(selectedDate);
  const monthlyStats = getMonthlyStats(targetDateForMonth);
  const zeroDayInfo = getZeroDayStreak();
  const streakCount = zeroDayInfo?.streak ?? 0;

  const todayTasks = useMemo(() => {
    const dateStr = formatDateISO(selectedDate);
    return timetable.tasks.filter(t => t.date === dateStr);
  }, [timetable.tasks, selectedDate]);

  // ── App state transitions ──────────────────────────────────
  const splashDoneRef = useRef(false);
  const handleSplashComplete = () => {
    splashDoneRef.current = true;
    if (!authLoading) advanceFromSplash(user);
  };
  const advanceFromSplash = (currentUser) => {
    if (currentUser) {
      const onboarded = localStorage.getItem('aura_onboarding_done') === 'true';
      setAppState(onboarded ? 'app' : 'onboarding');
    } else {
      setAppState('auth');
    }
  };
  useEffect(() => {
    if (!authLoading && splashDoneRef.current && appState === 'splash') advanceFromSplash(user);
  }, [authLoading]);

  const prevUserRef = useRef(undefined);
  useEffect(() => {
    if (prevUserRef.current === null && user && appState === 'auth') {
      const onboarded = localStorage.getItem('aura_onboarding_done') === 'true';
      setAppState(onboarded ? 'app' : 'onboarding');
    }
    prevUserRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!user && appState === 'app') {
      setAppState('auth');
      navigate('/', { replace: true });
    }
  }, [user]);

  useEffect(() => { document.title = 'Aura — Life OS'; }, []);

  const handleSignOut = async () => {
    await signOut();
    setAppState('auth');
    navigate('/', { replace: true });
  };

  const handleOnboardingComplete = () => {
    setAppState('app');
    navigate('/', { replace: true });
  };

  // ── AI / FAB handlers ──────────────────────────────────────
  const handleFABPress = () => setShowAddExpense(true);

  const handleAIAssistData = (data) => {
    setAiData(data);
    setShowAIReview(true);
  };

  const handleConfirmAISave = (data) => {
    addExpense(data.amount, data.suggested_category, data.merchant, new Date(data.date));
    setShowAIReview(false);
    setAiData(null);
  };

  const handleEditFromAI = () => {
    setShowAIReview(false);
    setEditingExpense({
      amount: aiData.amount,
      note: aiData.merchant,
      sector: aiData.suggested_category,
      date: aiData.date ? new Date(aiData.date).toISOString() : new Date().toISOString(),
    });
    setShowEditExpense(true);
  };

  // ── Budget Dashboard props bundle ─────────────────────────
  const budgetDashboardProps = {
    monthlyStats: { spent: monthlyStats.total ?? 0, target: monthlyStats.totalBudget ?? 30000, remaining: monthlyStats.remaining ?? 0 },
    weeklyStats: { spent: weeklyStats.total ?? 0, target: weeklyStats.totalBudget ?? 7000 },
    todayStats: { spent: todayStats.total ?? 0, target: Math.round((monthlyTarget || 30000) / 30) },
    expenses,
    onEdit: (expense) => { setEditingExpense(expense); setShowEditExpense(true); },
    onDelete: removeExpense,
    selectedDate,
    bills,
    onAddBill: addBill,
    onUpdateBill: updateBill,
    onDeleteBill: removeBill,
    onToggleBillPaid: togglePaid,
    // Month navigation
    displayLabel,
    isCurrentMonth,
    isFutureMonth,
    prevMonth,
    nextMonth,
    monthStart,
    monthEnd,
    // Budget settings
    monthlyTarget,
    weeklyTarget,
    monthlyIncome,
    budgets,
    onUpdateMonthlyTarget: updateMonthlyTarget,
    onUpdateWeeklyTarget: updateWeeklyTarget,
    onUpdateMonthlyIncome: updateMonthlyIncome,
    onUpdateBudget: updateBudget,
    // Planner
    planner,
  };

  return (
    <>
      <AnimatePresence>
        {appState === 'splash' && <SplashScreen key="splash" onComplete={handleSplashComplete} />}
      </AnimatePresence>

      <AnimatePresence>
        {appState === 'auth' && (
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

      <AnimatePresence>
        {appState === 'onboarding' && <Onboarding key="onboarding" onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      {appState === 'app' && (
        <>
          <Routes>
            <Route
              path="/"
              element={
                <GlobalHomeHub
                  userName={getUserDisplayName()}
                  monthlyRemaining={Math.max(0, monthlyStats.remaining ?? 0)}
                  tasksToday={todayTasks.length}
                  streakCount={streakCount}
                  onProfileClick={() => navigate('/more')}
                  onFABPress={handleFABPress}
                  bills={bills}
                  monthlyStats={{ spent: monthlyStats.total ?? 0, target: monthlyStats.totalBudget ?? 30000, remaining: monthlyStats.remaining ?? 0 }}
                  displayLabel={displayLabel}
                />
              }
            />

            <Route
              path="/budget"
              element={
                <AppShell title="Budget" onProfileClick={() => navigate('/more')} onFABPress={handleFABPress}>
                  <BudgetDashboard {...budgetDashboardProps} />
                </AppShell>
              }
            />

            <Route
              path="/schedule"
              element={
                <AppShell title="Schedule" onProfileClick={() => navigate('/more')} onFABPress={handleFABPress}>
                  {!showTaskHistory
                    ? <TimetableModule
                        tasks={timetable.tasks}
                        onAddTask={timetable.addTask}
                        onToggleTask={timetable.toggleTask}
                        onEditTask={timetable.editTask}
                        onDeleteTask={timetable.removeTask}
                        onRescheduleTask={timetable.rescheduleTaskToNextDay}
                        selectedDate={selectedDate}
                        onViewHistory={() => setShowTaskHistory(true)}
                      />
                    : <TaskHistoryModule tasks={timetable.tasks} onBack={() => setShowTaskHistory(false)} />
                  }
                </AppShell>
              }
            />

            <Route
              path="/history"
              element={
                <AppShell title="History" onProfileClick={() => navigate('/more')} onFABPress={handleFABPress}>
                  <HistoryPage expenses={expenses} />
                </AppShell>
              }
            />

            <Route
              path="/insights"
              element={
                <AppShell title="AI Insights" onProfileClick={() => navigate('/more')} onFABPress={handleFABPress}>
                  <AIInsightsPage />
                </AppShell>
              }
            />

            <Route path="/vision" element={<VisionPage />} />

            <Route
              path="/more"
              element={
                <AppShell title="Settings" onProfileClick={() => navigate('/more')} onFABPress={handleFABPress}>
                  <MorePage
                    userName={getUserDisplayName()}
                    userEmail={user?.email}
                    onSignOut={handleSignOut}
                  />
                </AppShell>
              }
            />

            <Route
              path="/budget-settings"
              element={
                <AppShell title="Budget Settings" onProfileClick={() => navigate('/more')} onFABPress={handleFABPress}>
                  <BudgetSettingsPage
                    onBack={() => navigate(-1)}
                    monthlyTarget={monthlyTarget}
                    weeklyTarget={weeklyTarget}
                    monthlyIncome={monthlyIncome}
                    budgets={budgets}
                    onUpdateMonthlyTarget={updateMonthlyTarget}
                    onUpdateWeeklyTarget={updateWeeklyTarget}
                    onUpdateMonthlyIncome={updateMonthlyIncome}
                    onUpdateBudget={updateBudget}
                  />
                </AppShell>
              }
            />

            {/* Redirect legacy routes */}
            <Route path="/analytics" element={<Navigate to="/budget" replace />} />
            <Route path="/manifest"  element={<Navigate to="/more" replace />} />
            <Route path="/investing" element={<Navigate to="/insights" replace />} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global Modals */}
          <AddExpenseModal
            isOpen={showAddExpense}
            onClose={() => setShowAddExpense(false)}
            onSave={(data) => addExpense(data.amount, data.sector, data.merchant, new Date(data.date))}
            onAIAssistData={handleAIAssistData}
          />

          <AIAssistantReview
            isOpen={showAIReview}
            aiData={aiData}
            onConfirm={handleConfirmAISave}
            onEdit={handleEditFromAI}
            onCancel={() => { setShowAIReview(false); setAiData(null); }}
          />

          <TransactionEditModal
            isOpen={showEditExpense}
            onClose={() => setShowEditExpense(false)}
            transaction={editingExpense}
            onSave={(id, data) => updateExpense(id, { amount: data.amount, sector: data.sector, note: data.merchant, date: data.date })}
            onDelete={removeExpense}
          />
        </>
      )}
    </>
  );
}

export default App;
