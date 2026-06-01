import { motion } from "framer-motion";

type Props = {
  title: string;
  value: string | number;
  hint?: string;
};

export const ScoreCard = ({ title, value, hint }: Props) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} className="glass rounded-2xl p-4 md:p-5">
    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{title}</p>
    <p className="mt-2 text-2xl md:text-3xl font-semibold text-[#2df7c4]">{value}</p>
    {hint && <p className="mt-1 text-sm text-slate-300">{hint}</p>}
  </motion.div>
);
