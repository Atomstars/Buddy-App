import { supabase } from '../utils/supabaseClient';
import Tesseract from 'tesseract.js';

// Dev: local Express on :5000. Production (Vercel): the deployed backend
// service lives at /_/backend on the same origin (see vercel.json).
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '/_/backend');

// Local fallback so the diary review never dead-ends if the backend is offline.
const localReview = (p) => {
  const tasks = p.tasks || [];
  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const completion = total ? Math.round((done / total) * 100) : null;
  const spend = (p.expenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const wins = [];
  if (done > 0) wins.push(`You completed ${done} task${done > 1 ? 's' : ''} today.`);
  if ((p.wins || []).filter(Boolean).length) wins.push(...p.wins.filter(Boolean));
  if (!wins.length) wins.push('You took a moment to reflect — that counts.');
  const improvements = [];
  if (total && completion < 50) improvements.push(`Only ${completion}% of tasks done — pick one key task tomorrow.`);
  if ((p.improvements || []).filter(Boolean).length) improvements.push(...p.improvements.filter(Boolean));
  if (!improvements.length) improvements.push('Carry today’s momentum forward.');
  return {
    summary: `${total ? `You finished ${done} of ${total} tasks. ` : ''}${spend > 0 ? `You spent ₹${spend.toFixed(0)}. ` : ''}Reflecting daily is how progress compounds.`,
    wins: wins.slice(0, 3),
    improvements: improvements.slice(0, 3),
    connection: '',
    focus_tomorrow: 'Choose one thing that would make tomorrow a win.',
    _engine: 'local-fallback',
  };
};

export const api = {
    transactions: {
        getAll: async (userId, token) => {
            let query = supabase.from('expenses').select('*').order('date', { ascending: false });
            if (userId) query = query.eq('user_id', userId);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        add: async (transaction, token) => {
            const { data, error } = await supabase.from('expenses').insert([{ 
                user_id: transaction.userId,
                amount: transaction.amount, 
                note: transaction.merchant || '', 
                date: transaction.date, 
                sector: transaction.category || 'other'
            }]).select();
            if (error) throw error;
            const exp = data[0];
            return {
                id: exp.id, userId: exp.user_id, amount: exp.amount,
                merchant: exp.note || '', category: exp.sector, date: exp.date, createdAt: exp.created_at
            };
        },
        update: async (id, updates, token) => {
            const payload = {};
            if (updates.amount !== undefined) payload.amount = updates.amount;
            if (updates.category !== undefined) payload.sector = updates.category;
            if (updates.merchant !== undefined) payload.note = updates.merchant;
            if (updates.date !== undefined) payload.date = updates.date;
            
            let query = supabase.from('expenses').update(payload).eq('id', id);
            if (updates.userId) query = query.eq('user_id', updates.userId);
            
            const { data, error } = await query.select();
            if (error) throw error;
            if (!data || data.length === 0) throw new Error('Transaction not found');
            const exp = data[0];
            return {
                id: exp.id, userId: exp.user_id, amount: exp.amount,
                merchant: exp.note || '', category: exp.sector, date: exp.date, createdAt: exp.created_at
            };
        },
        delete: async (id, userId, token) => {
            let query = supabase.from('expenses').delete().eq('id', id);
            if (userId) query = query.eq('user_id', userId);
            const { error } = await query;
            if (error) throw error;
            return { success: true };
        }
    },
    ai: {
        extract: async (imageFile) => {
            try {
                // Client-side local AI parsing via Tesseract
                const { data: { text } } = await Tesseract.recognize(imageFile, 'eng');
                
                const amountMatch = text.match(/(?:Rs\.?|INR|₹|\$)\s*([\d,]+(?:\.\d{2})?)/i) || text.match(/[\d,]+(?:\.\d{2})?/);
                const amount = amountMatch ? parseFloat((amountMatch[1] || amountMatch[0]).replace(/,/g, '')) : 0;
                
                const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
                let merchant = 'Unknown Merchant';
                for (let line of lines) {
                    const lowerLine = line.toLowerCase();
                    if (!lowerLine.includes('rupees') && !lowerLine.includes('success') && !lowerLine.match(/\d/)) {
                        merchant = line;
                        break;
                    }
                }
                
                return {
                    success: true,
                    data: {
                        amount: amount,
                        merchant: merchant,
                        date: new Date().toISOString().split('T')[0],
                        type: 'expense',
                        suggested_category: 'other',
                        confidence: amount > 0 ? 80 : 30
                    }
                };
            } catch (err) {
                console.error("OCR Error:", err);
                throw new Error("Failed to extract data from image");
            }
        },
        // Ask the buddy to reflect on a day. Falls back locally if backend is down.
        review: async (payload) => {
            try {
                const res = await fetch(`${API_BASE}/api/ai/review`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error(`status ${res.status}`);
                const json = await res.json();
                return json.data;
            } catch (e) {
                console.warn('AI review backend unavailable, using local fallback:', e.message);
                return localReview(payload);
            }
        },
        insights: async (payload) => {
            try {
                const res = await fetch(`${API_BASE}/api/ai/insights`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error(`status ${res.status}`);
                const json = await res.json();
                return json.data;
            } catch (e) {
                console.warn('AI insights backend unavailable:', e.message);
                return { insights: [], _engine: 'unavailable' };
            }
        },
        status: async () => {
            try {
                const res = await fetch(`${API_BASE}/api/ai/status`);
                return await res.json();
            } catch {
                return { ai: 'offline' };
            }
        }
    }
};
