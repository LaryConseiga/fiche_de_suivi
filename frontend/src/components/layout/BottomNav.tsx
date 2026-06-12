import { NavLink } from "react-router-dom";
import { LayoutDashboard, LineChart, Bell, FileText } from "lucide-react";
import { useAlertStore } from "@/store/alertStore";

const NAV = [
  { to: "/",        icon: LayoutDashboard, label: "Dashboard" },
  { to: "/history", icon: LineChart,       label: "Historique" },
  { to: "/alerts",  icon: Bell,            label: "Alertes",   badge: true },
  { to: "/reports", icon: FileText,        label: "Rapports" },
];

export function BottomNav() {
  const activeCount = useAlertStore((s) => s.active.length);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-primary-700 flex sm:hidden border-t border-primary-600">
      {NAV.map(({ to, icon: Icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            [
              "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors relative",
              isActive ? "text-white" : "text-primary-300",
            ].join(" ")
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1.5 rounded-xl ${isActive ? "bg-primary-500" : ""}`}>
                <Icon size={20} />
              </div>
              <span>{label}</span>
              {badge && activeCount > 0 && (
                <span className="absolute top-1.5 right-[calc(50%-18px)] bg-danger-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {activeCount > 9 ? "9+" : activeCount}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
