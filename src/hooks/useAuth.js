import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // One-time migration: clear any legacy fake "dev" session from older builds.
    // It used a non-existent UUID that RLS rejects, so it must not linger.
    localStorage.removeItem('sb-mock-session');

    // Get initial session (real Supabase session is the single source of truth)
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes (sign in/out, token refresh, anonymous sign-in)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
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

  // Guest mode = a REAL anonymous Supabase user. It gets a genuine auth.uid(),
  // so RLS works and each guest receives their own isolated data slot.
  // Requires "Anonymous sign-ins" to be enabled in the Supabase dashboard.
  const signInDev = useCallback(async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (!error && data?.user) {
      setUser(data.user);
      setSession(data.session ?? { user: data.user });
    }
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    return { error };
  }, []);

  const getUserDisplayName = useCallback(() => {
    if (!user) return 'User';
    if (user.is_anonymous) return 'Guest';
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
