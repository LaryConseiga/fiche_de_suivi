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
    return () => clearTimeout(showTimer);
  }, [toast?.timestamp]);

  if (!toast) return null;

  return (
    <div
      className={[
        "fixed top-16 left-1/2 -translate-x-1/2 z-50",
        "max-w-sm w-[90vw] px-4 py-3 rounded-xl shadow-lg",
        "text-white text-sm font-semibold",
        "flex items-center gap-3",
        "transition-opacity duration-300",
        bgColor(toast.event_type, toast.niveau_risque),
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <span className="flex-1 text-center">{toast.conseil}</span>
      <button
        onClick={dismiss}
        className="text-white/70 hover:text-white text-lg leading-none shrink-0"
        aria-label="Fermer"
      >
        ×
      </button>
    </div>
  );
}
