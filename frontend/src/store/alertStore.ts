import { create } from "zustand";
import type { Alerte } from "@/types";

interface AlertState {
  active: Alerte[];
  all: Alerte[];
  addAlert: (a: Alerte) => void;
  setActive: (list: Alerte[]) => void;
  setAll: (list: Alerte[]) => void;
  resolve: (id: number) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  active: [],
  all: [],
  addAlert: (a) =>
    set((s) => ({
      active: [a, ...s.active],
      all: [a, ...s.all],
    })),
  setActive: (list) => set({ active: list }),
  setAll: (list) => set({ all: list }),
  resolve: (id) =>
    set((s) => ({
      active: s.active.filter((a) => a.id !== id),
      all: s.all.map((a) => (a.id === id ? { ...a, statut: "resolue" as const } : a)),
    })),
}));
