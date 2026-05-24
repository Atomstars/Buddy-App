import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, LineChart, Target, ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const VisionPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', paddingBottom: 100, overflow: 'hidden' }}>
      {/* Background Cinematic Effects */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 60%)', filter: 'blur(60px)', zIndex: 0 }} />
      
      {/* Header */}
      <header style={{ padding: '24px 20px', position: 'relative', zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', outline: 'none' }}>
          <ArrowLeft size={20} />
        </button>
      </header>

      {/* Main Content */}
      <div style={{ padding: '20px', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 20, stiffness: 200 }} style={{ width: 80, height: 80, borderRadius: 40, background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(245,158,11,0.05) 100%)', border: '1px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 0 40px rgba(251,191,36,0.2)' }}>
          <Sparkles size={32} color="#fbbf24" />
        </motion.div>

        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: 8, textAlign: 'center' }}>Aura Vision</motion.h1>
        
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: 300, lineHeight: 1.5, marginBottom: 40 }}>
          The world's most advanced AI financial forecaster.
        </motion.p>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: BrainCircuit, title: 'AI Goal Planning', desc: 'Auto-adjusting roadmaps based on your spending behavior.' },
            { icon: LineChart, title: 'Future Forecasting', desc: 'Predict exactly how much money you will have in 5 years.' },
            { icon: Target, title: 'Smart Optimization', desc: 'Automated expense cutting without sacrificing lifestyle.' }
          ].map((feat, idx) => (
            <motion.div key={idx} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + (idx * 0.1) }} style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', borderRadius: 24, padding: 20, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <feat.icon size={20} color="#fbbf24" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{feat.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} style={{ marginTop: 40, width: '100%' }}>
          <button disabled style={{ width: '100%', padding: '20px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'not-allowed' }}>
            <Lock size={18} /> Coming in Update 2.0
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default VisionPage;
