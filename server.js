const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Travel Bot API is running' });
});

app.post('/api/generate', async (req, res) => {
    try {
        const { systemPrompt, userInput } = req.body;
        
        const fullPrompt = `${systemPrompt}\n\nAGENT NOTES:\n${userInput}\n\nPOLISHED RESPONSE:`;
        
        console.log('\n📝 Generating response for:', userInput.substring(0, 80) + '...');
        
        // Use the correct model from your available models
        const modelName = 'gemini-2.5-flash';
        
        console.log(`🤖 Using model: ${modelName}`);
        
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: fullPrompt
                    }]
                }],
                generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,  // Increased from 1024 to 2048 for longer responses
    topP: 0.95,
}
            },
            {
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const generatedText = response.data.candidates[0].content.parts[0].text;
        
        console.log(`✅ Success! Response generated`);
        
        res.json({
            success: true,
            response: generatedText,
            model: modelName
        });
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data?.error?.message || error.message);
        
        let errorMessage = error.response?.data?.error?.message || error.message;
        
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
});

app.listen(PORT, () => {
    console.log(`\n=================================`);
    console.log(`🚀 Travel Bot Server is running!`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
    console.log(`🤖 Model: gemini-2.5-flash`);
    console.log(`=================================\n`);
});