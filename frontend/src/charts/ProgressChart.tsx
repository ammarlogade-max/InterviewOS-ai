import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export const ProgressChart = ({ data }: { data: Array<{ name: string; score: number }> }) => (
  <div className="glass rounded-xl p-4 h-64">
    <h3 className="mb-3 font-semibold">Performance Timeline</h3>
    <ResponsiveContainer width="100%" height="90%">
      <LineChart data={data}>
        <XAxis dataKey="name" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip />
        <Line type="monotone" dataKey="score" stroke="#19d3a2" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
