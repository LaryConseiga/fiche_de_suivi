import { useEffect } from "react";
import { api } from "@/services/api";
import { useSensorStore } from "@/store/sensorStore";

export function useSensorData(hours = 8) {
  const { setHistory } = useSensorStore();

  useEffect(() => {
    api.getHistory(hours).then(setHistory).catch(console.error);
    const id = setInterval(() => {
      api.getHistory(hours).then(setHistory).catch(console.error);
    }, 30_000);
    return () => clearInterval(id);
  }, [hours, setHistory]);
}
