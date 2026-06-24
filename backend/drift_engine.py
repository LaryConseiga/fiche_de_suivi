"""
Détection de dérives progressives — Modification 2.

Contrairement aux alertes de seuil (déclenchées quand une valeur franchit une limite),
les dérives signalent une tendance sur les 20 dernières mesures. Une dérive descendante
de température indique que la mâchoire refroidit progressivement — signe d'usure ou de
déréglage — avant même qu'un seuil critique soit atteint.

Implémenté sans numpy pour éviter les dépendances externes non garanties.
Un cooldown de 60 secondes par type d'alerte évite de spammer la base de données.
"""
from datetime import datetime
from models.database import get_db
from models.alerte import insert_alerte

# Horodatage de la dernière alerte émise par type — cooldown de 60 s
_derniere_alerte: dict = {}


def detect_drift(socketio) -> dict:
    """
    Analyse les 20 dernières mesures pour détecter des tendances anormales.
    Retourne les flags de dérive (drift_temp, drift_pression) pour le payload WebSocket.
    """
    rows = _get_last_20()
    if len(rows) < 10:
        # Pas assez de données pour une analyse fiable
        return {"drift_temp": False, "drift_pression": False}

    temps     = [r["temperature"] for r in rows if r["temperature"] is not None]
    pressions = [r["pression"]    for r in rows if r["pression"]    is not None]

    drift_temp     = False
    drift_pression = False

    # ── Analyse de la température ────────────────────────────────────────────
    if len(temps) >= 10:
        pente_temp = _pente(temps)
        std_temp   = _ecart_type(temps)

        if pente_temp < -0.3:
            # La température baisse régulièrement : risque de soudure froide à venir
            _emettre_derive(
                "temperature_derive", pente_temp, -0.3,
                f"Dérive descend. temp : {pente_temp:.3f}°C/mesure",
                socketio,
            )
            drift_temp = True

        if std_temp > 3.0:
            # Forte variabilité thermique : qualité de soudure irrégulière d'un sachet à l'autre
            _emettre_derive(
                "temperature_instabilite", std_temp, 3.0,
                f"Instabilité thermique : écart-type {std_temp:.2f}°C",
                socketio,
            )
            drift_temp = True

    # ── Analyse de la pression ───────────────────────────────────────────────
    if len(pressions) >= 10:
        pente_pres = _pente(pressions)

        if pente_pres < -0.05:
            # Chute progressive de pression : possible fuite dans le circuit pneumatique
            _emettre_derive(
                "pression_derive", pente_pres, -0.05,
                f"Dérive descend. pression : {pente_pres:.4f} bar/mesure",
                socketio,
            )
            drift_pression = True

    return {"drift_temp": drift_temp, "drift_pression": drift_pression}


# ── Helpers mathématiques (régression linéaire sans numpy) ──────────────────

def _pente(values: list) -> float:
    """Pente de la droite de régression linéaire par la méthode des moindres carrés."""
    n = len(values)
    if n < 2:
        return 0.0
    x   = list(range(n))
    sx  = sum(x)
    sy  = sum(values)
    sxy = sum(xi * yi for xi, yi in zip(x, values))
    sx2 = sum(xi * xi for xi in x)
    denom = n * sx2 - sx ** 2
    return (n * sxy - sx * sy) / denom if denom != 0 else 0.0


def _ecart_type(values: list) -> float:
    """Écart-type de la série — mesure de la variabilité de la température de soudure."""
    n = len(values)
    if n == 0:
        return 0.0
    mean = sum(values) / n
    return (sum((v - mean) ** 2 for v in values) / n) ** 0.5


def _get_last_20() -> list:
    """Récupère les 20 dernières mesures en ordre chronologique pour l'analyse de tendance."""
    with get_db() as conn:
        rows = conn.execute(
            "SELECT temperature, pression FROM mesures ORDER BY id DESC LIMIT 20"
        ).fetchall()
        return list(reversed([dict(r) for r in rows]))


COOLDOWN_SECONDES = 60   # délai minimum entre deux alertes du même type de dérive


def _emettre_derive(type_: str, valeur: float, seuil: float, message: str, socketio) -> None:
    """
    Stocke et diffuse une alerte de dérive, distincte des alertes de seuil.
    Un cooldown de 60 s évite de spammer la base si la dérive persiste plusieurs mesures.
    """
    maintenant = datetime.now()
    derniere = _derniere_alerte.get(type_)
    if derniere and (maintenant - derniere).total_seconds() < COOLDOWN_SECONDES:
        return   # cooldown actif — on n'émet pas de doublon

    _derniere_alerte[type_] = maintenant
    alerte_id = insert_alerte(type_, valeur, seuil, type_alerte="DERIVE")
    socketio.emit("alerte", {
        "id":          alerte_id,
        "type":        type_,
        "type_alerte": "DERIVE",
        "message":     message,
        "valeur":      round(valeur, 4),
        "seuil":       seuil,
        "niveau":      "alerte",
        "statut":      "active",
        "timestamp":   maintenant.strftime("%Y-%m-%d %H:%M:%S"),
    })
