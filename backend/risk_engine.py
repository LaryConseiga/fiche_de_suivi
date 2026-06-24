"""
Moteur de score de risque composite — Modification 1.

Une microfuite provient rarement d'une seule cause. Ce module agrège plusieurs
signaux faibles simultanés (température, pression, éclaboussure, encrassement)
en un score unique de 0 à 10, plus lisible pour l'opérateur qu'une liste d'alertes.

Niveaux :  0–3 NORMAL (vert)  |  4–6 SURVEILLANCE (orange)  |  7–10 CRITIQUE (rouge)
"""
from models.database import get_db


def calcul_score_risque(data: dict, cycles: int) -> dict:
    """
    Calcule le score de risque global à partir des mesures courantes et du contexte machine.
    Chaque critère représente un facteur de risque documenté sur l'ensacheuse Plumpy'Nut.
    """
    score = 0

    T  = data.get("T")
    P  = data.get("P")
    T1 = data.get("T1", T)   # température mâchoire haute (si dispo)
    T2 = data.get("T2", T)   # température mâchoire basse (si dispo)

    # ── Température de soudure (plage cible 120–160°C) ──────────────────────
    if T is not None:
        if 115 <= T < 120:
            score += 2   # zone limite basse — surveiller la tendance
        elif T < 115:
            score += 4   # trop froide → fusion du film incomplète quasi-certaine
        elif T > 160:
            score += 3   # trop chaude → brûlure du film, perforation possible

    # ── Gradient inter-mâchoires ────────────────────────────────────────────
    # Un écart > 5°C entre les deux mâchoires produit une soudure asymétrique
    # (bonne fusion d'un côté, mauvaise de l'autre → microfuite latérale)
    if T1 is not None and T2 is not None:
        gradient = abs(T1 - T2)
        if gradient > 5:
            score += 2

    # ── Pression du balancier (cible 4 bar) ─────────────────────────────────
    if P is not None:
        if 3.5 <= P < 3.8:
            score += 1   # légèrement sous la cible — contact film insuffisant
        elif P < 3.5:
            score += 3   # pression trop faible → pas d'écrasement garanti du film

    # ── Contamination récente de la zone de soudure (5 dernières minutes) ───
    # Une éclaboussure de pâte sur la mâchoire empêche la fusion du film plastique
    if _eclaboussure_recente():
        score += 3

    # ── Encrassement des mâchoires ──────────────────────────────────────────
    # Après 800 cycles sans nettoyage, les résidus carbonisés dégradent la soudure
    if cycles > 800:
        score += 2

    score = min(score, 10)   # plafonné à 10

    if score <= 3:
        niveau = "NORMAL"
    elif score <= 6:
        niveau = "SURVEILLANCE"
    else:
        niveau = "CRITIQUE"

    print(f"[Risk] Score composite : {score}/10 → {niveau}")
    return {"score": score, "niveau": niveau}


def _eclaboussure_recente() -> bool:
    """Vérifie si la zone de soudure a été contaminée dans les 5 dernières minutes."""
    with get_db() as conn:
        row = conn.execute(
            """SELECT COUNT(*) AS cnt FROM mesures
               WHERE eclaboussure = 1
               AND timestamp >= datetime('now', 'localtime', '-5 minutes')"""
        ).fetchone()
        return row["cnt"] > 0
