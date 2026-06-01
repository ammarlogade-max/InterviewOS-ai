"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyQualityPenalties = exports.evaluateQualitySignals = void 0;
const clamp = (n) => Math.max(0, Math.min(100, n));
const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9\s+#.]/g, " ").replace(/\s+/g, " ").trim();
const tokens = (text) => normalize(text).split(" ").filter((t) => t.length > 2);
const tokenSet = (text) => new Set(tokens(text));
const jaccard = (a, b) => {
    const as = tokenSet(a);
    const bs = tokenSet(b);
    if (!as.size || !bs.size)
        return 0;
    let inter = 0;
    as.forEach((x) => {
        if (bs.has(x))
            inter += 1;
    });
    const union = as.size + bs.size - inter;
    return union ? inter / union : 0;
};
const overlapRatio = (shortText, longText) => {
    const s = tokenSet(shortText);
    const l = tokenSet(longText);
    if (!s.size || !l.size)
        return 0;
    let inter = 0;
    s.forEach((x) => {
        if (l.has(x))
            inter += 1;
    });
    return inter / s.size;
};
const fluffPhrases = [
    "as an ai language model",
    "in today's world",
    "it depends",
    "best practices are important",
    "this is very crucial",
    "i am passionate",
    "hardworking and dedicated"
];
const fluffScore = (answer) => {
    const n = normalize(answer);
    let score = 0;
    for (const p of fluffPhrases) {
        if (n.includes(p))
            score += 18;
    }
    const words = n.split(" ").filter(Boolean).length;
    if (words < 10)
        score += 20;
    return clamp(score);
};
const hasLikelyResumePattern = (answer) => {
    const n = normalize(answer);
    return /experience|education|skills|projects|certifications|linkedin|gmail|phone/.test(n);
};
const hasLikelyJdPattern = (answer) => {
    const n = normalize(answer);
    return /responsibilities|requirements|qualifications|job description|preferred|must have/.test(n);
};
const intentValidity = (question, answer) => {
    const q = normalize(question);
    const a = normalize(answer);
    const qIsBehavioral = /describe|tell me about|situation|conflict|team|leadership|challenge/.test(q);
    const qIsTechnical = /optimiz|algorithm|complexity|react|node|database|design|debug|api|system/.test(q);
    if (qIsBehavioral) {
        if (/(i|we)\s/.test(a) && /because|result|learned|improved|handled/.test(a))
            return 90;
        return 35;
    }
    if (qIsTechnical) {
        if (/because|tradeoff|complexity|cache|latency|state|render|query|index|scal/.test(a))
            return 88;
        return 40;
    }
    return 65;
};
const isDuplicateAnswer = (answer, previousAnswers) => {
    for (const prev of previousAnswers) {
        if (jaccard(answer, prev) > 0.82)
            return true;
    }
    return false;
};
const evaluateQualitySignals = (input) => {
    const qRel = clamp(overlapRatio(input.question, input.answer) * 100);
    const resumeSim = input.resumeText ? clamp(jaccard(input.answer, input.resumeText) * 100) : 0;
    const jdSim = input.jdText ? clamp(jaccard(input.answer, input.jdText) * 100) : 0;
    const dup = isDuplicateAnswer(input.answer, input.previousAnswers);
    const fluff = fluffScore(input.answer);
    const intent = intentValidity(input.question, input.answer);
    const contextValidity = clamp((qRel * 0.7) + (intent * 0.3));
    const flags = [];
    if (qRel < 28)
        flags.push("Low question relevance");
    if (dup)
        flags.push("Duplicate/repeated answer");
    if (fluff > 45)
        flags.push("Generic filler/fluff");
    if (resumeSim > 45 || hasLikelyResumePattern(input.answer))
        flags.push("Looks like pasted resume content");
    if (jdSim > 45 || hasLikelyJdPattern(input.answer))
        flags.push("Looks like pasted JD content");
    if (intent < 45)
        flags.push("Weak intent alignment");
    return {
        questionRelevance: qRel,
        resumeSimilarity: resumeSim,
        jdSimilarity: jdSim,
        isDuplicate: dup,
        fluffScore: fluff,
        contextValidity,
        intentValidity: intent,
        flags
    };
};
exports.evaluateQualitySignals = evaluateQualitySignals;
const applyQualityPenalties = (metrics, signals) => {
    let accuracy = clamp(metrics.accuracy);
    let clarity = clamp(metrics.clarity);
    let relevance = clamp(metrics.relevance);
    let depth = clamp(metrics.depth);
    let confidence = clamp(metrics.confidence);
    if (signals.questionRelevance < 28) {
        relevance = Math.min(relevance, 20);
        depth = Math.max(10, depth - 22);
        accuracy = Math.max(10, accuracy - 24);
    }
    if (signals.isDuplicate) {
        relevance = Math.max(5, relevance - 28);
        clarity = Math.max(10, clarity - 15);
        confidence = Math.max(10, confidence - 12);
    }
    if (signals.fluffScore > 45) {
        depth = Math.max(8, depth - 25);
        clarity = Math.max(12, clarity - 12);
    }
    if (signals.resumeSimilarity > 45 || signals.jdSimilarity > 45) {
        relevance = Math.max(5, relevance - 35);
        accuracy = Math.max(8, accuracy - 20);
    }
    if (signals.intentValidity < 45) {
        relevance = Math.max(8, relevance - 18);
        depth = Math.max(8, depth - 12);
    }
    const feedbackChunks = [
        metrics.feedback || "Response evaluated.",
        signals.flags.length ? `Quality flags: ${signals.flags.join("; ")}.` : "Quality validation passed."
    ];
    return {
        adjusted: { accuracy, clarity, relevance, depth, confidence },
        feedback: feedbackChunks.join(" ")
    };
};
exports.applyQualityPenalties = applyQualityPenalties;
