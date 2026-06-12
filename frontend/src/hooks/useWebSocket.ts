import { useEffect } from "react";
import { getSocket } from "@/services/socket";
import { useSensorStore } from "@/store/sensorStore";
import { useAlertStore } from "@/store/alertStore";
import type { Mesure, Alerte } from "@/types";

export function useWebSocket() {
  const { setLatest, setStatus } = useSensorStore();
  const { addAlert } = useAlertStore();

  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => setStatus("connected"));
    socket.on("disconnect", () => setStatus("disconnected"));
    socket.on("mesure", (data: Mesure) => setLatest(data));
    socket.on("alerte", (data: Alerte) => addAlert(data));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("mesure");
      socket.off("alerte");
    };
  }, [setLatest, setStatus, addAlert]);
}
