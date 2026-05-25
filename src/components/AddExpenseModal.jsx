import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, Edit3, X, Loader2, Sparkles } from 'lucide-react';
import { SECTORS, parseCurrencyInput } from '../utils/formatters';
import { formatDateISO } from '../utils/dateUtils';
import { api } from '../services/api';

export const AddExpenseModal = ({ isOpen, onClose, onSave, onAIAssistData }) => {
    const [mode, setMode] = useState('menu'); // 'menu', 'manual', 'loading'
    const [amount, setAmount] = useState('');
    const [merchant, setMerchant] = useState('');
    const [sector, setSector] = useState('other');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(formatDateISO(new Date()));
    
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setMode('loading');
        try {
            const result = await api.ai.extract(file);
            if (result.success && result.data) {
                // Pass to AI Assistant Review
                onAIAssistData(result.data);
                onClose();
            } else {
                alert("Failed to extract data. Please try manual entry.");
                setMode('menu');
            }
        } catch (error) {
            console.error(error);
            alert("Error communicating with AI Vision engine.");
            setMode('menu');
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        const parsedAmount = parseCurrencyInput(amount);
        if (parsedAmount <= 0) return;
        onSave({ amount: parsedAmount, merchant, sector, note, date, confidence: 100, is_recurring: false });
        onClose();
        setMode('menu');
        setAmount('');
        setMerchant('');
        setNote('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
                    />
                    
                    <motion.div
                        initial={{ y: '100%', x: '-50%' }}
                        animate={{ y: 0, x: '-50%' }}
                        exit={{ y: '100%', x: '-50%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{ position: 'fixed', left: '50%', bottom: 0, zIndex: 301, width: 'min(100vw, 480px)', background: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)', borderRadius: '36px 36px 0 0', padding: '32px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 -20px 60px rgba(0,0,0,0.8)' }}
                    >
                        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.2)', margin: '0 auto 32px' }} />

                        {mode === 'loading' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                                    <Sparkles size={48} color="#8b5cf6" />
                                </motion.div>
                                <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginTop: 24 }}>Aura AI is analyzing...</h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 8 }}>Extracting amount, merchant, and category</p>
                            </div>
                        )}

                        {mode === 'menu' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>Add Expense</h3>
                                
                                <button onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', outline: 'none' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ImageIcon size={24} color="#fff" />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <h4 style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>Upload Screenshot</h4>
                                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>PhonePe, GPay, Paytm or Receipt</p>
                                    </div>
                                </button>
                                
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" style={{ display: 'none' }} />

                                <button onClick={() => setMode('manual')} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', outline: 'none' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Edit3 size={24} color="#fff" />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <h4 style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>Manual Entry</h4>
                                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>Type details yourself</p>
                                    </div>
                                </button>
                            </div>
                        )}

                        {mode === 'manual' && (
                            <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>Manual Entry</h3>
                                    <button type="button" onClick={() => setMode('menu')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)' }}><X size={20} /></button>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>AMOUNT</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <span style={{ position: 'absolute', left: 16, color: '#fff', fontSize: 20, fontWeight: 700 }}>₹</span>
                                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 16px 16px 40px', borderRadius: 16, color: '#fff', fontSize: 24, fontWeight: 800, outline: 'none' }} autoFocus />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>MERCHANT / TITLE</label>
                                    <input type="text" value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="e.g. Zomato, Uber" style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: 16, color: '#fff', fontSize: 16, outline: 'none' }} />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>CATEGORY</label>
                                    <div style={{ display: 'flex', overflowX: 'auto', gap: 8, paddingBottom: 8, scrollbarWidth: 'none' }}>
                                        {SECTORS.map(s => (
                                            <button key={s.id} type="button" onClick={() => setSector(s.id)} style={{ flexShrink: 0, padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: sector === s.id ? s.color + '30' : 'rgba(255,255,255,0.05)', border: `1px solid ${sector === s.id ? s.color : 'rgba(255,255,255,0.1)'}`, color: sector === s.id ? '#fff' : 'rgba(255,255,255,0.6)', transition: 'all 0.2s', outline: 'none' }}>
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>DATE</label>
                                    <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: 16, color: '#fff', fontSize: 16, outline: 'none', colorScheme: 'dark' }} />
                                </div>

                                <motion.button type="submit" whileTap={{ scale: 0.96 }} style={{ width: '100%', padding: '18px', borderRadius: 16, marginTop: 8, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
                                    Save Transaction
                                </motion.button>
                            </form>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AddExpenseModal;
