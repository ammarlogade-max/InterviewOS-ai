import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Sparkles, ScanSearch } from "lucide-react";

type Props = {
  open: boolean;
};

const phases = [
  {
    icon: BrainCircuit,
    label: "Analyzing response vectors"
  },
  {
    icon: ScanSearch,
    label: "Evaluating contextual relevance"
  },
  {
    icon: Sparkles,
    label: "Generating adaptive follow-up"
  }
];

export default function AILoadingOverlay({ open }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-md flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#08111f] p-6 shadow-2xl"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-[#46a6ff]">
              HireMind AI Evaluation Engine
            </p>

            <h2 className="mt-3 text-3xl font-semibold text-white">
              Generating Recruiter Intelligence
            </h2>

            <p className="mt-3 text-slate-400 leading-relaxed">
              Adaptive AI is evaluating communication clarity, reasoning depth,
              contextual alignment, and technical confidence signals.
            </p>

            <div className="mt-6 space-y-3">
              {phases.map((phase, index) => {
                const Icon = phase.icon;

                return (
                  <motion.div
                    key={phase.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.25 }}
                    className="rounded-2xl border border-white/5 bg-[#0c1427] px-4 py-3 flex items-center gap-3"
                  >
                    <div className="rounded-xl bg-[#11203d] p-2 text-[#2df7c4]">
                      <Icon size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-white">
                        {phase.label}
                      </p>

                      <div className="mt-2 h-1.5 w-40 rounded-full bg-slate-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          className="h-full bg-gradient-to-r from-[#46a6ff] to-[#2df7c4]"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
