interface Props {
  label: string;
  value: number | null;
  unit: string;
  min: number;
  max: number;
  thresholdLow?: number;
  colorOk?: string;
  colorCrit?: string;
  hasDrift?: boolean;   // true → affiche ↓ dérive descendante détectée sur cette variable
}

function arcPath(pct: number, r: number): string {
  const angle = pct * 180 - 180;
  const rad   = (angle * Math.PI) / 180;
  const x     = 60 + r * Math.cos(rad);
  const y     = 60 + r * Math.sin(rad);
  const large = pct > 0.5 ? 1 : 0;
  return `M ${60 - r} 60 A ${r} ${r} 0 ${large} 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
}

export function GaugeCard({
  label,
  value,
  unit,
  min,
  max,
  thresholdLow,
  colorOk   = "#2D7A3A",
  colorCrit = "#C62828",
  hasDrift  = false,
}: Props) {
  const pct   = value === null ? 0 : Math.max(0, Math.min(1, (value - min) / (max - min)));
  const isCrit = thresholdLow !== undefined && value !== null && value < thresholdLow;
  const color  = value === null ? "#9CA3AF" : isCrit ? colorCrit : colorOk;
  const r      = 46;

  return (
    <div className="bg-panel rounded-2xl shadow-card p-3 sm:p-4 flex flex-col items-center gap-1.5 w-full">
      <svg width="110" height="68" viewBox="0 0 120 70" className="w-full max-w-[130px]">
        <path d={arcPath(1, r)} fill="none" stroke="#E5E7EB" strokeWidth="10" strokeLinecap="round" />
        <path d={arcPath(pct, r)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
        <text x="60" y="57" textAnchor="middle" fontSize="18" fontWeight="700" fill={color}>
          {value !== null ? value.toFixed(1) : "--"}
        </text>
        <text x="60" y="68" textAnchor="middle" fontSize="9" fill="#6B7280">
          {unit}
        </text>
      </svg>

      {/* Label + flèche de dérive */}
      <div className="flex items-center gap-1">
        <span className="text-xs font-semibold text-primary-700 tracking-wide uppercase text-center">
          {label}
        </span>
        {hasDrift && (
          <span
            title="Dérive descendante détectée sur les 20 dernières mesures"
            className="text-sm font-black text-amber-500 leading-none"
          >
            ↓
          </span>
        )}
      </div>

      <span className={[
        "text-[10px] font-semibold px-2 py-0.5 rounded-full",
        value === null ? "bg-gray-100 text-gray-400"
        : isCrit       ? "bg-red-100 text-danger-600"
                       : "bg-green-100 text-primary-600",
      ].join(" ")}>
        {value === null ? "N/A" : isCrit ? "Critique" : "Normal"}
      </span>
    </div>
  );
}
