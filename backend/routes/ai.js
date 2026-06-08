const express = require('express');
const router = express.Router();
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { reviewDay, generateInsights } = require('../services/buddyBrain');
const { hasKey } = require('../services/aiProvider');

const upload = multer({ storage: multer.memoryStorage() });

// Daily reflection: takes the day's diary + tasks + expenses, returns a warm review.
router.post('/review', async (req, res) => {
  try {
    const result = await reviewDay(req.body || {});
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('AI review error:', error);
    res.status(500).json({ error: 'Failed to generate review' });
  }
});

// Cross-domain insights for the Insights page.
router.post('/insights', async (req, res) => {
  try {
    const result = await generateInsights(req.body || {});
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Lets the frontend show whether real AI (Groq) is wired up.
router.get('/status', (_req, res) => {
  res.json({ ai: hasKey() ? 'groq' : 'heuristic' });
});

router.post('/extract', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        // Open Source Local API fetching using Tesseract OCR
        const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng');

        // Simple open-source parsing strategy using regex
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
        
        const extractedData = {
            amount: amount,
            merchant: merchant,
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            suggested_category: 'other',
            confidence: amount > 0 ? 80 : 30
        };

        const { checkLearningEngine } = require('../services/learningEngine');
        const learningSuggestedCategory = await checkLearningEngine(extractedData.merchant);
        
        if (learningSuggestedCategory) {
            extractedData.suggested_category = learningSuggestedCategory;
            extractedData.confidence = 100;
        }

        res.json({
            success: true,
            data: extractedData
        });

    } catch (error) {
        console.error('OCR Extraction Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
