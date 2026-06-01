import { motion } from "framer-motion";
import { ShieldAlert, TimerReset, BrainCircuit } from "lucide-react";

type Props = {
  danger: boolean;
  weakSignals?: number;
};

export default function InterviewCoach({ danger, weakSignals = 0 }: Props) {
  const guidance = danger
    ? {
        icon: TimerReset,
        title: "High Pressure Window",
        description: "Prioritize concise structured reasoning before the timer expires.",
        tone: "border-red-500/30 bg-red-500/10 text-red-100"
      }
    : weakSignals > 0
      ? {
          icon: ShieldAlert,
          title: "Contextual Relevance Warning",
          description: "AI evaluation detected lower contextual alignment. Focus on directly answering the question.",
          tone: "border-yellow-500/30 bg-yellow-500/10 text-yellow-100"
        }
      : {
          icon: BrainCircuit,
          title: "Recruiter Evaluation Active",
          description: "The interviewer is evaluating clarity, reasoning depth, optimization thinking, and communication structure.",
          tone: "border-cyan-500/30 bg-cyan-500/10 text-cyan-100"
        };

  const Icon = guidance.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border px-4 py-3 ${guidance.tone}`}
    >
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5" />

        <div>
          <p className="text-sm font-semibold tracking-wide">
            {guidance.title}
          </p>

          <p className="mt-1 text-xs opacity-90 leading-relaxed">
            {guidance.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
