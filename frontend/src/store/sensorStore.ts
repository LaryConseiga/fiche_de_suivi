import { create } from "zustand";
import type { Mesure, ConnectionStatus } from "@/types";

interface SensorState {
  latest: Mesure | null;
  history: Mesure[];
  status: ConnectionStatus;
  setLatest: (m: Mesure) => void;
  setHistory: (h: Mesure[]) => void;
  setStatus: (s: ConnectionStatus) => void;
}

export const useSensorStore = create<SensorState>((set) => ({
  latest: null,
  history: [],
  status: "connecting",
  setLatest: (m) =>
    set((state) => ({
      latest: m,
      history: [...state.history.slice(-287), m], // 8h × 120 pts/h max
    })),
  setHistory: (h) => set({ history: h }),
  setStatus: (s) => set({ status: s }),
}));
