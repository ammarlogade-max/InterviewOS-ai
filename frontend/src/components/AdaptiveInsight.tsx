import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, AlertTriangle, TrendingUp } from "lucide-react";

type Props = {
  difficulty?: string;
  weakSignals?: number;
  timeouts?: number;
};

export default function AdaptiveInsight({
  difficulty = "MEDIUM",
  weakSignals = 0,
  timeouts = 0
}: Props) {
  const state = weakSignals > 0 || timeouts > 0
    ? {
        icon: AlertTriangle,
        title: "Adaptive Risk Detected",
        description: "AI detected weaker contextual performance. Difficulty stabilization active.",
        tone: "border-yellow-500/30 bg-yellow-500/10 text-yellow-100"
      }
    : difficulty === "HARD"
      ? {
          icon: TrendingUp,
          title: "Difficulty Increased",
          description: "Strong responses detected. AI interviewer upgraded challenge intensity.",
          tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
        }
      : {
          icon: BrainCircuit,
          title: "AI Evaluation Active",
          description: "Interview engine is dynamically adapting question difficulty and scoring.",
          tone: "border-cyan-500/30 bg-cyan-500/10 text-cyan-100"
        };

  const Icon = state.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${difficulty}-${weakSignals}-${timeouts}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35 }}
        className={`rounded-2xl border px-4 py-3 backdrop-blur-xl ${state.tone}`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Icon size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold tracking-wide">
              {state.title}
            </p>

            <p className="mt-1 text-xs opacity-90 leading-relaxed">
              {state.description}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
