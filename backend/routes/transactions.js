const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://rufnqsyejgtxiizklcow.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_syfc-S_FoUPs4q0JPP0eSA_ixmJm_AJ';

const getSupabaseClient = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        return createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: authHeader } }
        });
    }
    return createClient(supabaseUrl, supabaseKey);
};

// Helper to map DB 'expenses' to frontend 'transaction' format
const mapToTransaction = (exp) => ({
    id: exp.id,
    userId: exp.user_id,
    amount: exp.amount,
    merchant: exp.note || '',
    category: exp.sector,
    date: exp.date,
    createdAt: exp.created_at
});

// Get all transactions
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        const supabase = getSupabaseClient(req);
        let query = supabase.from('expenses').select('*').order('date', { ascending: false });
        
        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;

        if (error) throw error;
        res.json(data.map(mapToTransaction));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new transaction
router.post('/', async (req, res) => {
    try {
        const { userId, amount, merchant, category, date } = req.body;
        
        if (!userId) return res.status(400).json({ error: 'userId is required' });
        
        const supabase = getSupabaseClient(req);
        const { data, error } = await supabase
            .from('expenses')
            .insert([
                { 
                    user_id: userId,
                    amount, 
                    note: merchant || '', 
                    date, 
                    sector: category || 'other'
                }
            ])
            .select();

        if (error) throw error;
        res.json(mapToTransaction(data[0]));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a transaction
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, amount, merchant, category, date } = req.body;
        
        const supabase = getSupabaseClient(req);
        let query = supabase.from('expenses').update({ 
            amount, 
            note: merchant, 
            date, 
            sector: category 
        });

        if (userId) {
            query = query.eq('user_id', userId);
        }
        
        const { data, error } = await query.eq('id', id).select();

        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json(mapToTransaction(data[0]));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a transaction
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;
        
        const supabase = getSupabaseClient(req);
        let query = supabase.from('expenses').delete().eq('id', id);
        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { error } = await query;

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
