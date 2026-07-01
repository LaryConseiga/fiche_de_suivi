import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { api } from "@/services/api";
import type { Mesure, Alerte } from "@/types";

async function genererPDF(hours: number, from: string, to: string) {
  const { jsPDF } = await import("jspdf");
  const autoTable  = (await import("jspdf-autotable")).default;

  const maintenant = new Date();
  const debut = from
    ? new Date(from)
    : new Date(maintenant.getTime() - hours * 3600_000);

  // ── Récupération des données ────────────────────────────────────────────
  const [mesures, alertes]: [Mesure[], Alerte[]] = await Promise.all([
    from && to
      ? fetch(`${import.meta.env.VITE_BACKEND_URL || ""}/api/history/range?from=${from.replace("T", " ")}&to=${to.replace("T", " ")}`).then(r => r.json())
      : fetch(`${import.meta.env.VITE_BACKEND_URL || ""}/api/history?hours=${hours}`).then(r => r.json()),
    fetch(`${import.meta.env.VITE_BACKEND_URL || ""}/api/alerts?statut=all`).then(r => r.json()),
  ]);

  // ── Statistiques ────────────────────────────────────────────────────────
  const temps     = mesures.map((m) => m.temperature).filter(Boolean) as number[];
  const pressions = mesures.map((m) => m.pression).filter(Boolean) as number[];

  const stat = (arr: number[]) => arr.length === 0
    ? { min: "—", max: "—", moy: "—" }
    : {
        min: Math.min(...arr).toFixed(1),
        max: Math.max(...arr).toFixed(1),
        moy: (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1),
      };

  const statT = stat(temps);
  const statP = stat(pressions);
  const nbAlertes = alertes.length;

  // ── Construction du PDF ─────────────────────────────────────────────────
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const vert   = [46, 125, 50]  as [number, number, number];
  const orange = [230, 120, 30] as [number, number, number];
  const gris   = [80,  80,  80] as [number, number, number];

  // En-tête
  doc.setFillColor(...vert);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("INNOFASO — Rapport de surveillance", 14, 11);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Système de monitoring ensacheuse Plumpy'Nut — Ouagadougou, Burkina Faso", 14, 18);
  doc.text(`Généré le ${maintenant.toLocaleString("fr-FR")}`, 14, 24);

  // Période
  doc.setTextColor(...gris);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Période analysée", 14, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `Du ${debut.toLocaleString("fr-FR")} au ${maintenant.toLocaleString("fr-FR")}  —  ${mesures.length} mesures`,
    14, 44,
  );

  // Statistiques
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Statistiques capteurs", 14, 56);

  autoTable(doc, {
    startY: 60,
    head: [["Paramètre", "Minimum", "Maximum", "Moyenne"]],
    body: [
      ["Température (°C)", statT.min, statT.max, statT.moy],
      ["Pression (bar)",   statP.min, statP.max, statP.moy],
    ],
    headStyles:  { fillColor: vert, textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles:  { fontSize: 9 },
    columnStyles: { 0: { fontStyle: "bold" } },
    margin: { left: 14, right: 14 },
  });

  // Résumé alertes
  const y1 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...gris);
  doc.text(`Alertes enregistrées (${nbAlertes})`, 14, y1);

  if (alertes.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Aucune alerte enregistrée sur la période.", 14, y1 + 6);
  } else {
    autoTable(doc, {
      startY: y1 + 4,
      head: [["Date/heure", "Type", "Catégorie", "Message", "Statut"]],
      body: alertes.slice(0, 50).map((a) => [
        a.timestamp    ?? "—",
        a.type         ?? "—",
        a.type_alerte  ?? "—",
        a.message      ?? "—",
        a.statut       ?? "—",
      ]),
      headStyles:  { fillColor: orange, textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles:  { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 32 },
        3: { cellWidth: 65 },
      },
      margin:      { left: 14, right: 14 },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 4) {
          data.cell.styles.textColor =
            data.cell.raw === "active" ? [200, 60, 60] : [60, 140, 60];
        }
      },
    });
  }

  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `INNO-ALERT — Surveillance industrielle InnoFaso  |  Page ${i}/${pageCount}`,
      14,
      doc.internal.pageSize.height - 6,
    );
  }

  const nomFichier = `innofaso_rapport_${maintenant.toISOString().slice(0, 10)}.pdf`;
  doc.save(nomFichier);
}

export function Reports() {
  const [hours, setHours] = useState(8);
  const [from, setFrom]   = useState("");
  const [to, setTo]       = useState("");
  const [loading, setLoading] = useState(false);

  const handleCSV = () => {
    if (from && to) {
      api.exportCSV({ from: from.replace("T", " "), to: to.replace("T", " ") });
    } else {
      api.exportCSV({ hours });
    }
  };

  const handlePDF = async () => {
    setLoading(true);
    try {
      await genererPDF(hours, from, to);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-bold text-primary-800 mb-1">Rapports & Export</h2>
        <p className="text-xs text-gray-400">Téléchargez les données au format CSV ou PDF</p>
      </div>

      <div className="bg-panel rounded-2xl shadow-card p-5 max-w-md">
        <h3 className="text-sm font-semibold text-primary-700 mb-4">Paramètres du rapport</h3>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              Période rapide
            </label>
            <div className="flex gap-2">
              {[1, 4, 8, 24].map((h) => (
                <button
                  key={h}
                  onClick={() => { setHours(h); setFrom(""); setTo(""); }}
                  className={[
                    "px-3 py-1.5 rounded-full text-xs font-semibold border transition",
                    hours === h && !from
                      ? "bg-primary-500 text-white border-primary-500"
                      : "bg-white text-primary-600 border-primary-300 hover:border-primary-500",
                  ].join(" ")}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              Plage personnalisée (optionnel)
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="datetime-local"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border border-gray-300 rounded-lg text-xs px-3 py-2 w-full"
              />
              <input
                type="datetime-local"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border border-gray-300 rounded-lg text-xs px-3 py-2 w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handlePDF}
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl py-2.5 transition flex items-center justify-center gap-2"
            >
              <FileText size={15} />
              <span>{loading ? "Génération…" : "Télécharger PDF"}</span>
            </button>

            <button
              onClick={handleCSV}
              className="w-full bg-white hover:bg-gray-50 text-primary-600 border border-primary-300 font-semibold text-sm rounded-xl py-2.5 transition flex items-center justify-center gap-2"
            >
              <Download size={15} />
              <span>Télécharger CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
