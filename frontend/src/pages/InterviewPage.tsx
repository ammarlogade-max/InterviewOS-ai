import { useCallback, useMemo, useState } from "react";
import { api } from "../services/api";
import { useCountdown } from "../hooks/useCountdown";
import type { Question, Session } from "../types/interview";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AdaptiveInsight from "../components/AdaptiveInsight";
import {
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  Loader2,
  Brain,
  Gauge,
  Target,
  Sparkles,
  CheckCircle2
} from "lucide-react";

const labelByDifficulty: Record<string, string> = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };
const stageByRound: Record<string, string> = {
  TECHNICAL_ROUND: "Technical Round",
  BEHAVIORAL_ROUND: "Behavioral Round",
  FOLLOW_UP_ROUND: "Follow-Up Round"
};

const TOTAL_QUESTIONS_GUIDE = 8;

type TimelineItem = {
  q: number;
  category: string;
  difficulty: string;
  score?: number;
};

export default function InterviewPage() {
  const [role, setRole] = useState("Frontend Engineer");
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [resumeSource, setResumeSource] = useState<"paste" | "pdf">("paste");
  const [startingInterview, setStartingInterview] = useState(false);

  const submit = useCallback(async (timedOut = false) => {
    if (!session || !question || submitLoading) return;
    try {
      setSubmitLoading(true);
      setError(null);
      const latencySeconds = 45 - left;
      const payload = {
        questionId: question.id,
        answer: timedOut ? "[timeout]" : answer || "[empty]",
        latencySeconds,
        timedOut
      };
      const res = await api.post(`/sessions/${session.id}/answer`, payload);
      const nextSession: Session = res.data.session;
      setSession(nextSession);
      setAnswer("");

      setTimeline((prev) => [
        ...prev,
        {
          q: question.orderIndex,
          category: question.category,
          difficulty: question.difficulty,
          score: typeof res.data.answer?.score === "number" ? Math.round(res.data.answer.score) : undefined
        }
      ]);

      if (!nextSession.isTerminated) {
        if (res.data.nextQuestion) {
          setQuestion(res.data.nextQuestion);
        } else {
          const q = await api.post(`/sessions/${session.id}/next-question`);
          setQuestion(q.data);
        }
      } else {
        setQuestion(null);
      }
    } catch {
      setError("Unable to submit response. Please retry.");
    } finally {
      setSubmitLoading(false);
    }
  }, [answer, question, session, submitLoading]);

  const onTimeout = useCallback(() => {
    if (!session || !question) return;
    void submit(true);
  }, [session, question, submit]);

  const left = useCountdown(45, Boolean(question), onTimeout);

  const start = async () => {
    try {
      setLoading(true);
      setStartingInterview(true);
      setError(null);
      setTimeline([]);
      const created = await api.post("/sessions", { role });
      setSession(created.data);
      localStorage.setItem("latestSessionId", created.data.id);
      await api.post(`/sessions/${created.data.id}/analyze`, { resumeText, jdText });
      const q = await api.post(`/sessions/${created.data.id}/next-question`);
      setQuestion(q.data);
    } catch {
      setError("Failed to start interview. Check backend and retry.");
    } finally {
      setLoading(false);
      setStartingInterview(false);
    }
  };

  const handleResumePdfUpload = async (file: File | null) => {
    if (!file) return;
    setPdfError(null);
    setPdfLoading(true);
    try {
      const form = new FormData();
      form.append("resume", file);
      const res = await api.post("/resume/parse-pdf", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const extracted = String(res.data.extractedText || "");
      setResumeText(extracted);
      setResumeSource("pdf");
    } catch (err: any) {
      setPdfError(err?.response?.data?.error || "Failed to parse PDF. Please paste resume text.");
      setResumeSource("paste");
    } finally {
      setPdfLoading(false);
    }
  };

  const danger = useMemo(() => left <= 10, [left]);
  const timerPercent = Math.max(0, (left / 45) * 100);
  const step = session ? 2 : 1;

  const questionNumber = question?.orderIndex || timeline.length + 1;
  const progress = Math.min(100, (questionNumber / TOTAL_QUESTIONS_GUIDE) * 100);
  const stageLabel = question ? stageByRound[question.round] || "Interview Round" : "Interview Summary";
  const readiness = session?.readinessScore || 0;

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-6xl mx-auto relative overflow-hidden">
      <div className="hero-orb one" />
      <div className="hero-orb two" />

      <div className="relative z-10 flex flex-wrap justify-between items-start gap-3 mb-6">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[#46a6ff]">HireMind AI</p>
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight">Adaptive Interview Intelligence Platform</h1>
          <p className="text-slate-300 mt-2">Guided, structured interview simulation with live adaptation and readiness scoring.</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="glass rounded-full px-3 py-1">Adaptive AI</span>
            <span className="glass rounded-full px-3 py-1">Real-Time Evaluation</span>
            <span className="glass rounded-full px-3 py-1">Dynamic Difficulty</span>
          </div>
        </div>
        {session && <Link to={`/dashboard/${session.id}`} className="text-[#2df7c4] mt-2">Go to Dashboard</Link>}
      </div>

      <div className="relative z-10 glass rounded-2xl p-4 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-200"><span className="ai-dot" /> AI Interviewer Online</div>
        <p className="text-sm text-slate-300">Step {step} of 2 {step === 1 ? "-> Candidate Analysis" : "-> Adaptive Interview"}</p>
      </div>

      {error && <div className="glass border border-red-500/40 rounded-xl p-3 mb-4 text-red-200 relative z-10">{error}</div>}

      {!session && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass p-5 md:p-6 rounded-2xl space-y-4 relative z-10">
          <label className="text-sm text-slate-300 flex items-center gap-2"><BriefcaseBusiness size={16} /> Target Role</label>
          <input className="input-glass" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Frontend Engineer" />

          <label className="text-sm text-slate-300 flex items-center gap-2"><FileText size={16} /> Resume Context</label>
          <div className="glass rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-2">Upload Resume PDF (optional)</p>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => void handleResumePdfUpload(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-300"
            />
            {pdfLoading && <p className="text-xs text-[#7ef7dc] mt-2">Parsing PDF and extracting text...</p>}
            {pdfError && <p className="text-xs text-red-300 mt-2">{pdfError}</p>}
            {!pdfLoading && !pdfError && resumeSource === "pdf" && resumeText && (
              <p className="text-xs text-[#7ef7dc] mt-2">Resume text extracted successfully. Review/edit below before starting.</p>
            )}
          </div>
          <textarea className="input-glass" rows={4} value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste resume content for AI analysis" />

          <label className="text-sm text-slate-300 flex items-center gap-2"><ClipboardList size={16} /> Target Job Description</label>
          <textarea className="input-glass" rows={4} value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste JD text to calibrate interview" />

          <button disabled={loading || pdfLoading} onClick={start} className="cta-button inline-flex items-center gap-2">{loading ? <><Loader2 size={16} className="animate-spin" /> Initializing...</> : pdfLoading ? "Parsing Resume PDF..." : "Start Adaptive Interview ->"}</button>
        </motion.div>
      )}

      {session && question && (
        <div className="relative z-10 grid lg:grid-cols-[1fr_300px] gap-4">
          <div className="space-y-4">
            <AdaptiveInsight
              difficulty={session.currentDifficulty}
              weakSignals={session.weakAnswerCount || 0}
              timeouts={session.timeoutCount || 0}
            />

            <div className="glass rounded-2xl p-4 md:p-5">
              <div className="flex flex-wrap justify-between items-center gap-2 text-sm">
                <span className="text-slate-200">Question {questionNumber} of {TOTAL_QUESTIONS_GUIDE}</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full bg-[#0d1f38] text-[#7fc7ff]">{question.category}</span>
                  <span className="px-2 py-1 rounded-full bg-[#10291f] text-[#7ef7dc]">{labelByDifficulty[session.currentDifficulty]}</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#46a6ff] to-[#2df7c4]" style={{ width: `${progress}%`, transition: "width 500ms ease" }} />
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>Interview Progress</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-3 gap-2 text-sm">
                <div className="glass rounded-xl px-3 py-2 flex items-center gap-2"><Target size={14} className="text-[#46a6ff]" /> Stage: {stageLabel}</div>
                <div className="glass rounded-xl px-3 py-2 flex items-center gap-2"><Gauge size={14} className="text-[#2df7c4]" /> Live Readiness: {readiness.toFixed(1)}</div>
                <div className="glass rounded-xl px-3 py-2 flex items-center gap-2"><Brain size={14} className="text-[#b7c9ff]" /> AI Adaptation: Active</div>
              </div>

              <p className="mt-5 text-lg md:text-2xl leading-relaxed">{question.prompt}</p>

              <div className="mt-4">
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full ${danger ? "bg-red-400" : "bg-[#2df7c4]"}`} style={{ width: `${timerPercent}%`, transition: "width 1s linear" }} />
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <p className={`text-sm ${danger ? "text-red-300" : "text-slate-300"}`}>{left}s remaining</p>
                  <p className="text-xs text-slate-400">{Math.max(0, TOTAL_QUESTIONS_GUIDE - questionNumber)} questions remaining</p>
                </div>
              </div>
            </div>

            <textarea className="input-glass" rows={7} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Respond with structured technical clarity..." />

            <div className="flex flex-wrap gap-3">
              <button disabled={submitLoading} onClick={() => submit(false)} className="cta-button inline-flex items-center gap-2">
                {submitLoading ? <><Loader2 size={16} className="animate-spin" /> AI Evaluating...</> : <><Sparkles size={16} /> Submit Answer</>}
              </button>
              <button disabled={submitLoading} onClick={() => submit(true)} className="px-5 py-2 border border-slate-600 rounded-lg">Force Timeout Submit</button>
            </div>
          </div>

          <aside className="glass rounded-2xl p-4 h-fit">
            <h3 className="font-semibold mb-3">Interview Timeline</h3>
            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {timeline.length === 0 && <p className="text-sm text-slate-400">No completed questions yet.</p>}
              {timeline.map((item, idx) => (
                <div key={`${item.q}-${idx}`} className="rounded-xl bg-[#0c1427] px-3 py-3 border border-white/5">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Q{item.q}</span>
                    <span>{item.difficulty}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-200">{item.category}</p>
                  {typeof item.score === "number" && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-[#7ef7dc]">
                      <CheckCircle2 size={12} /> Score: {item.score}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
