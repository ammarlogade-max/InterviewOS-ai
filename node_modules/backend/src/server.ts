import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sessionRoutes from "./routes/sessionRoutes";
import { errorMiddleware } from "./middleware/errorMiddleware";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "InterviewOS backend" }));
app.use("/api", sessionRoutes);
app.use(errorMiddleware);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`InterviewOS backend running on ${port}`));
