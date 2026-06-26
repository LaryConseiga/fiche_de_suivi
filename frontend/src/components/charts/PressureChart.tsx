import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { Mesure } from "@/types";

interface Props {
  data: Mesure[];
}

function fmt(ts: string | undefined) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function PressureChart({ data }: Props) {
  const chartData = data.map((m) => ({ time: fmt(m.timestamp), P: m.pression }));

  return (
    <div className="bg-panel rounded-2xl shadow-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary-700">Pression circuit</h3>
        <span className="text-xs text-gray-400 font-mono">bar / 8h</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="presGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F5A623" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} width={34} unit=" b" />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8 }}
            formatter={(v: number) => [`${v?.toFixed(2)} bar`, "Pression"]}
          />
          <ReferenceLine y={3.5} stroke="#C62828" strokeDasharray="4 2" label={{ value: "3.5 bar seuil", fontSize: 9, fill: "#C62828" }} />
          <Area type="monotone" dataKey="P" stroke="#F5A623" strokeWidth={2} fill="url(#presGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
