const express = require('express');
const router = express.Router();
const multer = require('multer');
const Tesseract = require('tesseract.js');

const upload = multer({ storage: multer.memoryStorage() });

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
