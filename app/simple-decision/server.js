require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Store conversation history in memory (use a DB for persistence)
const conversationHistory = {};

app.post("/chat-llama-3.3-70b-versatile", async (req, res) => {
    const { message, sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
    }

    // Initialize session if not present
    if (!conversationHistory[sessionId]) {
        conversationHistory[sessionId] = [
            { role: "system", content: "You are a decision-making AI. **YOU MAY ONLY ASK 3 QUESTIONS!** When asked a question, you must ask exactly three short, relevant questions to gather context, one at a time. Only after receiving answers to all three, respond with either 'Yes', 'No' or ONLY IF the question cannot be answered with 'Yes' or 'No,' respond with the option provided by the user that best fits, without adding any extra text. —nothing else.  After giving a single-word answer, you may only elaborate **if the user explicitly requests it**. Otherwise, do not provide any explanation." }
        ];
    }

    // Append user's message to history
    conversationHistory[sessionId].push({ role: "user", content: message });

    try {
        console.log("Received message:", message);

        const chatCompletion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: conversationHistory[sessionId],
            temperature: 1,
            max_tokens: 1024,
            top_p: 1,
            stream: false, 
        });

        const botMessage = chatCompletion.choices[0]?.message?.content || "";

        // Append AI response to history
        conversationHistory[sessionId].push({ role: "assistant", content: botMessage });

        console.log("Groq Response:", botMessage);
        res.json({ response: botMessage, history: conversationHistory[sessionId] });
    } catch (error) {
        console.error("Groq API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Error communicating with Groq AI API" });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
