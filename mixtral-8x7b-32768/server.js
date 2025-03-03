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

app.post("/chat-mixtral-8x7b-32768", async (req, res) => {
    const { message } = req.body;

    try {
        console.log("Received message:", message);

        const chatCompletion = await groq.chat.completions.create({
            model: "mixtral-8x7b-32768",
            messages: [
                { role: "system", content: "You are a decision-making AI. When asked a question, you must ask exactly two short, relevant questions to gather context. Only after receiving answers to both, respond with either 'Yes' or 'No'—nothing else. No explanations, no extra text." },  // Pre-knowledge message
                { role: "user", content: message },  // User message
            ],
            temperature: 1,
            max_tokens: 1024,
            top_p: 1,
            stream: false, 
        });

        console.log("Groq Response:", chatCompletion);
        res.json(chatCompletion);
    } catch (error) {
        console.error("Groq API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Error communicating with Groq AI API" });
    }
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)); 