import axios from "axios";
import type { Mesure, Alerte } from "@/types";

// En dev : VITE_BACKEND_URL absent → baseURL="/api" → proxy Vite réécrit vers le backend
// En prod : VITE_BACKEND_URL=https://xxx.onrender.com → appels directs au backend
const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "";
const http = axios.create({ baseURL: BACKEND || "/api" });

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

  nettoyage: () =>
    http.post<{ ok: boolean; cycles_effectues: number }>("/nettoyage").then((r) => r.data),

  fuiteSignalee: () =>
    http.post<{ ok: boolean; mesures_capturees: number }>("/fuite-signalee").then((r) => r.data),

  exportCSV: (params: { hours?: number; from?: string; to?: string }) => {
    const base = BACKEND || window.location.origin;
    const url = new URL("/export", base);
    Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, String(v)));
    window.open(url.toString(), "_blank");
  },
};
