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
            content: `You are a decision evaluation AI. Your task is to assess the user's decision and format your response in seven clearly labeled parts:
            
            1. **Next Question:** Ask the user a follow-up question to gather more details or clarify the decision.  
            2. **Decision Size:** Indicate whether this is a small, medium, or large decision.  
            3. **Decision Type:** Categorize the decision (e.g., financial, personal, business, ethical, etc.).  
            4. **Things to Keep in Mind:** List important factors the user should consider before making the decision.  
            5. **Pros:** List the potential benefits of the decision.  
            6. **Cons:** List the potential downsides or risks associated with the decision.  
            7. **Initial Question:** Repeat the original question the user asked for reference.  
            8. **Final Verdict:** Provide a short, concise judgment based on the analysis.  
            
            For the first 1 to 3 questions, or if you are EVER unsure at any point, always respond with 'Still thinking <span class='loading loading-dots loading-xs text-info'></span>'.  
            Once an outcome is determined, try not to change it unless the user provides new, substantial information that alters the context.  
            Keep your responses structured and clearly labeled to maintain consistency.`
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
