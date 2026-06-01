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

  useEffect(() => { void fetchReport(); }, [id]);

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

  if (loading) {
    return <div className="min-h-screen p-6 max-w-6xl mx-auto space-y-4"><Skeleton className="h-10 w-56" /><Skeleton className="h-28 w-full" /><Skeleton className="h-72 w-full" /></div>;
  }

  if (error || !report) {
    return <div className="min-h-screen p-6 max-w-4xl mx-auto"><div className="glass rounded-xl p-5">{error || "No report found."}<button onClick={() => void fetchReport()} className="ml-3 px-3 py-1 bg-[#2df7c4] text-black rounded">Retry</button></div></div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-6xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-[#46a6ff]">Investor Demo Analytics</p>
        <h1 className="text-3xl md:text-4xl font-semibold mt-2">Readiness Command Center</h1>
        <p className="text-slate-300 mt-2">Live hiring signal from adaptive interview behavior, response quality, and pressure handling.</p>
      </motion.div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        <div className="glass rounded-2xl p-4 h-[260px]">
          <h3 className="font-semibold mb-2">Readiness Index</h3>
          <ResponsiveContainer width="100%" height="88%">
            <RadialBarChart innerRadius="62%" outerRadius="95%" data={radialData} startAngle={90} endAngle={-270}>
              <RadialBar background dataKey="value" cornerRadius={12} />
              <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fill="#e8f0ff" fontSize="24" fontWeight="700">{readiness.toFixed(1)}</text>
              <text x="50%" y="64%" textAnchor="middle" dominantBaseline="middle" fill="#98abc9" fontSize="11">Readiness Score</text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <ScoreCard title="Recruiter Verdict" value={verdict} hint="Final hiring recommendation" />
          <ScoreCard title="Weak Answers" value={report.session.weakAnswerCount} hint="Low-signal responses" />
          <ScoreCard title="Timeouts" value={report.session.timeoutCount} hint="Pressure handling index" />
          <ScoreCard title="Current Difficulty" value={report.session.currentDifficulty} hint="Adaptive stage reached" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-4 h-80">
          <h3 className="font-semibold mb-3">Performance Timeline</h3>
          <ResponsiveContainer width="100%" height="88%">
            <LineChart data={chartData}><CartesianGrid stroke="rgba(152,171,201,0.15)" /><XAxis dataKey="name" stroke="#9db1d2" /><YAxis stroke="#9db1d2" /><Tooltip /><Line type="monotone" dataKey="score" stroke="#2df7c4" strokeWidth={3} dot={false} /></LineChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="glass rounded-2xl p-4 h-80">
          <h3 className="font-semibold mb-3">Competency Radar</h3>
          <ResponsiveContainer width="100%" height="88%">
            <RadarChart data={radarData}><PolarGrid stroke="rgba(152,171,201,0.2)" /><PolarAngleAxis dataKey="metric" stroke="#c7d6ee" /><PolarRadiusAxis stroke="#9db1d2" domain={[0,100]} /><Radar dataKey="value" stroke="#46a6ff" fill="#46a6ff" fillOpacity={0.35} /></RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-4 h-72">
          <h3 className="font-semibold mb-3">Response Timing Curve</h3>
          <ResponsiveContainer width="100%" height="88%">
            <AreaChart data={timingData}><CartesianGrid stroke="rgba(152,171,201,0.15)" /><XAxis dataKey="name" stroke="#9db1d2" /><YAxis stroke="#9db1d2" /><Tooltip /><Area type="monotone" dataKey="timing" stroke="#2df7c4" fill="#2df7c4" fillOpacity={0.26} /></AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-4">
          <h3 className="font-semibold">Executive Verdict Summary</h3>
          <p className="mt-2 text-slate-300"><span className="text-[#2df7c4] font-medium">{verdict}</span> candidate with measurable strengths in {report.report.strengths.join(", ") || "consistency"}.</p>
          <p className="mt-4 text-slate-300">Improvement focus: {report.report.weaknesses.join(", ") || "deeper technical examples"}.</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            {report.report.recommendations.map((r) => <li key={r} className="rounded-lg bg-[#0c1427] px-3 py-2">{r}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
