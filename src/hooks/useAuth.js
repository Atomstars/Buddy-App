import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have a local mock session saved
    const savedMock = localStorage.getItem('sb-mock-session');
    if (savedMock) {
      try {
        const mockUser = JSON.parse(savedMock);
        setUser(mockUser);
        setSession({ user: mockUser });
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('sb-mock-session');
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      // If we have a mock user running, don't let Supabase empty state overwrite it
      if (localStorage.getItem('sb-mock-session')) return;
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    return { data, error };
  }, []);

  const signInWithPhone = useCallback(async (phone) => {
    const { data, error } = await supabase.auth.signInWithOtp({ phone });
    return { data, error };
  }, []);

  const verifyOTP = useCallback(async (phone, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    return { data, error };
  }, []);

  const signInDev = useCallback(() => {
    const mockUser = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'developer@budgetbuddy.local',
      user_metadata: {
        full_name: 'Developer Guest',
        name: 'Developer Guest'
      }
    };
    setUser(mockUser);
    setSession({ user: mockUser });
    localStorage.setItem('sb-mock-session', JSON.stringify(mockUser));
    return { data: { user: mockUser }, error: null };
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem('sb-mock-session');
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    return { error };
  }, []);

  const getUserDisplayName = useCallback(() => {
    if (!user) return 'User';
    return user.user_metadata?.full_name
      || user.user_metadata?.name
      || user.email?.split('@')[0]
      || 'User';
  }, [user]);

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithPhone,
    verifyOTP,
    signInDev,
    signOut,
    getUserDisplayName,
  };
};

export default useAuth;
