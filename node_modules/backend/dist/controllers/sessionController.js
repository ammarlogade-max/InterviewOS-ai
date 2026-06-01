"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReport = exports.terminateInterview = exports.submitAnswer = exports.nextQuestion = exports.analyzeSession = exports.createSession = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../utils/prisma");
const sessionValidators_1 = require("../validators/sessionValidators");
const aiInterviewService_1 = require("../services/aiInterviewService");
const scoringEngine_1 = require("../engine/scoringEngine");
const adaptiveEngine_1 = require("../engine/adaptiveEngine");
const answerQualityEngine_1 = require("../engine/answerQualityEngine");
const sessionContextStore_1 = require("../services/sessionContextStore");
const getRound = (count) => {
    if (count < 3)
        return "TECHNICAL_ROUND";
    if (count < 5)
        return "BEHAVIORAL_ROUND";
    return "FOLLOW_UP_ROUND";
};
const createSession = async (req, res) => {
    const payload = sessionValidators_1.createSessionSchema.parse(req.body);
    const session = await prisma_1.prisma.session.create({
        data: {
            candidateName: payload.candidateName,
            role: payload.role,
            state: client_1.SessionState.INTRODUCTION,
            currentDifficulty: client_1.Difficulty.MEDIUM
        }
    });
    res.status(201).json(session);
};
exports.createSession = createSession;
const analyzeSession = async (req, res) => {
    const { id } = req.params;
    const { resumeText = "", jdText = "" } = req.body;
    const skills = [...new Set((resumeText + " " + jdText).match(/[A-Za-z+#.]{3,}/g)?.slice(0, 15) || [])];
    const matchPercentage = Math.min(100, Math.round((resumeText.length / Math.max(jdText.length, 1)) * 100));
    const session = await prisma_1.prisma.session.update({
        where: { id },
        data: { state: client_1.SessionState.JD_ANALYSIS }
    });
    (0, sessionContextStore_1.setSessionContext)(id, resumeText, jdText);
    res.json({
        session,
        profile: {
            extractedSkills: skills,
            roleAlignment: matchPercentage,
            summary: "AI-assisted profile extraction complete."
        }
    });
};
exports.analyzeSession = analyzeSession;
const nextQuestion = async (req, res) => {
    const { id } = req.params;
    const session = await prisma_1.prisma.session.findUnique({ where: { id }, include: { questions: true, answers: true } });
    if (!session)
        return void res.status(404).json({ error: "Session not found" });
    if (session.isTerminated)
        return void res.status(400).json({ error: "Session terminated" });
    const round = getRound(session.questions.length);
    const qText = await (0, aiInterviewService_1.generateQuestion)(session.role, round, session.currentDifficulty, "adaptive interview", session.questions.map((q) => q.prompt), session.questions.length);
    const q = await prisma_1.prisma.question.create({
        data: {
            sessionId: id,
            prompt: qText,
            category: round.includes("TECH") ? "Technical" : round.includes("BEHAV") ? "Behavioral" : "Scenario",
            difficulty: session.currentDifficulty,
            round,
            orderIndex: session.questions.length + 1
        }
    });
    await prisma_1.prisma.session.update({ where: { id }, data: { state: round } });
    res.json(q);
};
exports.nextQuestion = nextQuestion;
const submitAnswer = async (req, res) => {
    const { id } = req.params;
    const payload = sessionValidators_1.answerSchema.parse(req.body);
    const question = await prisma_1.prisma.question.findUnique({ where: { id: payload.questionId } });
    if (!question || question.sessionId !== id)
        return void res.status(404).json({ error: "Question not found" });
    const previousAnswers = await prisma_1.prisma.answer.findMany({
        where: { sessionId: id },
        orderBy: { createdAt: "asc" }
    });
    const context = (0, sessionContextStore_1.getSessionContext)(id);
    const metrics = await (0, aiInterviewService_1.evaluateAnswerHeuristically)(question.prompt, payload.answer);
    const signals = (0, answerQualityEngine_1.evaluateQualitySignals)({
        question: question.prompt,
        answer: payload.answer,
        previousAnswers: previousAnswers.map((a) => a.content),
        resumeText: context.resumeText,
        jdText: context.jdText
    });
    const qualityAdjusted = (0, answerQualityEngine_1.applyQualityPenalties)({
        accuracy: Number(metrics.accuracy) || 50,
        clarity: Number(metrics.clarity) || 50,
        relevance: Number(metrics.relevance) || 50,
        depth: Number(metrics.depth) || 50,
        confidence: Number(metrics.confidence) || 50,
        feedback: metrics.feedback
    }, signals);
    const scored = (0, scoringEngine_1.computeScore)({
        accuracy: qualityAdjusted.adjusted.accuracy,
        clarity: qualityAdjusted.adjusted.clarity,
        relevance: qualityAdjusted.adjusted.relevance,
        depth: qualityAdjusted.adjusted.depth,
        confidence: qualityAdjusted.adjusted.confidence,
        latencySeconds: payload.latencySeconds
    });
    const answer = await prisma_1.prisma.answer.create({
        data: {
            sessionId: id,
            questionId: payload.questionId,
            content: payload.answer,
            latencySeconds: payload.latencySeconds,
            timedOut: payload.timedOut,
            score: scored.total,
            feedback: qualityAdjusted.feedback
        }
    });
    const allAnswers = await prisma_1.prisma.answer.findMany({ where: { sessionId: id } });
    const avg = allAnswers.reduce((s, a) => s + a.score, 0) / allAnswers.length;
    const weakAnswerCount = allAnswers.filter((a) => a.score < 40).length;
    const timeoutCount = allAnswers.filter((a) => a.timedOut).length;
    const difficulty = (0, adaptiveEngine_1.nextDifficulty)(avg, question.difficulty);
    const terminateReason = (0, adaptiveEngine_1.shouldTerminate)(weakAnswerCount, timeoutCount, scored.total);
    const updated = await prisma_1.prisma.session.update({
        where: { id },
        data: {
            readinessScore: avg,
            weakAnswerCount,
            timeoutCount,
            currentDifficulty: difficulty,
            isTerminated: Boolean(terminateReason),
            terminationReason: terminateReason || null,
            state: terminateReason ? client_1.SessionState.TERMINATED : client_1.SessionState.FOLLOW_UP_ROUND
        }
    });
    let nextQuestionData = null;
    if (!updated.isTerminated) {
        const refreshedSession = await prisma_1.prisma.session.findUnique({
            where: { id },
            include: { questions: true }
        });
        if (refreshedSession) {
            const round = getRound(refreshedSession.questions.length);
            const qText = await (0, aiInterviewService_1.generateQuestion)(refreshedSession.role, round, refreshedSession.currentDifficulty, "adaptive interview", refreshedSession.questions.map((q) => q.prompt), refreshedSession.questions.length);
            nextQuestionData = await prisma_1.prisma.question.create({
                data: {
                    sessionId: id,
                    prompt: qText,
                    category: round.includes("TECH") ? "Technical" : round.includes("BEHAV") ? "Behavioral" : "Scenario",
                    difficulty: refreshedSession.currentDifficulty,
                    round,
                    orderIndex: refreshedSession.questions.length + 1
                }
            });
            await prisma_1.prisma.session.update({ where: { id }, data: { state: round } });
        }
    }
    res.json({
        answer,
        session: updated,
        breakdown: scored.breakdown,
        qualitySignals: signals,
        nextQuestion: nextQuestionData
    });
};
exports.submitAnswer = submitAnswer;
const terminateInterview = async (req, res) => {
    const { id } = req.params;
    const { reason = "Manual termination" } = req.body;
    const session = await prisma_1.prisma.session.update({
        where: { id },
        data: { isTerminated: true, terminationReason: reason, state: client_1.SessionState.TERMINATED }
    });
    res.json(session);
};
exports.terminateInterview = terminateInterview;
const getReport = async (req, res) => {
    const { id } = req.params;
    const session = await prisma_1.prisma.session.findUnique({ where: { id }, include: { answers: true, questions: true, report: true } });
    if (!session)
        return void res.status(404).json({ error: "Session not found" });
    if (!session.report) {
        const score = session.readinessScore;
        const category = (0, scoringEngine_1.categoryFromScore)(score);
        const strengths = score > 70 ? ["Technical articulation", "Consistency"] : ["Persistence"];
        const weaknesses = score < 60 ? ["Depth", "Time efficiency"] : ["Advanced optimization"];
        const recommendations = ["Practice concise STAR responses", "Increase timed mock sessions", "Deepen system design examples"];
        await prisma_1.prisma.report.create({
            data: {
                sessionId: id,
                summary: `Interview completed with ${score.toFixed(1)} readiness score.`,
                strengths,
                weaknesses,
                recommendations,
                category,
                scoreBreakdown: {
                    average: score,
                    questionScores: session.answers.map((a) => a.score),
                    timings: session.answers.map((a) => a.latencySeconds)
                }
            }
        });
    }
    const report = await prisma_1.prisma.report.findUnique({ where: { sessionId: id } });
    res.json({ session, report });
};
exports.getReport = getReport;
