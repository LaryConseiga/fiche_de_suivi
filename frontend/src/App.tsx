import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Dashboard } from "@/pages/Dashboard";
import { History } from "@/pages/History";
import { Alerts } from "@/pages/Alerts";
import { Reports } from "@/pages/Reports";
import { useWebSocket } from "@/hooks/useWebSocket";
import { GeminiToast } from "@/components/alerts/GeminiToast";

export function App() {
  useWebSocket();

  return (
    <BrowserRouter>
      <Header />
      <Sidebar />
      <BottomNav />
      <GeminiToast />

      {/*
        Mobile      : pas de sidebar → pl-0, espace bas pour BottomNav → pb-16
        Tablette sm : sidebar 64px  → pl-16
        Desktop lg  : sidebar 208px → pl-52
      */}
      <main className="pt-14 pb-16 sm:pb-0 pl-0 sm:pl-16 lg:pl-52 min-h-screen bg-surface">
        <div className="p-4 sm:p-5 max-w-5xl">
          <Routes>
            <Route path="/"        element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/alerts"  element={<Alerts />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  );
}
