/**
 * Encart de suivi du compteur de cycles des mâchoires depuis le dernier nettoyage.
 * Au-delà de 800 cycles, l'encrassement augmente le risque de microfuite.
 * Le bouton "Nettoyage effectué" appelle POST /api/nettoyage et remet le compteur à zéro.
 */
import { useState } from "react";
import { Wrench, CheckCircle } from "lucide-react";
import { api } from "@/services/api";
import { useSensorStore } from "@/store/sensorStore";

const SEUIL_NETTOYAGE = 800;

export function CyclePanel() {
  const cycles    = useSensorStore((s) => s.cycles);
  const setCycles = useSensorStore((s) => s.setCycles);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const besoinNettoyage = cycles > SEUIL_NETTOYAGE;
  const pct = Math.min((cycles / SEUIL_NETTOYAGE) * 100, 100);

  const handleNettoyage = async () => {
    setLoading(true);
    try {
      await api.nettoyage();
      setCycles(0);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      console.error("[CyclePanel] Erreur nettoyage:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={[
      "bg-panel rounded-2xl shadow-card p-4 border",
      besoinNettoyage ? "border-amber-300 bg-amber-50" : "border-primary-100",
    ].join(" ")}>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">

        {/* Icône + compteur */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={[
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            besoinNettoyage ? "bg-amber-100" : "bg-primary-100",
          ].join(" ")}>
            <Wrench size={18} className={besoinNettoyage ? "text-amber-600" : "text-primary-600"} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
              Mâchoires — cycles depuis nettoyage
            </p>
            <p className={[
              "text-2xl font-extrabold leading-tight",
              besoinNettoyage ? "text-amber-600" : "text-primary-700",
            ].join(" ")}>
              {cycles.toLocaleString("fr-FR")}
              <span className="text-xs font-normal text-gray-400 ml-1.5">
                / {SEUIL_NETTOYAGE} recommandé
              </span>
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="flex-1 min-w-[100px] max-w-[180px]">
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={[
                "h-full rounded-full transition-all duration-500",
                besoinNettoyage ? "bg-amber-400" : "bg-primary-500",
              ].join(" ")}
              style={{ width: `${pct}%` }}
            />
          </div>
          {besoinNettoyage && (
            <p className="text-[10px] text-amber-600 font-semibold mt-1">
              Nettoyage recommandé
            </p>
          )}
        </div>

        {/* Bouton / confirmation */}
        {success ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-700 bg-green-100 border border-primary-200 px-3 py-2 rounded-xl">
            <CheckCircle size={14} />
            Nettoyage enregistré
          </div>
        ) : (
          <button
            onClick={handleNettoyage}
            disabled={loading}
            className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shrink-0"
          >
            <Wrench size={13} />
            {loading ? "Enregistrement…" : "✓ Nettoyage effectué"}
          </button>
        )}
      </div>
    </div>
  );
}
