import { AlertTriangle } from "lucide-react";
import { useSensorStore } from "@/store/sensorStore";
import { useAlertStore } from "@/store/alertStore";

const STATUS_DOT: Record<string, string> = {
  connected:    "bg-leaf-400",
  disconnected: "bg-danger-500 animate-pulse",
  connecting:   "bg-gold-400 animate-pulse",
};

const STATUS_LABEL: Record<string, string> = {
  connected:    "Connecté",
  disconnected: "Déconnecté",
  connecting:   "Connexion…",
};

export function Header() {
  const status      = useSensorStore((s) => s.status);
  const activeCount = useAlertStore((s) => s.active.length);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-primary-500 shadow-md flex items-center justify-between px-4">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img
          src="/innofaso-logo.jpg"
          alt="InnoFaso"
          className="h-9 w-auto rounded-md object-contain bg-white px-1"
        />
        <span className="text-primary-100 text-xs font-medium hidden sm:inline">
          Suivi Micro-Fuites
        </span>
      </div>

      {/* Droite : alertes + statut */}
      <div className="flex items-center gap-4">
        {activeCount > 0 && (
          <div className="flex items-center gap-1.5 bg-danger-500 text-white rounded-full px-3 py-1 text-xs font-semibold">
            <AlertTriangle size={12} />
            <span>{activeCount} alerte{activeCount > 1 ? "s" : ""}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
          <span className="text-primary-100 text-xs font-medium">{STATUS_LABEL[status]}</span>
        </div>
      </div>
    </header>
  );
}
