import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Edit3, AlertTriangle } from 'lucide-react';
import { SECTORS } from '../utils/formatters';

export const AIAssistantReview = ({ isOpen, aiData, onConfirm, onEdit, onCancel }) => {
    if (!aiData) return null;

    const isLowConfidence = aiData.confidence < 80;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 401, width: 'min(90vw, 400px)', background: '#18181b', borderRadius: 28, padding: 32, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                            <div style={{ width: 64, height: 64, borderRadius: 20, background: isLowConfidence ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isLowConfidence ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)'}` }}>
                                {isLowConfidence ? <AlertTriangle size={32} color="#f59e0b" /> : <Sparkles size={32} color="#818cf8" />}
                            </div>
                        </div>

                        <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>
                            {isLowConfidence ? 'Review Needed' : 'AI Extracted Details'}
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
                            {isLowConfidence ? "We're not fully confident. Please verify." : "We found the following transaction info:"}
                        </p>

                        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: 20, marginBottom: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600 }}>Amount</span>
                                <span style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>₹{aiData.amount}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600 }}>Merchant</span>
                                <span style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{aiData.merchant}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600 }}>Category</span>
                                <span style={{ color: '#818cf8', fontSize: 14, fontWeight: 700, textTransform: 'capitalize' }}>{aiData.suggested_category}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <motion.button onClick={onEdit} whileTap={{ scale: 0.96 }} style={{ flex: 1, padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <Edit3 size={16} /> Edit
                            </motion.button>
                            <motion.button onClick={() => onConfirm(aiData)} whileTap={{ scale: 0.96 }} style={{ flex: 2, padding: 16, borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
                                <Check size={18} /> {isLowConfidence ? 'Looks Good' : 'Confirm Save'}
                            </motion.button>
                        </div>
                        <button onClick={onCancel} style={{ width: '100%', marginTop: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AIAssistantReview;
