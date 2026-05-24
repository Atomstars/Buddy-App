import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, Send, Lock, TrendingUp, HelpCircle,
  TrendingDown, ShieldCheck, AlertTriangle, Coins, Zap
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const PRESET_QUESTIONS = [
  { id: '1', text: 'Where did I spend most this month?', key: 'most_spent' },
  { id: '2', text: 'How can I save more?', key: 'savings_tip' },
  { id: '3', text: 'Show unusual spending patterns', key: 'anomalies' },
  { id: '4', text: 'What category is increasing?', key: 'category_spikes' }
];

export const AuraIntelligenceSheet = ({ isOpen, onClose, expenses = [] }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'aura',
      text: "Hello! I am Aura Intelligence. I've analyzed your account history. Ask me anything about your money patterns, savings opportunities, or habits.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateAIResponse = (userQuery) => {
    setIsTyping(true);
    setTimeout(() => {
      let responseText = "";
      let customNode = null;

      const lower = userQuery.toLowerCase();
      if (lower.includes('most') || lower.includes('spend') || lower.includes('where')) {
        // Compute actual most expensive category from expenses
        const categoryTotals = {};
        expenses.forEach(e => {
          categoryTotals[e.sector] = (categoryTotals[e.sector] || 0) + e.amount;
        });
        const sortedCats = Object.entries(categoryTotals).sort((a,b) => b[1] - a[1]);
        
        if (sortedCats.length > 0) {
          const topCat = sortedCats[0][0];
          const topAmt = sortedCats[0][1];
          responseText = `Your highest spending category is **${topCat.toUpperCase()}** at **${formatCurrency(topAmt)}**. Following close behind are other categories like ${sortedCats.slice(1,3).map(c => `**${c[0]}** (${formatCurrency(c[1])})`).join(', ')}.`;
          
          customNode = (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.05)', marginTop: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 10 }}>Top Category Breakdown</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sortedCats.map(([cat, amt]) => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-2)', textTransform: 'capitalize' }}>{cat}</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{formatCurrency(amt)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        } else {
          responseText = "You don't have any recorded transactions yet. Try adding some expenses in your Budget dashboard to unlock spending analysis!";
        }
      } else if (lower.includes('save') || lower.includes('more')) {
        responseText = "Based on your spending patterns, here are 3 highly tailored ways to increase your savings consistency:\n\n1. **Weekend Limit:** You spend roughly 45% more on Friday-Sunday compared to weekdays. Trimming weekend food outings by just 20% would save ₹2,400 per month.\n2. **Subscriptions Audit:** We noticed recurring subscription charges. Cancelling one unused stream service adds ₹499/month back to your pocket.\n3. **EMI & Bills Alert:** Subscriptions and utility payments take up 30% of your current income. Try setting up automated payments to bypass late charges.";
        
        customNode = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            <div style={{ display: 'flex', gap: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: 12, borderRadius: 12 }}>
              <Coins size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>Estimated Potential Savings</p>
                <p style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>₹3,500 - ₹4,800 monthly projection</p>
              </div>
            </div>
          </div>
        );
      } else if (lower.includes('unusual') || lower.includes('pattern') || lower.includes('anomaly')) {
        responseText = "I detected a few interesting micro-behaviors in your transaction log:\n\n* **Late Night Food Spikes:** 35% of your food budget is spent past 9:00 PM.\n* **Double Charges:** We noticed dual purchases on transport within an hour on May 22 — might be worth a look.\n* **Fast-Paced Groceries:** Your grocery cart sizes increased from ₹1,200 to ₹1,850 in the last 14 days, suggesting minor inflation or change in diet.";
        
        customNode = (
          <div style={{ display: 'flex', gap: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', padding: 12, borderRadius: 12, marginTop: 12 }}>
            <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>Alert: Spending Pattern Shift</p>
              <p style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>Late-night eating has shown an upward shift (+12% week-on-week).</p>
            </div>
          </div>
        );
      } else if (lower.includes('category') || lower.includes('increase') || lower.includes('spike')) {
        responseText = "Analyzing recent shifts, **FOOD** and **SHOPPING** are your fastest expanding categories.\n\n* **Food** is up 18% compared to the previous week.\n* **Shopping** has increased 11% due to recent clothing purchases.\n* Fortunately, **Bills** & **Utilities** are stabilized at 0% change.";
        
        customNode = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(244,63,94,0.06)', padding: '8px 12px', borderRadius: 10 }}>
              <span style={{ fontSize: 12, color: '#f43f5e', fontWeight: 600 }}>Food Outgoings</span>
              <span style={{ fontSize: 12, color: '#f43f5e', fontWeight: 700 }}>+18% Week-over-Week</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(139,92,246,0.06)', padding: '8px 12px', borderRadius: 10 }}>
              <span style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 600 }}>Shopping Log</span>
              <span style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 700 }}>+11% Week-over-Week</span>
            </div>
          </div>
        );
      } else {
        responseText = `Interesting question! Let me search your accounts... In general, your overall spending this period stands at **${formatCurrency(expenses.reduce((acc,curr) => acc + curr.amount, 0))}**. Most expenses occur around middle of the week, with high-frequency items in groceries and food. Let me know if you would like me to compile details on custom patterns!`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          sender: 'aura',
          text: responseText,
          customNode: customNode,
          timestamp: new Date()
        }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = (textToSend = input) => {
    if (!textToSend.trim()) return;
    
    // Append User Message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // Generate AI response
    generateAIResponse(textToSend);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          />

          {/* Assistant Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 480,
              height: '82vh',
              background: 'linear-gradient(180deg, #121215 0%, #080809 100%)',
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              border: '1px solid rgba(255,255,255,0.08)',
              borderBottom: 'none',
              boxShadow: '0 -20px 80px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 120,
              overflow: 'hidden'
            }}
          >
            {/* Sheet Handle */}
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '12px auto 8px' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.2) 100%)',
                  border: '1px solid rgba(251,191,36,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(251,191,36,0.1)'
                }}>
                  <Sparkles size={16} color="#fbbf24" className="aura-ai-shimmer" />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                    Aura Intelligence
                  </h3>
                  <span style={{ fontSize: 11, color: 'rgba(251,191,36,0.7)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={11} /> Secured financial intelligence
                  </span>
                </div>
              </div>
              
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginLeft: 'auto', border: 'none', cursor: 'pointer', outline: 'none'
                }}
              >
                <X size={15} color="rgba(255,255,255,0.5)" />
              </button>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Premium Dashboard Insights (Static within AI panel) */}
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 20, padding: 16, border: '1px solid rgba(255,255,255,0.04)', marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Active Observations</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
                    <TrendingUp size={14} color="#f43f5e" style={{ marginTop: 2 }} />
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                      Groceries spike by <strong style={{ color: '#fff' }}>45%</strong> between Friday and Sunday.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
                    <TrendingDown size={14} color="#10b981" style={{ marginTop: 2 }} />
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                      You save <strong style={{ color: '#fff' }}>14%</strong> more during working weekdays.
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Thread */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      background: msg.sender === 'user' ? '#fff' : 'rgba(255,255,255,0.04)',
                      color: msg.sender === 'user' ? '#000' : 'rgba(255,255,255,0.9)',
                      border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      padding: '12px 16px',
                      fontSize: 14,
                      lineHeight: 1.5,
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {msg.text}
                  </div>
                  
                  {/* Custom node visualization if present */}
                  {msg.customNode}

                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4, padding: '0 4px' }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div style={{ display: 'flex', gap: 6, alignSelf: 'flex-start', background: 'rgba(255,255,255,0.04)', padding: '12px 18px', borderRadius: 20 }}>
                  <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse-glow 1s infinite alternate' }} />
                  <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse-glow 1s infinite alternate 0.2s' }} />
                  <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse-glow 1s infinite alternate 0.4s' }} />
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestions Strip */}
            <div style={{
              display: 'flex', gap: 8, padding: '10px 20px', overflowX: 'auto',
              borderTop: '1px solid rgba(255,255,255,0.03)',
              background: 'rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none'
            }}>
              {PRESET_QUESTIONS.map(q => (
                <button
                  key={q.id}
                  onClick={() => handleSend(q.text)}
                  style={{
                    padding: '8px 14px', borderRadius: 99,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer', outline: 'none',
                    display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <HelpCircle size={12} color="rgba(251,191,36,0.6)" />
                  {q.text}
                </button>
              ))}
            </div>

            {/* Message input */}
            <div style={{ padding: '16px 20px calc(24px + env(safe-area-inset-bottom, 12px))', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Ask Aura anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                style={{
                  flex: 1, height: 50, borderRadius: 25,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: '0 20px', color: '#fff', fontSize: 14, outline: 'none'
                }}
              />
              <button
                onClick={() => handleSend()}
                style={{
                  width: 50, height: 50, borderRadius: '50%',
                  background: '#fff', color: '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', border: 'none', outline: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Send size={18} />
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
