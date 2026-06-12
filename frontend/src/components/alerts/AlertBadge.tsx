import { XCircle, AlertTriangle, CheckCircle } from "lucide-react";
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

interface Props {
  alerte: Alerte;
  onResolve?: (id: number) => void;
}

export function AlertBadge({ alerte, onResolve }: Props) {
  const level = alerte.statut === "resolue" ? "resolue" : (alerte.niveau ?? "alerte");
  const style = LEVEL_STYLE[level];
  const Icon  = LEVEL_ICON[level];

  return (
    <div className={`flex items-start gap-2 border rounded-xl px-3 py-2 text-xs ${style}`}>
      <Icon size={14} className="mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold capitalize">{alerte.type}</div>
        <div className="text-[11px] opacity-80 mt-0.5">
          {alerte.message ?? `${alerte.valeur} / seuil ${alerte.seuil}`}
        </div>
        <div className="text-[10px] opacity-60 mt-0.5">
          {new Date(alerte.timestamp).toLocaleString("fr-FR")}
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
