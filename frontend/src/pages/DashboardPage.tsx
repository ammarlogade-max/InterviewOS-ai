import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import { ScoreCard } from "../components/ScoreCard";
import { Skeleton } from "../components/Skeleton";
import { motion } from "framer-motion";
import {
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar
} from "recharts";
import { BrainCircuit, TrendingUp, ShieldCheck } from "lucide-react";

type ReportDto = {
  session: { readinessScore: number; weakAnswerCount: number; timeoutCount: number; currentDifficulty: string };
  report: {
    category: string;
    recommendations: string[];
    strengths: string[];
    weaknesses: string[];
    scoreBreakdown: { questionScores: number[]; timings: number[] };
  };
};

export default function DashboardPage() {
  const { id = "" } = useParams();
  const [report, setReport] = useState<ReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const r = await api.get(`/sessions/${id}/report`);
      setReport(r.data);
    } catch {
      setError("Unable to load analytics report. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReport();
  }, [id]);

  const chartData = useMemo(() => {
    const scores = report?.report.scoreBreakdown.questionScores || [];
    return scores.map((score, i) => ({ name: `Q${i + 1}`, score: Math.round(score) }));
  }, [report]);

  const timingData = useMemo(() => {
    const t = report?.report.scoreBreakdown.timings || [];
    return t.map((v, i) => ({ name: `Q${i + 1}`, timing: v }));
  }, [report]);

  const radarData = useMemo(() => {
    const scores = report?.report.scoreBreakdown.questionScores || [];
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return [
      { metric: "Accuracy", value: avg },
      { metric: "Clarity", value: Math.min(100, avg + 6) },
      { metric: "Depth", value: Math.max(10, avg - 8) },
      { metric: "Relevance", value: Math.min(100, avg + 4) },
      { metric: "Pace", value: Math.max(10, 100 - (timingData.reduce((a, b) => a + b.timing, 0) / Math.max(1, timingData.length)) * 1.6) }
    ];
  }, [report, timingData]);

  const verdict = report?.report.category || "Pending";
  const readiness = report?.session.readinessScore || 0;
  const radialData = [{ name: "Readiness", value: readiness, fill: "#2df7c4" }];

  const difficultyFlow =
    report?.session.currentDifficulty === "HARD"
      ? "Easy → Medium → Hard"
      : report?.session.currentDifficulty === "MEDIUM"
        ? "Easy → Medium"
        : "Easy";

  if (loading) {
    return (
      <div className="min-h-screen p-6 max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen p-6 max-w-4xl mx-auto">
        <div className="glass rounded-xl p-5">
          {error || "No report found."}
          <button onClick={() => void fetchReport()} className="ml-3 px-3 py-1 bg-[#2df7c4] text-black rounded">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-6xl mx-auto space-y-5 relative overflow-hidden">
      <div className="hero-orb one" />
      <div className="hero-orb two" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5 md:p-6 relative z-10"
      >
        <p className="text-xs uppercase tracking-[0.18em] text-[#46a6ff]">
          AI Recruiter Intelligence
        </p>

        <div className="mt-3 flex flex-wrap justify-between gap-4 items-start">
          <div>
            <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
              Readiness Command Center
            </h1>

            <p className="text-slate-300 mt-3 max-w-2xl leading-relaxed">
              Adaptive recruiter intelligence powered by live interview evaluation,
              contextual scoring, timing analysis, and dynamic difficulty progression.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="glass rounded-full px-3 py-1">Adaptive AI</span>
              <span className="glass rounded-full px-3 py-1">Recruiter Signals</span>
              <span className="glass rounded-full px-3 py-1">Dynamic Scoring</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl px-5 py-4 min-w-[220px]"
          >
            <div className="flex items-center gap-2 text-[#2df7c4] text-sm font-medium">
              <ShieldCheck size={16} /> Recruiter Verdict
            </div>

            <p className="mt-3 text-3xl font-semibold">
              {verdict}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              AI hiring signal generated from adaptive interview performance.
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4 h-[290px]"
        >
          <div className="flex items-center gap-2 mb-2 text-[#2df7c4]">
            <BrainCircuit size={18} />
            <h3 className="font-semibold">Readiness Index</h3>
          </div>

          <ResponsiveContainer width="100%" height="88%">
            <RadialBarChart innerRadius="62%" outerRadius="95%" data={radialData} startAngle={90} endAngle={-270}>
              <RadialBar background dataKey="value" cornerRadius={14} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#ffffff" fontSize="32" fontWeight="700">
                {readiness.toFixed(1)}
              </text>
              <text x="50%" y="63%" textAnchor="middle" dominantBaseline="middle" fill="#98abc9" fontSize="12">
                Animated confidence index
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <ScoreCard title="Recruiter Verdict" value={verdict} hint="AI hiring signal" />
          <ScoreCard title="Weak Answers" value={report.session.weakAnswerCount} hint="Low contextual relevance" />
          <ScoreCard title="Timeouts" value={report.session.timeoutCount} hint="Pressure handling index" />
          <ScoreCard title="Difficulty Flow" value={report.session.currentDifficulty} hint={difficultyFlow} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-4 h-80"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Performance Timeline</h3>
            <div className="flex items-center gap-2 text-xs text-[#2df7c4]">
              <TrendingUp size={14} /> Adaptive Progression
            </div>
          </div>

          <ResponsiveContainer width="100%" height="88%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="rgba(152,171,201,0.15)" />
              <XAxis dataKey="name" stroke="#9db1d2" />
              <YAxis stroke="#9db1d2" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#2df7c4"
                strokeWidth={4}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-4 h-80"
        >
          <h3 className="font-semibold mb-3">Competency Radar</h3>

          <ResponsiveContainer width="100%" height="88%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(152,171,201,0.2)" />
              <PolarAngleAxis dataKey="metric" stroke="#c7d6ee" />
              <PolarRadiusAxis stroke="#9db1d2" domain={[0, 100]} />
              <Radar
                dataKey="value"
                stroke="#46a6ff"
                fill="#46a6ff"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 relative z-10">
        <div className="glass rounded-2xl p-4 h-72">
          <h3 className="font-semibold mb-3">Response Timing Curve</h3>

          <ResponsiveContainer width="100%" height="88%">
            <AreaChart data={timingData}>
              <CartesianGrid stroke="rgba(152,171,201,0.15)" />
              <XAxis dataKey="name" stroke="#9db1d2" />
              <YAxis stroke="#9db1d2" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="timing"
                stroke="#2df7c4"
                fill="#2df7c4"
                fillOpacity={0.26}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-xl">Executive Recruiter Verdict</h3>

          <p className="mt-3 text-slate-300 leading-relaxed">
            <span className="text-[#2df7c4] font-medium">{verdict}</span>
            {" "}
            candidate with measurable strengths in {report.report.strengths.join(", ") || "consistency"}.
          </p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-[#0c1427] p-4">
            <p className="text-sm text-slate-400">Improvement Focus</p>
            <p className="mt-2 text-slate-200">
              {report.report.weaknesses.join(", ") || "Advanced optimization and deeper technical articulation."}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {report.report.recommendations.map((r) => (
              <motion.div
                key={r}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl bg-[#0c1427] border border-white/5 px-4 py-3 text-sm text-slate-200"
              >
                {r}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
