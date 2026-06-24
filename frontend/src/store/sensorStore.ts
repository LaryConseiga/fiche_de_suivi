import { create } from "zustand";
import type { Mesure, ConnectionStatus } from "@/types";

interface SensorState {
  latest: Mesure | null;
  history: Mesure[];
  status: ConnectionStatus;
  // Score de risque composite (Modification 1)
  score: number | null;
  niveauRisque: "NORMAL" | "SURVEILLANCE" | "CRITIQUE" | null;
  // Compteur de cycles depuis dernier nettoyage (Modification 3)
  cycles: number;
  // Indicateurs de dérive active (Modification 2)
  driftTemp: boolean;
  driftPression: boolean;

  setLatest: (m: Mesure) => void;
  setHistory: (h: Mesure[]) => void;
  setStatus: (s: ConnectionStatus) => void;
  setCycles: (n: number) => void;
}

export const useSensorStore = create<SensorState>((set) => ({
  latest:        null,
  history:       [],
  status:        "connecting",
  score:         null,
  niveauRisque:  null,
  cycles:        0,
  driftTemp:     false,
  driftPression: false,

  setLatest: (m) =>
    set((state) => ({
      latest:        m,
      history:       [...state.history.slice(-287), m],   // 8h × 120 pts/h max
      // Extraire les champs enrichis du payload WebSocket — conserver la dernière valeur si absente
      score:         m.score          ?? state.score,
      niveauRisque:  m.niveau_risque  ?? state.niveauRisque,
      cycles:        m.cycles         ?? state.cycles,
      driftTemp:     m.drift_temp     ?? state.driftTemp,
      driftPression: m.drift_pression ?? state.driftPression,
    })),

  setHistory:  (h) => set({ history: h }),
  setStatus:   (s) => set({ status: s }),
  setCycles:   (n) => set({ cycles: n }),
}));
