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

export function TemperatureChart({ data }: Props) {
  const chartData = data.map((m) => ({ time: fmt(m.timestamp), T: m.temperature }));

  return (
    <div className="bg-panel rounded-2xl shadow-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary-700">Température soudure</h3>
        <span className="text-xs text-gray-400 font-mono">°C / 8h</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2D7A3A" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#2D7A3A" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} width={34} unit="°" />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8 }}
            formatter={(v: number) => [`${v?.toFixed(1)} °C`, "Température"]}
          />
          <ReferenceLine y={120} stroke="#C62828" strokeDasharray="4 2" label={{ value: "120°C seuil", fontSize: 9, fill: "#C62828" }} />
          <Area type="monotone" dataKey="T" stroke="#2D7A3A" strokeWidth={2} fill="url(#tempGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
