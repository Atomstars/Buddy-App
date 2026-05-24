import React, { useMemo, useState, useEffect, useRef } from 'react';
import useExpenses from './hooks/useExpenses';
import useTimetable from './hooks/useTimetable';
import { useAuth } from './hooks/useAuth';
import { formatDateISO } from './utils/dateUtils';
import { AddExpenseModal } from './components/BudgetModule';
import { TimetableModule } from './components/TimetableModule';
import { TaskHistoryModule } from './components/TaskHistoryModule';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import Onboarding from './components/Onboarding';
import AddBottomSheet from './components/AddBottomSheet';
import useBills from './hooks/useBills';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { GlobalHomeHub } from './components/GlobalHomeHub';
import { BudgetDashboard } from './components/BudgetDashboard';
import HistoryPage from './components/HistoryPage';
import AIInsightsPage from './components/AIInsightsPage';
import MorePage from './components/MorePage';
import VisionPage from './components/VisionPage';

function App() {
  // ── App state machine: 'splash' → 'auth' → ('onboarding' →) 'app'
  const [appState, setAppState]               = useState('splash');
  const [showFABSheet, setShowFABSheet]       = useState(false);
  const [showExpenseModal, setShowExpenseModal]= useState(false);
  const [showTaskHistory, setShowTaskHistory] = useState(false);
  const [selectedSector, setSelectedSector]   = useState('groceries');
  const [editingExpense, setEditingExpense]   = useState(null);
  const [selectedDate, setSelectedDate]       = useState(new Date());

  const navigate = useNavigate();

  // ── Auth ──
  const {
    user, loading: authLoading,
    signIn, signUp, signInWithGoogle, signInWithPhone, verifyOTP, signInDev, signOut,
    getUserDisplayName,
  } = useAuth();

  // ── Data hooks ──
  const timetable = useTimetable();
  const {
    expenses, addExpense, updateExpense, removeExpense,
    getTodayStats, getWeeklyStats, getMonthlyStats, getZeroDayStreak,
  } = useExpenses();
  const { bills, addBill, updateBill, removeBill, togglePaid } = useBills();

  const todayStats   = getTodayStats(selectedDate);
  const weeklyStats  = getWeeklyStats(selectedDate);
  const monthlyStats = getMonthlyStats(selectedDate);
  const zeroDayInfo  = getZeroDayStreak(); // returns { streak, active }
  const streakCount  = zeroDayInfo?.streak ?? 0;

  const todayTasks = useMemo(() => {
    const dateStr = formatDateISO(selectedDate);
    return timetable.tasks.filter(t => t.date === dateStr);
  }, [timetable.tasks, selectedDate]);

  // ── Splash complete handler ──
  const splashDoneRef = useRef(false);

  const handleSplashComplete = () => {
    splashDoneRef.current = true;
    if (!authLoading) {
      advanceFromSplash(user);
    }
    // else: the effect below will fire when authLoading resolves
  };

  const advanceFromSplash = (currentUser) => {
    if (currentUser) {
      const onboarded = localStorage.getItem('aura_onboarding_done') === 'true';
      setAppState(onboarded ? 'app' : 'onboarding');
    } else {
      setAppState('auth');
    }
  };

  // When auth finishes loading after splash has already completed
  useEffect(() => {
    if (!authLoading && splashDoneRef.current && appState === 'splash') {
      advanceFromSplash(user);
    }
  }, [authLoading]); // eslint-disable-line

  // When user signs in during auth screen
  const prevUserRef = useRef(undefined);
  useEffect(() => {
    if (prevUserRef.current === null && user && appState === 'auth') {
      const onboarded = localStorage.getItem('aura_onboarding_done') === 'true';
      setAppState(onboarded ? 'app' : 'onboarding');
    }
    prevUserRef.current = user;
  }, [user]); // eslint-disable-line

  // When user signs out from inside the app
  useEffect(() => {
    if (!user && appState === 'app') {
      setAppState('auth');
      navigate('/', { replace: true });
    }
  }, [user]); // eslint-disable-line

  // Page title
  useEffect(() => { document.title = 'Aura — Life OS'; }, []);

  // ── Helpers ──
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
    } else {
      addExpense(amount, sector, note, date);
    }
  };

  const handleFABAction = (actionId) => {
    if (actionId === 'schedule') navigate('/schedule');
    else openAddExpense();
  };

  const handleOnboardingComplete = () => {
    setAppState('app');
    navigate('/', { replace: true });
  };

  const handleSignOut = async () => {
    await signOut();
    setAppState('auth');
    navigate('/', { replace: true });
  };

  return (
    <>
      {/* ── Splash ── */}
      <AnimatePresence>
        {appState === 'splash' && (
          <SplashScreen key="splash" onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>

      {/* ── Auth ── */}
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

      {/* ── Onboarding ── */}
      <AnimatePresence>
        {appState === 'onboarding' && (
          <Onboarding key="onboarding" onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {/* ── Main App ── */}
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
                  visionProgress={40}
                  onProfileClick={() => navigate('/more')}
                  onFABPress={() => setShowFABSheet(true)}
                  expenses={expenses}
                  bills={bills}
                  onToggleBillPaid={togglePaid}
                  monthlyStats={{
                    spent: monthlyStats.total ?? 0,
                    target: monthlyStats.totalBudget ?? 30000,
                    remaining: monthlyStats.remaining ?? 0,
                  }}
                />
              }
            />

            <Route
              path="/budget"
              element={
                <AppShell title="Budget" onProfileClick={() => navigate('/more')} onFABPress={() => setShowFABSheet(true)}>
                  <BudgetDashboard
                    monthlyStats={{
                      spent: monthlyStats.total ?? 0,
                      target: monthlyStats.totalBudget ?? 30000,
                      remaining: monthlyStats.remaining ?? 0,
                    }}
                    weeklyStats={{
                      spent: weeklyStats.total ?? 0,
                      target: weeklyStats.totalBudget ?? 7000,
                    }}
                    todayStats={{
                      spent: todayStats.total ?? 0,
                      target: 1000,
                    }}
                    expenses={expenses}
                    onQuickAdd={openAddExpense}
                    onEdit={openEditExpense}
                    onDelete={removeExpense}
                    selectedDate={selectedDate}
                    bills={bills}
                    onAddBill={addBill}
                    onUpdateBill={updateBill}
                    onDeleteBill={removeBill}
                    onToggleBillPaid={togglePaid}
                  />
                </AppShell>
              }
            />

            <Route
              path="/schedule"
              element={
                <AppShell title="Schedule" onProfileClick={() => navigate('/more')} onFABPress={() => setShowFABSheet(true)}>
                  {!showTaskHistory ? (
                    <TimetableModule
                      tasks={timetable.tasks}
                      onAddTask={timetable.addTask}
                      onToggleTask={timetable.toggleTask}
                      onEditTask={timetable.editTask}
                      onDeleteTask={timetable.removeTask}
                      onRescheduleTask={timetable.rescheduleTaskToNextDay}
                      selectedDate={selectedDate}
                      onViewHistory={() => setShowTaskHistory(true)}
                    />
                  ) : (
                    <TaskHistoryModule
                      tasks={timetable.tasks}
                      onBack={() => setShowTaskHistory(false)}
                    />
                  )}
                </AppShell>
              }
            />

            <Route
              path="/history"
              element={
                <AppShell title="History" onProfileClick={() => navigate('/more')} onFABPress={() => setShowFABSheet(true)}>
                  <HistoryPage expenses={expenses} />
                </AppShell>
              }
            />

            <Route
              path="/insights"
              element={
                <AppShell title="AI Insights" onProfileClick={() => navigate('/more')} onFABPress={() => setShowFABSheet(true)}>
                  <AIInsightsPage />
                </AppShell>
              }
            />

            <Route
              path="/vision"
              element={<VisionPage />}
            />

            <Route
              path="/more"
              element={
                <AppShell title="More" onProfileClick={() => navigate('/more')} onFABPress={() => setShowFABSheet(true)}>
                  <MorePage
                    userName={getUserDisplayName()}
                    userEmail={user?.email}
                    onSignOut={handleSignOut}
                  />
                </AppShell>
              }
            />

            {/* Legacy redirects */}
            <Route path="/analytics"  element={<Navigate to="/budget"   replace />} />
            <Route path="/manifest"   element={<Navigate to="/more"     replace />} />
            <Route path="/investing"  element={<Navigate to="/insights" replace />} />
            <Route path="*"           element={<Navigate to="/"          replace />} />
          </Routes>

          {/* Add Bottom Sheet */}
          <AddBottomSheet
            isOpen={showFABSheet}
            onClose={() => setShowFABSheet(false)}
            onSaveExpense={saveExpense}
            onSaveBill={addBill}
            onSaveTask={timetable.addTask}
          />

          {/* Add / Edit Expense Modal */}
          <AddExpenseModal
            isOpen={showExpenseModal}
            onClose={() => setShowExpenseModal(false)}
            onSave={saveExpense}
            defaultSector={selectedSector}
            editingExpense={editingExpense}
            selectedDate={selectedDate}
          />
        </>
      )}
    </>
  );
}

export default App;
