const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');

const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini Client
// We assume GOOGLE_API_KEY is in .env
const ai = new GoogleGenAI({});

router.post('/extract', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const image = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype,
            },
        };

        const prompt = `
You are a highly accurate financial transaction extractor.
Analyze this screenshot of a receipt or payment app (PhonePe, GPay, Paytm, etc.).
Extract the following information in strict JSON format:
{
  "amount": <number, just the value without currency symbol>,
  "merchant": "<string, name of the shop/person>",
  "date": "<string, YYYY-MM-DD if possible, else original string>",
  "type": "<string, 'expense' or 'income'>",
  "suggested_category": "<string, suggest a category based on the merchant (e.g. Food, Shopping, Transport, Utilities, Health, Subscription, Recharge, General)>",
  "confidence": <number, 0 to 100 representing how confident you are in this extraction>
}
Only output the JSON object, nothing else.
`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [prompt, image]
        });

        const textResponse = response.text;
        
        // Simple extraction in case it returns markdown block
        const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/) || textResponse.match(/({[\s\S]*})/);
        const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : textResponse;
        
        let extractedData;
        try {
            extractedData = JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse Gemini output:", textResponse);
            return res.status(500).json({ error: 'Failed to parse AI output' });
        }

        const { checkLearningEngine } = require('../services/learningEngine');
        const learningSuggestedCategory = await checkLearningEngine(extractedData.merchant);
        
        if (learningSuggestedCategory) {
            extractedData.suggested_category = learningSuggestedCategory;
            extractedData.confidence = 100; // High confidence if user explicitly taught us
        }

        res.json({
            success: true,
            data: extractedData
        });

    } catch (error) {
        console.error('AI Extraction Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
