import { useState } from "react";
import { Download } from "lucide-react";
import { api } from "@/services/api";

export function Reports() {
  const [hours, setHours] = useState(8);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleExport = () => {
    if (from && to) {
      api.exportCSV({ from: from.replace("T", " "), to: to.replace("T", " ") });
    } else {
      api.exportCSV({ hours });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-bold text-primary-800 mb-1">Rapports & Export</h2>
        <p className="text-xs text-gray-400">Téléchargez les données au format CSV</p>
      </div>

      <div className="bg-panel rounded-2xl shadow-card p-5 max-w-md">
        <h3 className="text-sm font-semibold text-primary-700 mb-4">Export CSV</h3>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              Période rapide
            </label>
            <div className="flex gap-2">
              {[1, 4, 8, 24].map((h) => (
                <button
                  key={h}
                  onClick={() => { setHours(h); setFrom(""); setTo(""); }}
                  className={[
                    "px-3 py-1.5 rounded-full text-xs font-semibold border transition",
                    hours === h && !from
                      ? "bg-primary-500 text-white border-primary-500"
                      : "bg-white text-primary-600 border-primary-300 hover:border-primary-500",
                  ].join(" ")}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              Plage personnalisée (optionnel)
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="datetime-local"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border border-gray-300 rounded-lg text-xs px-3 py-2 w-full"
              />
              <input
                type="datetime-local"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border border-gray-300 rounded-lg text-xs px-3 py-2 w-full"
              />
            </div>
          </div>

          <button
            onClick={handleExport}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm rounded-xl py-2.5 transition flex items-center justify-center gap-2"
          >
            <Download size={15} />
            <span>Télécharger CSV</span>
          </button>
        </div>
      </div>

    </div>
  );
}
