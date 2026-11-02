import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { agents } from "./agents.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, configured: Boolean(process.env.GEMINI_API_KEY) }));
app.get("/api/agents", (_req, res) => res.json({ agents: agents.map(({ systemInstruction, ...agent }) => agent) }));

app.post("/api/chat", async (req, res) => {
  try {
    const { agentId, messages } = req.body ?? {};
    const agent = agents.find((item) => item.id === agentId);
    if (!agent) return res.status(400).json({ error: "Unknown agent selected." });
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
      return res.status(400).json({ error: "Send between 1 and 30 chat messages." });
    }
    const cleanMessages = messages.map((message) => ({
      role: message.role === "model" ? "model" : "user",
      parts: [{ text: String(message.text ?? "").slice(0, 12000) }]
    })).filter((message) => message.parts[0].text.trim());

    if (!cleanMessages.length || cleanMessages[cleanMessages.length - 1].role !== "user") {
      return res.status(400).json({ error: "The latest message must be from the user." });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: "Gemini is not configured. Add GEMINI_API_KEY to your environment variables." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: cleanMessages,
      config: { systemInstruction: agent.systemInstruction, temperature: 0.7 }
    });
    return res.json({ text: response.text || "I couldn't generate a response. Please try again." });
  } catch (error) {
    console.error("Gemini request failed:", error);
    return res.status(500).json({ error: "The AI request failed. Check your API key, model access, and try again." });
  }
});

export default app;