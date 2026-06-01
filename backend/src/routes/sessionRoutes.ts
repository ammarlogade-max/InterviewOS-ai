import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../middleware/asyncHandler";
import { analyzeSession, createSession, getReport, nextQuestion, submitAnswer, terminateInterview } from "../controllers/sessionController";
import { parseResumePdf } from "../controllers/uploadController";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } });

router.post("/sessions", asyncHandler(createSession));
router.post("/resume/parse-pdf", upload.single("resume"), asyncHandler(parseResumePdf));
router.post("/sessions/:id/analyze", asyncHandler(analyzeSession));
router.post("/sessions/:id/next-question", asyncHandler(nextQuestion));
router.post("/sessions/:id/answer", asyncHandler(submitAnswer));
router.post("/sessions/:id/terminate", asyncHandler(terminateInterview));
router.get("/sessions/:id/report", asyncHandler(getReport));

export default router;
