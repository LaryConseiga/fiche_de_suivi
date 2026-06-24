/**
 * Bouton de signalement manuel d'une fuite — outil responsable qualité.
 * Capture les 30 dernières mesures pour constituer un jeu de données d'entraînement
 * en vue d'un futur modèle prédictif de microfuites. Action irréversible.
 */
import { useState } from "react";
import { AlertOctagon, CheckCircle } from "lucide-react";
import { api } from "@/services/api";

export function FuiteButton() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    setConfirming(false);
    try {
      await api.fuiteSignalee();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 6000);
    } catch (e) {
      console.error("[FuiteButton] Erreur:", e);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex justify-end">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary-700 bg-green-50 border border-primary-200 px-3 py-2 rounded-xl">
          <CheckCircle size={13} />
          Fuite enregistrée — snapshot de 30 mesures sauvegardé
        </div>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="flex justify-end">
        <div className="flex items-center gap-2 bg-red-50 border border-danger-300 rounded-xl px-3 py-2 text-xs flex-wrap">
          <span className="text-danger-700 font-medium">Action irréversible. Confirmer le signalement ?</span>
          <button
            onClick={handleConfirm}
            className="bg-danger-500 hover:bg-danger-600 text-white font-semibold px-3 py-1 rounded-lg transition text-xs"
          >
            Confirmer
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-gray-500 hover:text-gray-700 font-medium px-2 py-1 text-xs"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <button
        onClick={() => setConfirming(true)}
        disabled={loading}
        className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition disabled:opacity-50"
      >
        <AlertOctagon size={12} />
        {loading ? "Enregistrement…" : "⚠ Signaler une fuite détectée"}
      </button>
    </div>
  );
}
