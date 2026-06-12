export interface Mesure {
  id: number;
  timestamp: string;
  temperature: number | null;
  pression: number | null;
  eclaboussure: 0 | 1 | null;
  humidite: number | null;
}

export interface Alerte {
  id: number;
  timestamp: string;
  type: "temperature" | "pression" | "eclaboussure";
  valeur: number;
  seuil: number;
  statut: "active" | "resolue";
  niveau?: "alerte" | "critique";
  message?: string;
}

export type ConnectionStatus = "connected" | "disconnected" | "connecting";
