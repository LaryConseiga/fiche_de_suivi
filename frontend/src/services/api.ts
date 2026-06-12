import axios from "axios";
import type { Mesure, Alerte } from "@/types";

const http = axios.create({ baseURL: "/api" });

export const api = {
  getLatest: () => http.get<Mesure>("/data").then((r) => r.data),

  getHistory: (hours = 8) =>
    http.get<Mesure[]>("/history", { params: { hours } }).then((r) => r.data),

  getHistoryRange: (from: string, to: string) =>
    http.get<Mesure[]>("/history/range", { params: { from, to } }).then((r) => r.data),

  getAlerts: (statut: "active" | "all" = "active") =>
    http.get<Alerte[]>("/alerts", { params: { statut } }).then((r) => r.data),

  resolveAlert: (id: number) =>
    http.patch(`/alerts/${id}/resolve`).then((r) => r.data),

  exportCSV: (params: { hours?: number; from?: string; to?: string }) => {
    const url = new URL("/api/export", window.location.origin);
    Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, String(v)));
    window.open(url.toString(), "_blank");
  },
};
