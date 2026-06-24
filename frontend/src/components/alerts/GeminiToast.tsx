import { useEffect, useState } from "react";
import { useGeminiStore } from "@/store/geminiStore";

function bgColor(event_type: string, niveau?: string): string {
  if (event_type === "retour_normal" || niveau === "NORMAL") return "bg-green-600";
  if (niveau === "CRITIQUE") return "bg-red-600";
  return "bg-orange-500";
}

export function GeminiToast() {
  const toast = useGeminiStore((s) => s.toast);
  const dismiss = useGeminiStore((s) => s.dismissToast);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) { setVisible(false); return; }

    const showTimer = setTimeout(() => setVisible(true), 20);
    const fadeTimer = setTimeout(() => setVisible(false), 5700);
    const hideTimer = setTimeout(() => dismiss(), 6000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast?.timestamp]);

  if (!toast) return null;

  return (
    <div
      className={[
        "fixed top-16 left-1/2 -translate-x-1/2 z-50",
        "max-w-sm w-[90vw] px-4 py-3 rounded-xl shadow-lg",
        "text-white text-sm font-semibold text-center",
        "transition-opacity duration-300",
        bgColor(toast.event_type, toast.niveau_risque),
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      {toast.conseil}
    </div>
  );
}
