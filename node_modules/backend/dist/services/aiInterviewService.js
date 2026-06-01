"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateAnswerHeuristically = exports.generateQuestion = void 0;
const groqClient_1 = require("../ai/groqClient");
const fallbackQuestion = (role, round, difficulty, index) => {
    const bank = {
        TECHNICAL_ROUND: [
            `How would you optimize a ${role} feature that suffers from slow rendering and high API latency?`,
            `Explain your debugging approach when a production API intermittently fails under load.`,
            `Design a scalable data flow for a dashboard handling real-time updates from multiple services.`
        ],
        BEHAVIORAL_ROUND: [
            "Describe a time you disagreed with a teammate on implementation direction and how you resolved it.",
            "Tell me about a difficult deadline and how you balanced speed vs quality.",
            "Share an example where you took ownership of a failing component and improved outcomes."
        ],
        FOLLOW_UP_ROUND: [
            "Given your previous answer, what trade-offs would you reconsider with more time?",
            "What measurable KPIs would prove your solution was successful after release?",
            "If the first approach failed, what would your Plan B architecture be and why?"
        ]
    };
    const questions = bank[round] || bank.TECHNICAL_ROUND;
    const base = questions[index % questions.length];
    return `${base} (Difficulty: ${difficulty})`;
};
const generateQuestion = async (role, round, difficulty, context, previousQuestions, questionIndex) => {
    const recent = previousQuestions.slice(-5).join(" | ");
    const prompt = `Generate one ${round} interview question for ${role} at ${difficulty} difficulty.
Context: ${context}.
Avoid repeating any of these prior questions: ${recent || "none"}.
Return only the question text.`;
    try {
        const text = (await (0, groqClient_1.askGroq)("You are a sharp interviewer.", prompt)).trim();
        const isDuplicate = previousQuestions.some((q) => q.trim().toLowerCase() === text.toLowerCase());
        if (!text || isDuplicate || text.toLowerCase().includes("fallback response")) {
            return fallbackQuestion(role, round, difficulty, questionIndex);
        }
        return text;
    }
    catch {
        return fallbackQuestion(role, round, difficulty, questionIndex);
    }
};
exports.generateQuestion = generateQuestion;
const evaluateAnswerHeuristically = async (question, answer) => {
    const evalPrompt = `Question: ${question}\nAnswer: ${answer}\nReturn JSON with keys accuracy, clarity, relevance, depth, confidence from 0-100 and short feedback.`;
    const response = await (0, groqClient_1.askGroq)("Evaluate strictly and fairly.", evalPrompt);
    try {
        const parsed = JSON.parse(response);
        return parsed;
    }
    catch {
        const lengthFactor = Math.min(100, answer.length / 6);
        return {
            accuracy: lengthFactor,
            clarity: 60,
            relevance: 65,
            depth: Math.max(40, lengthFactor - 10),
            confidence: 60,
            feedback: "Fallback evaluation used due to non-JSON AI response."
        };
    }
};
exports.evaluateAnswerHeuristically = evaluateAnswerHeuristically;
