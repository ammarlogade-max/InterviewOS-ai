"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryFromScore = exports.computeScore = void 0;
const clamp = (n) => Math.max(0, Math.min(100, n));
const computeScore = (input) => {
    const timeEfficiency = clamp(100 - input.latencySeconds * 2);
    const weighted = input.accuracy * 0.25 +
        input.clarity * 0.15 +
        input.relevance * 0.2 +
        input.depth * 0.2 +
        input.confidence * 0.1 +
        timeEfficiency * 0.1;
    return {
        total: clamp(weighted),
        breakdown: { ...input, timeEfficiency }
    };
};
exports.computeScore = computeScore;
const categoryFromScore = (score) => {
    if (score >= 85)
        return "Strong Hire";
    if (score >= 70)
        return "Hire";
    if (score >= 50)
        return "Average";
    return "Needs Improvement";
};
exports.categoryFromScore = categoryFromScore;
