"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.answerSchema = exports.createSessionSchema = void 0;
const zod_1 = require("zod");
exports.createSessionSchema = zod_1.z.object({
    candidateName: zod_1.z.string().min(1).optional(),
    role: zod_1.z.string().min(2),
    resumeText: zod_1.z.string().min(20).optional(),
    jdText: zod_1.z.string().min(20).optional()
});
exports.answerSchema = zod_1.z.object({
    questionId: zod_1.z.string().uuid(),
    answer: zod_1.z.string().min(1),
    latencySeconds: zod_1.z.number().int().min(0),
    timedOut: zod_1.z.boolean().default(false)
});
