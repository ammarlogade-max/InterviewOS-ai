import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Brain, Gauge, ShieldCheck, Sparkles, Rocket, ChartNoAxesCombined, Clock3, Target } from "lucide-react";

const features = [
  { icon: Brain, title: "Adaptive Interviews", text: "Difficulty changes in real time based on answer quality and pace." },
  { icon: Gauge, title: "Pressure Simulation", text: "Timer-driven stress conditions with realistic interview pacing." },
  { icon: ChartNoAxesCombined, title: "Readiness Analytics", text: "Recruiter-style scoring, strengths, weaknesses, and progression insights." },
  { icon: ShieldCheck, title: "Secure AI Architecture", text: "Groq API keys remain backend-only with production-grade boundaries." }
];

const stats = [
  { label: "Adaptive Rounds", value: "3" },
  { label: "Scoring Dimensions", value: "6" },
  { label: "Real-time Difficulty", value: "Yes" },
  { label: "Investor Demo Ready", value: "100%" }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen px-5 md:px-8 py-8 soft-grid">
      <nav className="max-w-6xl mx-auto flex items-center justify-between glass rounded-2xl px-4 py-3 md:px-6">
        <h1 className="text-xl md:text-2xl font-semibold">InterviewOS AI</h1>
        <Link to="/interview" className="rounded-xl bg-[#2df7c4] text-black px-4 py-2 text-sm font-semibold">Launch Interview</Link>
      </nav>

      <section className="max-w-6xl mx-auto mt-12 md:mt-16 grid lg:grid-cols-2 gap-8 items-center">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <p className="text-sm uppercase tracking-[0.22em] text-[#46a6ff]">Adaptive AI Interview Intelligence Platform</p>
          <h2 className="text-4xl md:text-6xl font-semibold leading-tight">Hire-ready performance, tested under real interview pressure.</h2>
          <p className="text-slate-300 text-base md:text-lg">A premium mock interview operating system that adapts by performance, evaluates with context, and delivers investor-grade readiness analytics.</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="glass rounded-full px-3 py-1">Adaptive AI</span>
            <span className="glass rounded-full px-3 py-1">Dynamic Difficulty</span>
            <span className="glass rounded-full px-3 py-1">Recruiter-grade Feedback</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/interview" className="rounded-xl bg-[#2df7c4] text-black px-5 py-3 font-semibold inline-flex items-center gap-2"><Rocket size={16} />Start Interview</Link>
            <a href="#features" className="rounded-xl border border-slate-600 px-5 py-3">Explore Platform</a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-6">
          <p className="text-sm text-slate-400">Live Product Story</p>
          <div className="mt-4 space-y-4 text-slate-200 text-sm">
            <div className="flex items-center gap-2"><Target size={16} className="text-[#46a6ff]" /> Resume + JD alignment to calibrate interview context</div>
            <div className="flex items-center gap-2"><Clock3 size={16} className="text-[#46a6ff]" /> Timed rounds for realistic pressure simulation</div>
            <div className="flex items-center gap-2"><Gauge size={16} className="text-[#46a6ff]" /> Difficulty auto-adjusts from answer quality</div>
            <div className="flex items-center gap-2"><Sparkles size={16} className="text-[#46a6ff]" /> Executive dashboard with final hiring readiness signal</div>
          </div>
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <p className="text-2xl font-semibold text-[#2df7c4]">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      <section id="features" className="max-w-6xl mx-auto mt-14 md:mt-20 grid sm:grid-cols-2 gap-4">
        {features.map((f) => (
          <motion.div key={f.title} whileHover={{ y: -3 }} className="glass rounded-2xl p-5">
            <f.icon className="text-[#2df7c4]" size={20} />
            <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-slate-300 text-sm">{f.text}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
