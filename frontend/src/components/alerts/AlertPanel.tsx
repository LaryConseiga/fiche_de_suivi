import { CheckCircle } from "lucide-react";
import { useAlertStore } from "@/store/alertStore";
import { useAlerts } from "@/hooks/useAlerts";
import { AlertBadge } from "./AlertBadge";

export function AlertPanel() {
  const active = useAlertStore((s) => s.active);
  const { resolveAlert } = useAlerts();

  if (active.length === 0) {
    return (
      <div className="bg-panel rounded-2xl shadow-card p-4">
        <h3 className="text-sm font-semibold text-primary-700 mb-3">Alertes actives</h3>
        <div className="flex items-center gap-2 text-xs text-primary-600 bg-green-50 border border-primary-200 rounded-xl px-3 py-2">
          <CheckCircle size={13} />
          <span>Tous les paramètres sont normaux</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-panel rounded-2xl shadow-card p-4">
      <h3 className="text-sm font-semibold text-primary-700 mb-3">
        Alertes actives{" "}
        <span className="ml-1 text-[11px] bg-danger-500 text-white rounded-full px-2 py-0.5">
          {active.length}
        </span>
      </h3>
      <div className="flex flex-col gap-2">
        {active.map((a) => (
          <AlertBadge key={a.id} alerte={a} onResolve={resolveAlert} />
        ))}
      </div>
    </div>
  );
}
