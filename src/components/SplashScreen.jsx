import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUp, UserCircle } from 'lucide-react';

const SplashScreen = ({ onEnter }) => {
  return (
    <motion.div 
      className="splash-screen"
      initial={{ opacity: 1 }}
      exit={{ y: '-100%', opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
    >
      <div className="splash-bg">
        <motion.div 
          className="splash-blob"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "50% 50% 20% 80% / 25% 80% 20% 75%", "30% 70% 70% 30% / 30% 30% 70% 70%"]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="splash-blob secondary"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            borderRadius: ["50% 50% 20% 80% / 25% 80% 20% 75%", "30% 70% 70% 30% / 30% 30% 70% 70%", "50% 50% 20% 80% / 25% 80% 20% 75%"]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="splash-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="splash-logo"
        >
          <div className="logo-icon-wrap">
            <Sparkles className="logo-sparkle" size={32} />
          </div>
          <p className="eyebrow">Your Personal Finance Guide</p>
          <h1>Budget Buddy</h1>
        </motion.div>

        <div className="splash-actions">
          <motion.button
            className="enter-button"
            onClick={onEnter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Tap to continue</span>
            <ArrowUp size={20} />
          </motion.button>
          
          <motion.button 
            className="profile-badge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <UserCircle size={18} />
            <span>Akash</span>
          </motion.button>
        </div>
      </div>

      <div className="splash-footer">
        <p>© 2024 Buddy Ecosystem</p>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
