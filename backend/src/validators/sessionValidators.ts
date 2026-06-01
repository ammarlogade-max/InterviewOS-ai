import { z } from "zod";

export const createSessionSchema = z.object({
  candidateName: z.string().min(1).optional(),
  role: z.string().min(2),
  resumeText: z.string().min(20).optional(),
  jdText: z.string().min(20).optional()
});

export const answerSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.string().min(1),
  latencySeconds: z.number().int().min(0),
  timedOut: z.boolean().default(false)
});
