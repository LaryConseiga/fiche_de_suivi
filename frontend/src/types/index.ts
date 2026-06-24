export interface Mesure {
  id?: number;
  timestamp?: string;
  temperature: number | null;
  pression: number | null;
  eclaboussure: 0 | 1 | null;
  humidite: number | null;
  // Champs enrichis — calculés côté backend à chaque mesure
  gradient?: number | null;
  score?: number;
  niveau_risque?: "NORMAL" | "SURVEILLANCE" | "CRITIQUE";
  cycles?: number;
  drift_temp?: boolean;
  drift_pression?: boolean;
}

export interface Alerte {
  id: number;
  timestamp: string;
  type: string;   // élargi pour inclure les types de dérive (temperature_derive, etc.)
  type_alerte?: "SEUIL" | "DERIVE";
  valeur: number;
  seuil: number;
  statut: "active" | "resolue";
  niveau?: "alerte" | "critique";
  message?: string;
}

export type ConnectionStatus = "connected" | "disconnected" | "connecting";

export interface GeminiConseil {
  event_type: "score_zone_change" | "retour_normal" | "derive_detectee" | "cycles_eleves";
  conseil: string;
  timestamp: string;
  niveau_risque?: "NORMAL" | "SURVEILLANCE" | "CRITIQUE";
}
