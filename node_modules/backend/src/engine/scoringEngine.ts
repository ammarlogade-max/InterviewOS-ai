export type ScoreInput = {
  accuracy: number;
  clarity: number;
  relevance: number;
  depth: number;
  confidence: number;
  latencySeconds: number;
};

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export const computeScore = (input: ScoreInput) => {
  const timeEfficiency = clamp(100 - input.latencySeconds * 2);
  const weighted =
    input.accuracy * 0.25 +
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

export const categoryFromScore = (score: number) => {
  if (score >= 85) return "Strong Hire";
  if (score >= 70) return "Hire";
  if (score >= 50) return "Average";
  return "Needs Improvement";
};
