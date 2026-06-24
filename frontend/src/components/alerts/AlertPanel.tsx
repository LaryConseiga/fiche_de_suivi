import { CheckCircle } from "lucide-react";
import { useAlertStore } from "@/store/alertStore";
import { useAlerts } from "@/hooks/useAlerts";
import { AlertBadge } from "./AlertBadge";
import { useGeminiStore } from "@/store/geminiStore";
import type { GeminiConseil } from "@/types";

function conseilBorderColor(event_type: string, niveau?: string): string {
  if (event_type === "retour_normal" || niveau === "NORMAL") return "border-green-400 bg-green-50 text-green-800";
  if (niveau === "CRITIQUE") return "border-red-400 bg-red-50 text-red-800";
  return "border-orange-400 bg-orange-50 text-orange-800";
}

function eventLabel(event_type: string): string {
  const labels: Record<string, string> = {
    score_zone_change: "Changement de zone",
    retour_normal:     "Retour normal",
    derive_detectee:   "Dérive détectée",
    cycles_eleves:     "Cycles élevés",
  };
  return labels[event_type] ?? event_type;
}

function ConseilRow({ c }: { c: GeminiConseil }) {
  return (
    <div className={`border-l-4 rounded-r-xl px-3 py-2 text-xs ${conseilBorderColor(c.event_type, c.niveau_risque)}`}>
      <div className="font-semibold mb-0.5">{eventLabel(c.event_type)}</div>
      <div className="leading-snug">{c.conseil}</div>
      <div className="mt-1 opacity-60 text-[10px]">{c.timestamp}</div>
    </div>
  );
}

export function AlertPanel() {
  const active   = useAlertStore((s) => s.active);
  const conseils = useGeminiStore((s) => s.conseils);
  const { resolveAlert } = useAlerts();

  return (
    <div className="bg-panel rounded-2xl shadow-card p-4 flex flex-col gap-3">

      {/* ── Alertes capteurs ────────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-primary-700 mb-3">
          Alertes actives
          {active.length > 0 && (
            <span className="ml-1 text-[11px] bg-danger-500 text-white rounded-full px-2 py-0.5">
              {active.length}
            </span>
          )}
        </h3>
        {active.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-primary-600 bg-green-50 border border-primary-200 rounded-xl px-3 py-2">
            <CheckCircle size={13} />
            <span>Tous les paramètres sont normaux</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {active.map((a) => (
              <AlertBadge key={a.id} alerte={a} onResolve={resolveAlert} />
            ))}
          </div>
        )}
      </div>

      {/* ── Conseils INNO-ALERT ─────────────────────────────────────────── */}
      {conseils.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-primary-700 mb-2">Conseils INNO-ALERT</h3>
          <div className="flex flex-col gap-2">
            {conseils.slice(0, 5).map((c) => (
              <ConseilRow key={c.timestamp + c.event_type} c={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
