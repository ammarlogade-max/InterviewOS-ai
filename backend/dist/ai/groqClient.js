"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askGroq = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const apiKey = process.env.GROQ_API_KEY;
const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const askGroq = async (system, user) => {
    if (!apiKey || apiKey === "replace_me") {
        return "Fallback response: AI service unavailable, using deterministic local logic.";
    }
    const groq = new groq_sdk_1.default({ apiKey });
    const completion = await groq.chat.completions.create({
        model,
        temperature: 0.3,
        messages: [
            { role: "system", content: system },
            { role: "user", content: user }
        ]
    });
    return completion.choices[0]?.message?.content || "No response";
};
exports.askGroq = askGroq;
