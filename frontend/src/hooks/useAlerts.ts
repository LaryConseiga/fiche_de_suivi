import { useEffect } from "react";
import { api } from "@/services/api";
import { useAlertStore } from "@/store/alertStore";

export function useAlerts() {
  const { setActive, setAll, resolve } = useAlertStore();

  useEffect(() => {
    api.getAlerts("active").then(setActive).catch(console.error);
    api.getAlerts("all").then(setAll).catch(console.error);
  }, [setActive, setAll]);

  const resolveAlert = async (id: number) => {
    await api.resolveAlert(id);
    resolve(id);
  };

  return { resolveAlert };
}
