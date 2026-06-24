/**
 * Indicateur visuel du score de risque composite (0–10).
 * C'est l'élément le plus important du dashboard — il synthétise en un seul
 * chiffre tous les signaux faibles simultanés détectés sur l'ensacheuse.
 */

interface Props {
  score: number | null;
  niveau: "NORMAL" | "SURVEILLANCE" | "CRITIQUE" | null;
}

const NIVEAU_CONFIG = {
  NORMAL: {
    color:  "#2D7A3A",
    bg:     "bg-green-50",
    border: "border-primary-200",
    label:  "Paramètres normaux — production en cours",
  },
  SURVEILLANCE: {
    color:  "#F5A623",
    bg:     "bg-amber-50",
    border: "border-amber-300",
    label:  "Surveiller — combinaison de signaux faibles détectée",
  },
  CRITIQUE: {
    color:  "#C62828",
    bg:     "bg-red-50",
    border: "border-danger-300",
    label:  "Risque élevé de microfuite — intervention recommandée",
  },
};

function arcPath(pct: number, r: number, cx: number, cy: number): string {
  const angle = pct * 180 - 180;
  const rad   = (angle * Math.PI) / 180;
  const x     = cx + r * Math.cos(rad);
  const y     = cy + r * Math.sin(rad);
  const large = pct > 0.5 ? 1 : 0;
  return `M ${cx - r} ${cy} A ${r} ${r} 0 ${large} 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
}

export function RiskGauge({ score, niveau }: Props) {
  const cfg = niveau ? NIVEAU_CONFIG[niveau] : NIVEAU_CONFIG.NORMAL;
  const pct = score !== null ? Math.min(score / 10, 1) : 0;
  const cx = 85;
  const cy = 85;
  const r  = 66;

  return (
    <div className={`bg-panel rounded-2xl shadow-card p-4 border-2 ${cfg.border} ${cfg.bg}`}>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">

        {/* Arc gauge SVG */}
        <div className="flex-shrink-0">
          <svg width="170" height="105" viewBox="0 0 170 105">
            {/* Piste grise de fond */}
            <path
              d={arcPath(1, r, cx, cy)}
              fill="none" stroke="#E5E7EB" strokeWidth="13" strokeLinecap="round"
            />
            {/* Arc coloré selon le score */}
            <path
              d={arcPath(Math.max(pct, 0.01), r, cx, cy)}
              fill="none" stroke={cfg.color} strokeWidth="13" strokeLinecap="round"
            />
            {/* Score numérique central */}
            <text x={cx} y={cy - 4} textAnchor="middle" fontSize="32" fontWeight="800" fill={cfg.color}>
              {score !== null ? score : "—"}
            </text>
            <text x={cx} y={cy + 14} textAnchor="middle" fontSize="12" fill="#9CA3AF">
              / 10
            </text>
          </svg>
        </div>

        {/* Texte descriptif */}
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Indice de risque global
          </p>
          <p className="text-xl font-extrabold tracking-tight" style={{ color: cfg.color }}>
            {niveau ?? "—"}
          </p>
          <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
            {cfg.label}
          </p>

          {/* Légende des niveaux */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-primary-700">
              0–3 Normal
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              4–6 Surveillance
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-danger-700">
              7–10 Critique
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
