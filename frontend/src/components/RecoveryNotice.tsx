import { motion } from "framer-motion";
import { Save, ShieldCheck, RefreshCcw } from "lucide-react";

type Props = {
  autoSaved?: boolean;
  reconnecting?: boolean;
  recovered?: boolean;
};

export default function RecoveryNotice({
  autoSaved = true,
  reconnecting = false,
  recovered = false
}: Props) {
  const state = reconnecting
    ? {
        icon: RefreshCcw,
        title: "Reconnecting Interview Session",
        description: "Attempting to safely restore live recruiter evaluation state.",
        tone: "border-yellow-500/30 bg-yellow-500/10 text-yellow-100"
      }
    : recovered
      ? {
          icon: ShieldCheck,
          title: "Interview Session Restored",
          description: "Previous interview context and adaptive progress were recovered successfully.",
          tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
        }
      : {
          icon: Save,
          title: "AutoSave Protection Active",
          description: "Responses are continuously protected to reduce accidental interview loss.",
          tone: "border-cyan-500/30 bg-cyan-500/10 text-cyan-100"
        };

  const Icon = state.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border px-4 py-3 ${state.tone}`}
    >
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5" />

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
  );
}
