export type RoundType = "TECHNICAL" | "BEHAVIORAL" | "FOLLOW_UP";

export const nextDifficulty = (avg: number, current: "EASY"|"MEDIUM"|"HARD") => {
  if (avg > 80) return current === "EASY" ? "MEDIUM" : "HARD";
  if (avg < 40) return current === "HARD" ? "MEDIUM" : "EASY";
  return current;
};

export const shouldTerminate = (weakAnswerCount: number, timeoutCount: number, latestScore: number) => {
  if (weakAnswerCount >= 3) return "Too many weak answers";
  if (timeoutCount >= 2) return "Too many timeouts";
  if (latestScore < 20 && weakAnswerCount >= 2) return "Extremely poor performance trend";
  return null;
};
