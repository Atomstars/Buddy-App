import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Phone, Check, Sparkles, User, ChevronRight } from 'lucide-react';

const AuthScreen = ({ onSignIn, onSignUp, onGoogleSignIn, onPhoneSignIn, onVerifyOTP, onDevSignIn }) => {
  const [mode, setMode] = useState('login'); // login | signup | phone | otp
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleGuestLogin = async () => {
    clearMessages();
    setLoading(true);
    try {
      const { error: authError } = (await onDevSignIn?.()) || {};
      if (authError) {
        setError(
          /anonymous|disabled|not enabled/i.test(authError.message)
            ? 'Guest mode is off. Enable "Anonymous sign-ins" in Supabase.'
            : authError.message
        );
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!email.trim() || !password.trim()) { setError('Please fill all fields'); return; }
    if (mode === 'signup' && password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const handler = mode === 'login' ? onSignIn : onSignUp;
      const { error: authError } = await handler(email, password);
      if (authError) setError(authError.message);
      else if (mode === 'signup') setSuccess('Account created! Check your email.');
    } catch { setError('Something went wrong. Try again.'); }
    finally { setLoading(false); }
  };

  const handleGoogleAuth = async () => {
    clearMessages();
    setLoading(true);
    try {
      const { error: authError } = await onGoogleSignIn();
      if (authError) setError(authError.message);
    } catch { setError('Google sign-in failed.'); }
    finally { setLoading(false); }
  };

  const handlePhoneSend = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!phone.trim() || phone.length < 10) { setError('Please enter a valid phone number'); return; }
    setLoading(true);
    try {
      const { error: authError } = await onPhoneSignIn(phone);
      if (authError) setError(authError.message);
      else { setSuccess('OTP sent!'); setMode('otp'); }
    } catch { setError('Failed to send OTP.'); }
    finally { setLoading(false); }
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!otp.trim() || otp.length < 4) { setError('Please enter the OTP code'); return; }
    setLoading(true);
    try {
      const { error: authError } = await onVerifyOTP(phone, otp);
      if (authError) setError(authError.message);
    } catch { setError('OTP verification failed.'); }
    finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 0%, #1a1a2e 0%, #000000 70%)',
        overflow: 'hidden'
      }}
    >
      {/* Animated Grid / Ambient Lights */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 60%)', filter: 'blur(60px)', zIndex: 0, animation: 'float 10s ease-in-out infinite alternate' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)', filter: 'blur(80px)', zIndex: 0, animation: 'float 15s ease-in-out infinite alternate-reverse' }} />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '400px', padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* TOP: Logo & Tagline */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ position: 'relative', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(99,102,241,0.2)', borderRadius: '12px', filter: 'blur(10px)' }} />
              <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
                  <path d="M18 4L32 30H4L18 4Z" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M12 22H24" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>Aura</h1>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 500, letterSpacing: '0.02em' }}>Money · Time · Mind — your life buddy</p>
        </motion.div>

        {/* MIDDLE: Floating Glass Auth Card */}
        <motion.div initial={{ y: 30, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6, type: 'spring', bounce: 0.3 }} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', borderRadius: 28, padding: 24, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', marginBottom: 24 }}>
          
          <AnimatePresence mode="wait">
            {mode === 'login' || mode === 'signup' ? (
              <motion.div key="email" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
                  <button onClick={() => { setMode('login'); clearMessages(); }} style={{ flex: 1, padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: mode === 'login' ? 'rgba(255,255,255,0.1)' : 'transparent', color: mode === 'login' ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s', outline: 'none' }}>Sign In</button>
                  <button onClick={() => { setMode('signup'); clearMessages(); }} style={{ flex: 1, padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: mode === 'signup' ? 'rgba(255,255,255,0.1)' : 'transparent', color: mode === 'signup' ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s', outline: 'none' }}>Sign Up</button>
                </div>

                <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Mail size={18} style={{ position: 'absolute', left: 16, color: 'rgba(255,255,255,0.4)' }} />
                    <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px 16px 16px 44px', borderRadius: 16, color: '#fff', fontSize: 15, outline: 'none', transition: 'border 0.2s' }} />
                  </div>
                  
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Lock size={18} style={{ position: 'absolute', left: 16, color: 'rgba(255,255,255,0.4)' }} />
                    <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px 44px 16px 44px', borderRadius: 16, color: '#fff', fontSize: 15, outline: 'none', transition: 'border 0.2s' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 16, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', outline: 'none' }}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {mode === 'signup' && (
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Lock size={18} style={{ position: 'absolute', left: 16, color: 'rgba(255,255,255,0.4)' }} />
                      <input type={showPassword ? 'text' : 'password'} placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px 16px 16px 44px', borderRadius: 16, color: '#fff', fontSize: 15, outline: 'none' }} />
                    </div>
                  )}

                  {error && <p style={{ color: '#f43f5e', fontSize: 13, textAlign: 'center', marginTop: 4 }}>{error}</p>}
                  {success && <p style={{ color: '#10b981', fontSize: 13, textAlign: 'center', marginTop: 4 }}>{success}</p>}

                  <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} style={{ width: '100%', background: '#fff', color: '#000', padding: '16px', borderRadius: 16, fontSize: 15, fontWeight: 700, border: 'none', outline: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                    {loading ? <div style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <>{mode === 'login' ? 'Continue' : 'Create Account'} <ChevronRight size={18} /></>}
                  </motion.button>
                </form>
              </motion.div>
            ) : mode === 'phone' ? (
              <motion.div key="phone" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <button onClick={() => { setMode('login'); clearMessages(); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', marginBottom: 20 }}>← Back to Email</button>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Phone Login</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>We'll send a secure one-time code.</p>
                <form onSubmit={handlePhoneSend} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Phone size={18} style={{ position: 'absolute', left: 16, color: 'rgba(255,255,255,0.4)' }} />
                    <input type="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px 16px 16px 44px', borderRadius: 16, color: '#fff', fontSize: 15, outline: 'none' }} autoFocus />
                  </div>
                  {error && <p style={{ color: '#f43f5e', fontSize: 13 }}>{error}</p>}
                  <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} style={{ width: '100%', background: '#fff', color: '#000', padding: '16px', borderRadius: 16, fontSize: 15, fontWeight: 700, border: 'none', outline: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                    {loading ? <div style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <>Send OTP <ChevronRight size={18} /></>}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <button onClick={() => { setMode('phone'); clearMessages(); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', marginBottom: 20 }}>← Back</button>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Enter OTP</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Code sent to {phone}</p>
                <form onSubmit={handleOTPVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input type="text" placeholder="● ● ● ● ● ●" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoFocus style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: 16, color: '#fff', fontSize: 24, letterSpacing: '0.4em', textAlign: 'center', fontFamily: 'monospace', outline: 'none' }} />
                  {error && <p style={{ color: '#f43f5e', fontSize: 13 }}>{error}</p>}
                  <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} style={{ width: '100%', background: '#fff', color: '#000', padding: '16px', borderRadius: 16, fontSize: 15, fontWeight: 700, border: 'none', outline: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                    {loading ? <div style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <>Verify & Sign In <ChevronRight size={18} /></>}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* BOTTOM: Alternative Logins */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={handleGuestLogin} style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
            <User size={18} style={{ color: 'rgba(255,255,255,0.6)' }} /> Continue as Guest
          </button>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleGoogleAuth} style={{ flex: 1, padding: '16px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button onClick={() => { setMode('phone'); clearMessages(); }} style={{ flex: 1, padding: '16px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
              <Phone size={18} style={{ color: 'rgba(255,255,255,0.6)' }} /> Phone
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 16 }}>
            By continuing, you agree to our Terms of Service & Privacy Policy.
          </p>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default AuthScreen;
