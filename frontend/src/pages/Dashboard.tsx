import { Droplets, ShieldCheck, CheckCircle, XCircle } from "lucide-react";
import { useSensorStore } from "@/store/sensorStore";
import { useSensorData } from "@/hooks/useSensorData";
import { GaugeCard } from "@/components/gauges/GaugeCard";
import { TemperatureChart } from "@/components/charts/TemperatureChart";
import { PressureChart } from "@/components/charts/PressureChart";
import { AlertPanel } from "@/components/alerts/AlertPanel";
import { RiskGauge } from "@/components/risk/RiskGauge";
import { FuiteButton } from "@/components/fuites/FuiteButton";

export function Dashboard() {
  const latest        = useSensorStore((s) => s.latest);
  const history       = useSensorStore((s) => s.history);
  const score         = useSensorStore((s) => s.score);
  const niveauRisque  = useSensorStore((s) => s.niveauRisque);
  const driftTemp     = useSensorStore((s) => s.driftTemp);
  const driftPression = useSensorStore((s) => s.driftPression);

  useSensorData(8);

  const splashDetected = latest?.eclaboussure === 1;

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <h2 className="text-base font-bold text-primary-800">Mesures temps réel</h2>

      {/* ── Indice de risque ─────────────────────────────────────────────── */}
      <RiskGauge score={score} niveau={niveauRisque} />

      {/* ── Jauges capteurs : 2 colonnes mobile, 4 colonnes desktop ─────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <GaugeCard
          label="Température"
          value={latest?.temperature ?? null}
          unit="°C"
          min={0}
          max={300}
          thresholdLow={120}
          hasDrift={driftTemp}
        />
        <GaugeCard
          label="Pression"
          value={latest?.pression ?? null}
          unit="bar"
          min={0}
          max={10}
          thresholdLow={3.5}
          colorOk="#F5A623"
          hasDrift={driftPression}
        />
        <GaugeCard
          label="Humidité"
          value={latest?.humidite ?? null}
          unit="%"
          min={0}
          max={100}
          colorOk="#185FA5"
        />

        {/* Capteur d'éclaboussure — booléen */}
        <div className="bg-panel rounded-2xl shadow-card p-3 sm:p-4 flex flex-col items-center justify-center gap-1.5 w-full">
          <div className={[
            "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300",
            splashDetected
              ? "bg-red-100 ring-4 ring-danger-400"
              : "bg-green-50 ring-2 ring-primary-200",
          ].join(" ")}>
            {splashDetected
              ? <Droplets size={24} className="text-danger-500" />
              : <ShieldCheck size={24} className="text-primary-500" />
            }
          </div>
          <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide text-center">
            Éclaboussure
          </span>
          <span className={[
            "flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
            splashDetected ? "bg-red-100 text-danger-600" : "bg-green-100 text-primary-600",
          ].join(" ")}>
            {splashDetected
              ? <><XCircle size={10} /> Détectée</>
              : <><CheckCircle size={10} /> Aucune</>
            }
          </span>
        </div>
      </div>

      {/* ── Alertes + graphiques : 2 colonnes sur xl ─────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AlertPanel />
        <div className="flex flex-col gap-4">
          <TemperatureChart data={history} />
          <PressureChart data={history} />
        </div>
      </div>

      {/* ── Outil responsable qualité — discret, en bas de page ─────────── */}
      <FuiteButton />
    </div>
  );
}
