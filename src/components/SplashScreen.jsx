import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen = ({ onComplete }) => {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="aura-splash"
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
    >
      {/* Atmospheric glow */}
      <div className="aura-splash-glow" />

      {/* Secondary subtle glow */}
      <div style={{
        position: 'absolute',
        width: '280px',
        height: '280px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        filter: 'blur(40px)',
        top: '60%',
        left: '20%',
        transform: 'translate(-50%, -50%)',
        animation: 'pulse-glow 6s ease-in-out infinite reverse',
      }} />

      {/* Content */}
      <div className="aura-splash-content">
        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '26px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 60px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Aura "A" mark */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M18 4L32 30H4L18 4Z"
              stroke="rgba(129,140,248,0.9)"
              strokeWidth="2"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M10 22H26"
              stroke="rgba(129,140,248,0.6)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="18" cy="18" r="3" fill="rgba(99,102,241,0.8)" />
          </svg>
        </motion.div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="aura-splash-logo">
            Aur<span>a</span>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p className="aura-splash-tagline">Your premium life OS</p>
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '40px',
          }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'rgba(99,102,241,0.6)',
              }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
