"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseResumePdf = void 0;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const parseResumePdf = async (req, res) => {
    const file = req.file;
    if (!file) {
        return void res.status(400).json({ error: "No file uploaded. Please upload a PDF." });
    }
    if (file.mimetype !== "application/pdf") {
        return void res.status(400).json({ error: "Invalid file type. Only PDF files are supported." });
    }
    try {
        const parsed = await (0, pdf_parse_1.default)(file.buffer);
        const extractedText = (parsed.text || "").replace(/\s+/g, " ").trim();
        if (!extractedText || extractedText.length < 20) {
            return void res.status(400).json({
                error: "Could not extract meaningful text from this PDF. Please paste resume text manually."
            });
        }
        return void res.json({
            extractedText,
            preview: extractedText.slice(0, 1200)
        });
    }
    catch {
        return void res.status(400).json({
            error: "Failed to parse PDF. Please upload a text-based PDF or use paste-text fallback."
        });
    }
};
exports.parseResumePdf = parseResumePdf;
