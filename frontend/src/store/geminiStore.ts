import { create } from "zustand";
import type { GeminiConseil } from "@/types";

interface GeminiState {
  conseils: GeminiConseil[];
  toast: GeminiConseil | null;
  addConseil: (c: GeminiConseil) => void;
  dismissToast: () => void;
}

export const useGeminiStore = create<GeminiState>((set) => ({
  conseils: [],
  toast: null,
  addConseil: (c) =>
    set((s) => ({ conseils: [c, ...s.conseils.slice(0, 49)], toast: c })),
  dismissToast: () => set({ toast: null }),
}));
