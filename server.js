// server.js

const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve index.html & assets

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST endpoint for AI chat
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an AI inside an ATM. Only reply with: "withdraw AMOUNT", "deposit AMOUNT", or "balance".`,
        },
        {
          role: 'user',
          content: message,
        }
      ],
      max_tokens: 30,
    });

    const reply = completion.choices[0].message.content.trim();
    res.json({ reply });

  } catch (error) {
    console.error('OpenAI API error:', error.message);
    res.status(500).json({ error: 'Something went wrong with the AI.' });
  }
});

// ✅ Fix the wildcard route (this was causing the bug before)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
