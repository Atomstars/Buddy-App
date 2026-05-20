import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, Phone, ArrowRight, Eye, EyeOff, X, Check, Loader2 } from 'lucide-react';

const AuthScreen = ({ onSignIn, onSignUp, onGoogleSignIn, onPhoneSignIn, onVerifyOTP }) => {
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

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const handler = mode === 'login' ? onSignIn : onSignUp;
      const { error: authError } = await handler(email, password);
      if (authError) {
        setError(authError.message);
      } else if (mode === 'signup') {
        setSuccess('Account created! Check your email for verification.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    clearMessages();
    setLoading(true);
    try {
      const { error: authError } = await onGoogleSignIn();
      if (authError) setError(authError.message);
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSend = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!phone.trim() || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await onPhoneSignIn(phone);
      if (authError) {
        setError(authError.message);
      } else {
        setSuccess('OTP sent! Check your phone.');
        setMode('otp');
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!otp.trim() || otp.length < 4) {
      setError('Please enter the OTP code');
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await onVerifyOTP(phone, otp);
      if (authError) setError(authError.message);
    } catch (err) {
      setError('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="auth-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background */}
      <div className="auth-bg">
        <motion.div
          className="splash-orb primary"
          animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="splash-orb secondary"
          animate={{ scale: [1.2, 0.9, 1.2], x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Logo */}
      <motion.div
        className="auth-logo"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="splash-icon">
          <Sparkles size={28} />
        </div>
        <h1 className="splash-name" style={{ fontSize: '2.2rem' }}>Buddy</h1>
        <p className="splash-tagline" style={{ fontSize: '0.7rem' }}>Budget · Schedule · Manifest</p>
      </motion.div>

      {/* Auth Card */}
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {(mode === 'login' || mode === 'signup') && (
            <motion.div
              key="email-auth"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Login/Signup Tabs */}
              <div className="seg-tabs" style={{ marginBottom: 20 }}>
                <button
                  className={`seg-tab ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => { setMode('login'); clearMessages(); }}
                >
                  Sign In
                </button>
                <button
                  className={`seg-tab ${mode === 'signup' ? 'active' : ''}`}
                  onClick={() => { setMode('signup'); clearMessages(); }}
                >
                  Sign Up
                </button>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailAuth}>
                <div className="auth-field">
                  <div className="auth-input-wrap">
                    <Mail size={18} className="auth-input-icon" />
                    <input
                      type="email"
                      className="form-input auth-input"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <div className="auth-input-wrap">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input auth-input"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <motion.div
                    className="auth-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="auth-input-wrap">
                      <Lock size={18} className="auth-input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input auth-input"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.p
                    className="auth-error"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.p>
                )}

                {success && (
                  <motion.p
                    className="auth-success"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Check size={14} /> {success}
                  </motion.p>
                )}

                <button className="btn-primary auth-submit" type="submit" disabled={loading}>
                  {loading ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Loader2 size={18} />
                    </motion.span>
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="auth-divider">
                <span>or continue with</span>
              </div>

              {/* Social Buttons */}
              <div className="auth-social">
                <button className="auth-social-btn" onClick={handleGoogleAuth} disabled={loading}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  className="auth-social-btn"
                  onClick={() => { setMode('phone'); clearMessages(); }}
                  disabled={loading}
                >
                  <Phone size={18} />
                  <span>Phone</span>
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'phone' && (
            <motion.div
              key="phone-auth"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <button
                className="auth-back-btn"
                onClick={() => { setMode('login'); clearMessages(); }}
              >
                ← Back to email
              </button>

              <h2 className="auth-card-title">Phone Login</h2>
              <p className="auth-card-desc">We'll send you a one-time verification code</p>

              <form onSubmit={handlePhoneSend}>
                <div className="auth-field">
                  <div className="auth-input-wrap">
                    <Phone size={18} className="auth-input-icon" />
                    <input
                      type="tel"
                      className="form-input auth-input"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <motion.p className="auth-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {error}
                  </motion.p>
                )}

                <button className="btn-primary auth-submit" type="submit" disabled={loading}>
                  {loading ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Loader2 size={18} />
                    </motion.span>
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {mode === 'otp' && (
            <motion.div
              key="otp-auth"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <button
                className="auth-back-btn"
                onClick={() => { setMode('phone'); clearMessages(); }}
              >
                ← Back
              </button>

              <h2 className="auth-card-title">Enter OTP</h2>
              <p className="auth-card-desc">Code sent to {phone}</p>

              <form onSubmit={handleOTPVerify}>
                <div className="auth-field">
                  <div className="auth-input-wrap">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      type="text"
                      className="form-input auth-input"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      autoFocus
                      style={{ letterSpacing: '0.3em', fontFamily: 'var(--font-mono)', fontSize: '1.2rem', textAlign: 'center' }}
                    />
                  </div>
                </div>

                {error && (
                  <motion.p className="auth-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {error}
                  </motion.p>
                )}

                {success && (
                  <motion.p className="auth-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Check size={14} /> {success}
                  </motion.p>
                )}

                <button className="btn-primary auth-submit" type="submit" disabled={loading}>
                  {loading ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Loader2 size={18} />
                    </motion.span>
                  ) : (
                    <>
                      Verify & Sign In
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <button
                className="auth-resend"
                onClick={handlePhoneSend}
                disabled={loading}
              >
                Didn't receive code? Resend
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <motion.p
        className="auth-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        By continuing, you agree to our Terms of Service
      </motion.p>
    </motion.div>
  );
};

export default AuthScreen;
