import { Request, Response } from "express";
import { Difficulty, SessionState } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { createSessionSchema, answerSchema } from "../validators/sessionValidators";
import { generateQuestion, evaluateAnswerHeuristically } from "../services/aiInterviewService";
import { computeScore, categoryFromScore } from "../engine/scoringEngine";
import { nextDifficulty, shouldTerminate } from "../engine/adaptiveEngine";
import { applyQualityPenalties, evaluateQualitySignals } from "../engine/answerQualityEngine";
import { getSessionContext, setSessionContext } from "../services/sessionContextStore";

const getRound = (count: number) => {
  if (count < 3) return "TECHNICAL_ROUND";
  if (count < 5) return "BEHAVIORAL_ROUND";
  return "FOLLOW_UP_ROUND";
};

export const createSession = async (req: Request, res: Response) => {
  const payload = createSessionSchema.parse(req.body);
  const session = await prisma.session.create({
    data: {
      candidateName: payload.candidateName,
      role: payload.role,
      state: SessionState.INTRODUCTION,
      currentDifficulty: Difficulty.MEDIUM
    }
  });
  res.status(201).json(session);
};

export const analyzeSession = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { resumeText = "", jdText = "" } = req.body;
  const skills = [...new Set((resumeText + " " + jdText).match(/[A-Za-z+#.]{3,}/g)?.slice(0, 15) || [])];
  const matchPercentage = Math.min(100, Math.round((resumeText.length / Math.max(jdText.length, 1)) * 100));

  const session = await prisma.session.update({
    where: { id },
    data: { state: SessionState.JD_ANALYSIS }
  });
  setSessionContext(id, resumeText, jdText);

  res.json({
    session,
    profile: {
      extractedSkills: skills,
      roleAlignment: matchPercentage,
      summary: "AI-assisted profile extraction complete."
    }
  });
};

export const nextQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;
  const session = await prisma.session.findUnique({ where: { id }, include: { questions: true, answers: true } });
  if (!session) return void res.status(404).json({ error: "Session not found" });
  if (session.isTerminated) return void res.status(400).json({ error: "Session terminated" });

  const round = getRound(session.questions.length);
  const qText = await generateQuestion(
    session.role,
    round,
    session.currentDifficulty,
    "adaptive interview",
    session.questions.map((q) => q.prompt),
    session.questions.length
  );

  const q = await prisma.question.create({
    data: {
      sessionId: id,
      prompt: qText,
      category: round.includes("TECH") ? "Technical" : round.includes("BEHAV") ? "Behavioral" : "Scenario",
      difficulty: session.currentDifficulty,
      round,
      orderIndex: session.questions.length + 1
    }
  });

  await prisma.session.update({ where: { id }, data: { state: round as SessionState } });
  res.json(q);
};

export const submitAnswer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = answerSchema.parse(req.body);

  const question = await prisma.question.findUnique({ where: { id: payload.questionId } });
  if (!question || question.sessionId !== id) return void res.status(404).json({ error: "Question not found" });

  const previousAnswers = await prisma.answer.findMany({
    where: { sessionId: id },
    orderBy: { createdAt: "asc" }
  });
  const context = getSessionContext(id);

  const metrics = await evaluateAnswerHeuristically(question.prompt, payload.answer);
  const signals = evaluateQualitySignals({
    question: question.prompt,
    answer: payload.answer,
    previousAnswers: previousAnswers.map((a) => a.content),
    resumeText: context.resumeText,
    jdText: context.jdText
  });
  const qualityAdjusted = applyQualityPenalties({
    accuracy: Number(metrics.accuracy) || 50,
    clarity: Number(metrics.clarity) || 50,
    relevance: Number(metrics.relevance) || 50,
    depth: Number(metrics.depth) || 50,
    confidence: Number(metrics.confidence) || 50,
    feedback: metrics.feedback
  }, signals);

  const scored = computeScore({
    accuracy: qualityAdjusted.adjusted.accuracy,
    clarity: qualityAdjusted.adjusted.clarity,
    relevance: qualityAdjusted.adjusted.relevance,
    depth: qualityAdjusted.adjusted.depth,
    confidence: qualityAdjusted.adjusted.confidence,
    latencySeconds: payload.latencySeconds
  });

  const answer = await prisma.answer.create({
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

  const allAnswers = await prisma.answer.findMany({ where: { sessionId: id } });
  const avg = allAnswers.reduce((s: number, a: { score: number }) => s + a.score, 0) / allAnswers.length;
  const weakAnswerCount = allAnswers.filter((a: { score: number }) => a.score < 40).length;
  const timeoutCount = allAnswers.filter((a: { timedOut: boolean }) => a.timedOut).length;
  const difficulty = nextDifficulty(avg, (question.difficulty as unknown as "EASY"|"MEDIUM"|"HARD"));
  const terminateReason = shouldTerminate(weakAnswerCount, timeoutCount, scored.total);

  const updated = await prisma.session.update({
    where: { id },
    data: {
      readinessScore: avg,
      weakAnswerCount,
      timeoutCount,
      currentDifficulty: difficulty as Difficulty,
      isTerminated: Boolean(terminateReason),
      terminationReason: terminateReason || null,
      state: terminateReason ? SessionState.TERMINATED : SessionState.FOLLOW_UP_ROUND
    }
  });

  let nextQuestionData = null;
  if (!updated.isTerminated) {
    const refreshedSession = await prisma.session.findUnique({
      where: { id },
      include: { questions: true }
    });
    if (refreshedSession) {
      const round = getRound(refreshedSession.questions.length);
      const qText = await generateQuestion(
        refreshedSession.role,
        round,
        refreshedSession.currentDifficulty,
        "adaptive interview",
        refreshedSession.questions.map((q) => q.prompt),
        refreshedSession.questions.length
      );

      nextQuestionData = await prisma.question.create({
        data: {
          sessionId: id,
          prompt: qText,
          category: round.includes("TECH") ? "Technical" : round.includes("BEHAV") ? "Behavioral" : "Scenario",
          difficulty: refreshedSession.currentDifficulty,
          round,
          orderIndex: refreshedSession.questions.length + 1
        }
      });

      await prisma.session.update({ where: { id }, data: { state: round as SessionState } });
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

export const terminateInterview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason = "Manual termination" } = req.body;
  const session = await prisma.session.update({
    where: { id },
    data: { isTerminated: true, terminationReason: reason, state: SessionState.TERMINATED }
  });
  res.json(session);
};

export const getReport = async (req: Request, res: Response) => {
  const { id } = req.params;
  const session = await prisma.session.findUnique({ where: { id }, include: { answers: true, questions: true, report: true } });
  if (!session) return void res.status(404).json({ error: "Session not found" });

  if (!session.report) {
    const score = session.readinessScore;
    const category = categoryFromScore(score);
    const strengths = score > 70 ? ["Technical articulation", "Consistency"] : ["Persistence"];
    const weaknesses = score < 60 ? ["Depth", "Time efficiency"] : ["Advanced optimization"];
    const recommendations = ["Practice concise STAR responses", "Increase timed mock sessions", "Deepen system design examples"];

    await prisma.report.create({
      data: {
        sessionId: id,
        summary: `Interview completed with ${score.toFixed(1)} readiness score.`,
        strengths,
        weaknesses,
        recommendations,
        category,
        scoreBreakdown: {
          average: score,
          questionScores: session.answers.map((a: { score: number }) => a.score),
          timings: session.answers.map((a: { latencySeconds: number }) => a.latencySeconds)
        }
      }
    });
  }

  const report = await prisma.report.findUnique({ where: { sessionId: id } });
  res.json({ session, report });
};

