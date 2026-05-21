import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="splash"
      exit={{ y: '-100%', opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
    >
      <div className="splash-bg">
        <motion.div
          className="splash-orb primary"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="splash-orb secondary"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [180, 0, -180],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="splash-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.div
            className="splash-icon"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles size={28} />
          </motion.div>
          <h1 className="splash-name">Aura</h1>
          <p className="splash-tagline">Budget · Schedule · Manifest</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
