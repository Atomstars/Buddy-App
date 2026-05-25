const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://rufnqsyejgtxiizklcow.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_syfc-S_FoUPs4q0JPP0eSA_ixmJm_AJ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Basic learning engine that looks up past transactions to suggest a category
async function checkLearningEngine(merchantName) {
    if (!merchantName) return null;

    try {
        // Query recent transactions for this merchant where the user manually changed the category
        // For simplicity, we just look at the most frequent category for this merchant
        const { data, error } = await supabase
            .from('transactions')
            .select('category')
            .ilike('merchant', merchantName)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error || !data || data.length === 0) {
            return null;
        }

        // Find the most frequent category in the last 5 transactions
        const categoryCounts = {};
        let maxCount = 0;
        let suggestedCategory = null;

        for (const tx of data) {
            if (tx.category) {
                categoryCounts[tx.category] = (categoryCounts[tx.category] || 0) + 1;
                if (categoryCounts[tx.category] > maxCount) {
                    maxCount = categoryCounts[tx.category];
                    suggestedCategory = tx.category;
                }
            }
        }

        return suggestedCategory;

    } catch (error) {
        console.error('Learning Engine Error:', error);
        return null;
    }
}

module.exports = {
    checkLearningEngine
};
