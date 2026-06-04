import { supabase } from '../utils/supabaseClient';
import Tesseract from 'tesseract.js';

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
        }
    }
};
