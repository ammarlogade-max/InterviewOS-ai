"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const sessionRoutes_1 = __importDefault(require("./routes/sessionRoutes"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express_1.default.json({ limit: "5mb" }));
app.get("/health", (_req, res) => res.json({ ok: true, service: "InterviewOS backend" }));
app.use("/api", sessionRoutes_1.default);
app.use(errorMiddleware_1.errorMiddleware);
const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`InterviewOS backend running on ${port}`));
