import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, IndianRupee, Target, Bell, TrendingUp, ChevronRight } from 'lucide-react';

const STEPS = [
  {
    id: 'budget',
    num: '01',
    question: "What's your monthly budget?",
    hint: 'We\'ll track your spending against this target',
    type: 'currency',
    key: 'monthlyBudget',
    placeholder: '30000',
  },
  {
    id: 'savings',
    num: '02',
    question: 'Set a savings goal',
    hint: 'How much do you want to save each month?',
    type: 'currency',
    key: 'savingsGoal',
    placeholder: '5000',
  },
  {
    id: 'bills',
    num: '03',
    question: 'Track bills & EMIs?',
    hint: 'Get reminders before due dates',
    type: 'toggle',
    key: 'trackBills',
  },
  {
    id: 'investing',
    num: '04',
    question: 'Set investment goals?',
    hint: 'Track SIPs, FDs, and portfolio targets',
    type: 'toggle',
    key: 'investmentGoals',
  },
  {
    id: 'reminders',
    num: '05',
    question: 'Enable reminders?',
    hint: 'Daily nudges and scheduled alerts',
    type: 'toggle',
    key: 'reminders',
  },
  {
    id: 'style',
    num: '06',
    question: 'Your spending style',
    hint: 'This helps us personalize insights for you',
    type: 'style',
    key: 'spendingStyle',
    options: [
      { id: 'minimal', emoji: '🧘', name: 'Minimal', desc: 'Spend only essentials, save aggressively' },
      { id: 'balanced', emoji: '⚖️', name: 'Balanced', desc: 'Mix of savings and lifestyle spending' },
      { id: 'aggressive', emoji: '🏆', name: 'Aggressive Saver', desc: 'Maximize savings above all' },
      { id: 'flexible', emoji: '🌊', name: 'Flexible', desc: 'Adapt month to month as needed' },
    ],
  },
];

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({
    monthlyBudget: '',
    savingsGoal: '',
    trackBills: null,
    investmentGoals: null,
    reminders: null,
    spendingStyle: null,
  });

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const progress = step / STEPS.length;

  const getValue = (key) => values[key];

  const setValue = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const canProceed = () => {
    const val = getValue(currentStep.key);
    if (currentStep.type === 'currency') return true; // allow skip with empty
    if (currentStep.type === 'toggle') return val !== null;
    if (currentStep.type === 'style') return val !== null;
    return true;
  };

  const handleNext = () => {
    if (isLast) {
      // Save profile to localStorage
      localStorage.setItem('aura_profile', JSON.stringify(values));
      localStorage.setItem('aura_onboarding_done', 'true');
      onComplete(values);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('aura_onboarding_done', 'true');
    onComplete({});
  };

  return (
    <motion.div
      className="aura-onboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Progress bar */}
      <div className="aura-onboard-progress">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`aura-onboard-dot ${i < step ? 'done' : i === step ? 'active' : ''}`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="aura-onboard-body">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="aura-onboard-step-num">Step {currentStep.num} of 06</p>
            <h2 className="aura-onboard-q">{currentStep.question}</h2>

            {currentStep.hint && (
              <p style={{ fontSize: '14px', color: 'var(--text-3)', marginBottom: '24px', lineHeight: 1.5 }}>
                {currentStep.hint}
              </p>
            )}

            {/* Currency input */}
            {currentStep.type === 'currency' && (
              <div className="aura-onboard-input-wrap">
                <span className="aura-onboard-currency">₹</span>
                <input
                  className="aura-onboard-input"
                  type="number"
                  inputMode="numeric"
                  placeholder={currentStep.placeholder}
                  value={getValue(currentStep.key)}
                  onChange={e => setValue(currentStep.key, e.target.value)}
                  autoFocus
                />
              </div>
            )}

            {/* Toggle yes/no */}
            {currentStep.type === 'toggle' && (
              <div className="aura-onboard-toggle">
                {[
                  { val: true,  label: '✓ Yes', icon: Check },
                  { val: false, label: '✕ No',  icon: null  },
                ].map(({ val, label }) => (
                  <button
                    key={String(val)}
                    className={`aura-onboard-toggle-btn ${getValue(currentStep.key) === val ? 'selected' : ''}`}
                    onClick={() => setValue(currentStep.key, val)}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Style picker */}
            {currentStep.type === 'style' && (
              <div className="aura-onboard-style-grid">
                {currentStep.options.map(opt => (
                  <button
                    key={opt.id}
                    className={`aura-onboard-style-card ${getValue(currentStep.key) === opt.id ? 'selected' : ''}`}
                    onClick={() => setValue(currentStep.key, opt.id)}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <span className="aura-onboard-style-emoji">{opt.emoji}</span>
                    <span className="aura-onboard-style-name">{opt.name}</span>
                    <span className="aura-onboard-style-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <div className="aura-onboard-footer">
        <motion.button
          className="aura-onboard-next-btn"
          onClick={handleNext}
          whileTap={{ scale: 0.96 }}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {isLast ? (
            <>
              <Check size={18} />
              Let's Go
            </>
          ) : (
            <>
              Continue
              <ArrowRight size={18} />
            </>
          )}
        </motion.button>

        <p className="aura-onboard-skip" onClick={handleSkip}>
          Skip for now
        </p>
      </div>
    </motion.div>
  );
};

export default Onboarding;
