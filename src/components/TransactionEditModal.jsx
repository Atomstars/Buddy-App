import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Repeat, Check } from 'lucide-react';
import { SECTORS } from '../utils/formatters';

export const TransactionEditModal = ({ isOpen, onClose, transaction, onSave, onDelete }) => {
    const [amount, setAmount] = useState('');
    const [merchant, setMerchant] = useState('');
    const [sector, setSector] = useState('');
    const [date, setDate] = useState('');
    const [note, setNote] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);

    useEffect(() => {
        if (transaction && isOpen) {
            setAmount(transaction.amount || '');
            setMerchant(transaction.merchant || transaction.note || '');
            setSector(transaction.sector || transaction.category || '');
            setDate(transaction.date ? transaction.date.split('T')[0] : '');
            setNote(transaction.notes || '');
            setIsRecurring(transaction.is_recurring || false);
        }
    }, [transaction, isOpen]);

    const handleSave = (e) => {
        e.preventDefault();
        onSave(transaction.id, {
            amount: Number(amount),
            merchant,
            sector,
            category: sector,
            date,
            notes: note,
            is_recurring: isRecurring
        });
        onClose();
    };

    if (!transaction) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
                    />
                    
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{ position: 'fixed', left: '50%', bottom: 0, zIndex: 301, width: 'min(100vw, 480px)', transform: 'translateX(-50%)', background: '#111113', borderRadius: '36px 36px 0 0', padding: '32px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.2)', margin: '0 auto 24px' }} />
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>Edit Transaction</h3>
                            <div style={{ display: 'flex', gap: 16 }}>
                                <button type="button" onClick={() => { onDelete(transaction.id); onClose(); }} style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 12, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e', cursor: 'pointer' }}>
                                    <Trash2 size={16} />
                                </button>
                                <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>AMOUNT</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ position: 'absolute', left: 16, color: '#fff', fontSize: 18, fontWeight: 700 }}>₹</span>
                                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px 14px 40px', borderRadius: 16, color: '#fff', fontSize: 20, fontWeight: 800, outline: 'none' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>MERCHANT / TITLE</label>
                                <input type="text" value={merchant} onChange={e => setMerchant(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px', borderRadius: 16, color: '#fff', fontSize: 16, outline: 'none' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>CATEGORY</label>
                                <select value={sector} onChange={e => setSector(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px', borderRadius: 16, color: '#fff', fontSize: 16, outline: 'none', appearance: 'none' }}>
                                    {SECTORS.map(s => <option key={s.id} value={s.id} style={{ background: '#18181b' }}>{s.label}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>DATE</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px', borderRadius: 16, color: '#fff', fontSize: 16, outline: 'none', colorScheme: 'dark' }} />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>NOTES</label>
                                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px', borderRadius: 16, color: '#fff', fontSize: 14, outline: 'none', resize: 'none' }} />
                            </div>

                            <button type="button" onClick={() => setIsRecurring(!isRecurring)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <Repeat size={18} color={isRecurring ? '#818cf8' : 'rgba(255,255,255,0.4)'} />
                                    <span style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>Recurring Payment</span>
                                </div>
                                <div style={{ width: 44, height: 24, borderRadius: 12, background: isRecurring ? '#6366f1' : 'rgba(255,255,255,0.1)', position: 'relative', transition: '0.2s' }}>
                                    <motion.div animate={{ x: isRecurring ? 22 : 2 }} style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', position: 'absolute', top: 2 }} />
                                </div>
                            </button>

                            <motion.button type="submit" whileTap={{ scale: 0.96 }} style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(99,102,241,0.3)', marginTop: 12 }}>
                                Save Changes
                            </motion.button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default TransactionEditModal;
