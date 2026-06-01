export type Session = {
  id: string;
  role: string;
  state: string;
  currentDifficulty: "EASY" | "MEDIUM" | "HARD";
  readinessScore: number;
  isTerminated: boolean;
  terminationReason?: string;
  weakAnswerCount?: number;
  timeoutCount?: number;
};

export type Question = {
  id: string;
  prompt: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  round: string;
  orderIndex: number;
};