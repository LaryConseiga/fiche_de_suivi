import { XCircle, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react";
import type { Alerte } from "@/types";

const LEVEL_STYLE: Record<string, string> = {
  critique: "bg-red-100 text-danger-600 border-danger-300",
  alerte:   "bg-amber-50 text-amber-700 border-amber-300",
  resolue:  "bg-green-50 text-primary-600 border-primary-200",
};

const LEVEL_ICON = {
  critique: XCircle,
  alerte:   AlertTriangle,
  resolue:  CheckCircle,
};

// Badge SEUIL = franchissement instantané d'un seuil critique
// Badge DERIVE = tendance anormale détectée sur les dernières mesures
const TYPE_BADGE: Record<string, { label: string; style: string }> = {
  SEUIL:  { label: "Seuil",  style: "bg-red-200 text-danger-700" },
  DERIVE: { label: "Dérive", style: "bg-amber-200 text-amber-800" },
};

interface Props {
  alerte: Alerte;
  onResolve?: (id: number) => void;
}

export function AlertBadge({ alerte, onResolve }: Props) {
  const level  = alerte.statut === "resolue" ? "resolue" : (alerte.niveau ?? "alerte");
  const style  = LEVEL_STYLE[level];
  const Icon   = LEVEL_ICON[level];
  const typeAl = alerte.type_alerte ?? "SEUIL";
  const badge  = TYPE_BADGE[typeAl];

  return (
    <div className={`flex items-start gap-2 border rounded-xl px-3 py-2 text-xs ${style}`}>
      <Icon size={14} className="mt-0.5 shrink-0" />

      <div className="flex-1 min-w-0">
        {/* Type + badge SEUIL/DERIVE */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold capitalize">{alerte.type.replace(/_/g, " ")}</span>
          <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${badge.style}`}>
            {typeAl === "DERIVE" && <TrendingDown size={8} />}
            {badge.label}
          </span>
        </div>

        <div className="text-[11px] opacity-80 mt-0.5">
          {alerte.message ?? `${alerte.valeur} / seuil ${alerte.seuil}`}
        </div>
        <div className="text-[10px] opacity-60 mt-0.5">
          {alerte.timestamp ? new Date(alerte.timestamp).toLocaleString("fr-FR") : "—"}
        </div>
      </div>

      {alerte.statut === "active" && onResolve && (
        <button
          onClick={() => onResolve(alerte.id)}
          className="shrink-0 text-[10px] bg-white border border-current rounded-lg px-2 py-0.5 hover:opacity-70 transition"
        >
          Résoudre
        </button>
      )}
    </div>
  );
}
