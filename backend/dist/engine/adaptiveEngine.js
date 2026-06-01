"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldTerminate = exports.nextDifficulty = void 0;
const nextDifficulty = (avg, current) => {
    if (avg > 80)
        return current === "EASY" ? "MEDIUM" : "HARD";
    if (avg < 40)
        return current === "HARD" ? "MEDIUM" : "EASY";
    return current;
};
exports.nextDifficulty = nextDifficulty;
const shouldTerminate = (weakAnswerCount, timeoutCount, latestScore) => {
    if (weakAnswerCount >= 3)
        return "Too many weak answers";
    if (timeoutCount >= 2)
        return "Too many timeouts";
    if (latestScore < 20 && weakAnswerCount >= 2)
        return "Extremely poor performance trend";
    return null;
};
exports.shouldTerminate = shouldTerminate;
