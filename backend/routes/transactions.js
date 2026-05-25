const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://rufnqsyejgtxiizklcow.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_syfc-S_FoUPs4q0JPP0eSA_ixmJm_AJ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all transactions
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new transaction
router.post('/', async (req, res) => {
    try {
        const { amount, merchant, date, type, category, confidence, is_recurring, notes } = req.body;
        
        const { data, error } = await supabase
            .from('transactions')
            .insert([
                { 
                    amount, 
                    merchant, 
                    date, 
                    type, 
                    category,
                    ai_confidence: confidence || 100,
                    is_recurring: is_recurring || false,
                    notes: notes || ''
                }
            ])
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a transaction
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, merchant, date, type, category, confidence, is_recurring, notes } = req.body;
        
        const { data, error } = await supabase
            .from('transactions')
            .update({ 
                amount, 
                merchant, 
                date, 
                type, 
                category,
                ai_confidence: confidence,
                is_recurring,
                notes
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a transaction
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
