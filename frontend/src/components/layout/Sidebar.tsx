import { NavLink } from "react-router-dom";
import { LayoutDashboard, LineChart, Bell, FileText } from "lucide-react";
import { useAlertStore } from "@/store/alertStore";

const NAV = [
  { to: "/",        icon: LayoutDashboard, label: "Dashboard" },
  { to: "/history", icon: LineChart,       label: "Historique" },
  { to: "/alerts",  icon: Bell,            label: "Alertes",   badge: true },
  { to: "/reports", icon: FileText,        label: "Rapports" },
];

export function Sidebar() {
  const activeCount = useAlertStore((s) => s.active.length);

  return (
    <aside className="hidden sm:flex fixed top-14 left-0 bottom-0 w-16 lg:w-52 bg-primary-700 flex-col py-4 z-30">
      <nav className="flex flex-col gap-1 px-2">
        {NAV.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-500 text-white"
                  : "text-primary-200 hover:bg-primary-600 hover:text-white",
              ].join(" ")
            }
          >
            <Icon size={18} className="shrink-0" />
            <span className="hidden lg:inline">{label}</span>
            {badge && activeCount > 0 && (
              <span className="ml-auto bg-danger-500 text-white text-[10px] font-bold rounded-full w-4 h-4 items-center justify-center hidden lg:flex">
                {activeCount > 9 ? "9+" : activeCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-4 hidden lg:block">
        <div className="text-primary-400 text-[10px] leading-relaxed">
          <div className="font-semibold text-primary-300 mb-1">InnoFaso</div>
          Système de suivi<br />micro-fuites v1.0
        </div>
      </div>
    </aside>
  );
}
