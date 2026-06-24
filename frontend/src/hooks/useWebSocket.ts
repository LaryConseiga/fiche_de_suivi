import { useEffect } from "react";
import { getSocket } from "@/services/socket";
import { useSensorStore } from "@/store/sensorStore";
import { useAlertStore } from "@/store/alertStore";
import { useGeminiStore } from "@/store/geminiStore";
import type { Mesure, Alerte, GeminiConseil } from "@/types";

export function useWebSocket() {
  const { setLatest, setStatus } = useSensorStore();
  const { addAlert } = useAlertStore();
  const { addConseil } = useGeminiStore();

  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => setStatus("connected"));
    socket.on("disconnect", () => setStatus("disconnected"));
    socket.on("mesure", (data: Mesure) => setLatest(data));
    socket.on("alerte", (data: Alerte) => addAlert(data));
    socket.on("gemini_conseil", (data: GeminiConseil) => addConseil(data));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("mesure");
      socket.off("alerte");
      socket.off("gemini_conseil");
    };
  }, [setLatest, setStatus, addAlert, addConseil]);
}
