import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, BrainCircuit, Trophy } from "lucide-react";

type Props = {
  open: boolean;
  reason?: string;
  readiness?: number;
};

export default function TerminationSummaryModal({
  open,
  reason,
  readiness = 0
}: Props) {
  const strong = readiness >= 75;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#08111f] p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-2xl p-3 ${strong ? "bg-emerald-500/15 text-emerald-300" : "bg-yellow-500/15 text-yellow-300"}`}>
                {strong ? <Trophy size={24} /> : <ShieldAlert size={24} />}
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#46a6ff]">
                  AI Recruiter Intelligence
                </p>

                <h2 className="text-2xl font-semibold mt-1">
                  Interview Session Complete
                </h2>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/5 bg-[#0c1427] p-5">
              <div className="flex items-center gap-2 text-[#2df7c4] text-sm font-medium">
                <BrainCircuit size={16} /> Final Readiness Signal
              </div>

              <p className="mt-3 text-5xl font-bold text-white">
                {readiness.toFixed(1)}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Adaptive recruiter confidence index generated from interview performance patterns.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-white/5 bg-[#0c1427] p-4">
              <p className="text-sm text-slate-400">Termination Summary</p>

              <p className="mt-2 text-slate-200 leading-relaxed">
                {reason || "Interview cycle completed successfully with adaptive recruiter evaluation."}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span className="glass rounded-full px-3 py-1">Adaptive Difficulty</span>
              <span className="glass rounded-full px-3 py-1">Contextual Evaluation</span>
              <span className="glass rounded-full px-3 py-1">Recruiter Analytics</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
