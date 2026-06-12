import { useAlertStore } from "@/store/alertStore";
import { useAlerts } from "@/hooks/useAlerts";
import { AlertBadge } from "@/components/alerts/AlertBadge";

export function Alerts() {
  const all = useAlertStore((s) => s.all);
  const active = useAlertStore((s) => s.active);
  const { resolveAlert } = useAlerts();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-bold text-primary-800 mb-1">Gestion des alertes</h2>
        <p className="text-xs text-gray-400">{active.length} active(s) · {all.length} au total</p>
      </div>

      {/* Stat cards */}
      <div className="flex flex-wrap gap-3">
        <StatCard label="Actives"  value={active.length}              color="bg-red-50 text-danger-600" />
        <StatCard label="Résolues" value={all.length - active.length} color="bg-green-50 text-primary-600" />
        <StatCard label="Total"    value={all.length}                 color="bg-gray-50 text-gray-600" />
      </div>

      {/* Liste complète */}
      <div className="bg-panel rounded-2xl shadow-card p-4">
        <h3 className="text-sm font-semibold text-primary-700 mb-3">Toutes les alertes</h3>
        {all.length === 0 ? (
          <p className="text-xs text-gray-400">Aucune alerte enregistrée.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {all.map((a) => (
              <AlertBadge key={a.id} alerte={a} onResolve={resolveAlert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-2xl px-5 py-3 shadow-card ${color} flex flex-col min-w-[100px]`}>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs font-medium opacity-70 mt-0.5">{label}</span>
    </div>
  );
}
