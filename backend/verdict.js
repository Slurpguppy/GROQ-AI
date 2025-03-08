require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
const PORT = 4000;

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

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    // Initialize session if not present
    if (!conversationHistory[sessionId]) {
        conversationHistory[sessionId] = [];
    }

    // Append user's message to history
    conversationHistory[sessionId].push({ role: "user", content: message });

    try {
        console.log("Received message:", message);

        const systemMessage = { 
            role: "system", 
            content: "You are a decision-making AI. YOU MUST DECIDE ON AN ANSWER TO THE FIRST QUESTION FROM THE USER, ALWAYS REFERANCE THE ENTIRE CONVERSTIN HISTORY WHEN MAKING A DECISION. If there is not enough information, or if you are EVER unsure at any point, respond with: 'Still thinking <span class='loading loading-dots loading-xs text-info'></span>' For the first 4 to 5 user questions, always respond with: 'Still thinking <span class='loading loading-dots loading-xs text-info'></span>' Once a decision is made, do not change it unless new, substantial information is provided. Responses must be rational, responsible, and final. Certainty Ratings: Every decision must include a certainty percentage. Example: 'Yes, 80% Certain' If new information is provided: Strengthens decision → Increase certainty Weakens decision → Decrease certainty, No unnecessary text. If a decision requires a one-word answer, provide only that word. Do NOT elaborate unless explicitly requested by the user. Always reference the entire conversation history when making decisions. Note that the user will NEVER be derectly responding to your messages, another ai model is asking the user question." 
        };

        // Include system message only when making the request
        const messagesForAI = [systemMessage, ...conversationHistory[sessionId]];

        const chatCompletion = await groq.chat.completions.create({
            model: "llama3-70b-8192",
            messages: messagesForAI,
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
