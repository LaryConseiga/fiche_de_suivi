import { useState } from "react";
import { api } from "@/services/api";
import { useSensorStore } from "@/store/sensorStore";
import { useSensorData } from "@/hooks/useSensorData";
import { TemperatureChart } from "@/components/charts/TemperatureChart";
import { PressureChart } from "@/components/charts/PressureChart";

const PRESETS = [
  { label: "1h",  hours: 1 },
  { label: "4h",  hours: 4 },
  { label: "8h",  hours: 8 },
  { label: "24h", hours: 24 },
];

export function History() {
  const [hours, setHours] = useState(8);
  const [from, setFrom] = useState("");
  const [to, setTo]     = useState("");
  const history    = useSensorStore((s) => s.history);
  const setHistory = useSensorStore((s) => s.setHistory);

  useSensorData(hours);

  const loadRange = async () => {
    if (!from || !to) return;
    const data = await api.getHistoryRange(from.replace("T", " "), to.replace("T", " "));
    setHistory(data);
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div>
        <h2 className="text-base font-bold text-primary-800 mb-1">Historique des mesures</h2>
        <p className="text-xs text-gray-400">{history.length} points affichés</p>
      </div>

      {/* Filtres */}
      <div className="bg-panel rounded-2xl shadow-card p-4 flex flex-col gap-3">
        {/* Période rapide */}
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.hours}
              onClick={() => { setHours(p.hours); setFrom(""); setTo(""); }}
              className={[
                "px-4 py-1.5 rounded-full text-xs font-semibold border transition",
                hours === p.hours && !from
                  ? "bg-primary-500 text-white border-primary-500"
                  : "bg-white text-primary-600 border-primary-300 hover:border-primary-500",
              ].join(" ")}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Plage personnalisée — empilée sur mobile */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            type="datetime-local"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-gray-300 rounded-lg text-xs px-3 py-2 flex-1"
          />
          <span className="text-xs text-gray-400 text-center">→</span>
          <input
            type="datetime-local"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-gray-300 rounded-lg text-xs px-3 py-2 flex-1"
          />
          <button
            onClick={loadRange}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg text-xs font-semibold hover:bg-primary-600 transition"
          >
            Charger
          </button>
        </div>
      </div>

      {/* Courbes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TemperatureChart data={history} />
        <PressureChart data={history} />
      </div>
    </div>
  );
}
