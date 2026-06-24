"""
Route POST /fuite-signalee — Modification 5.
Capture un snapshot des 30 dernières mesures lors d'une fuite signalée manuellement
par le responsable qualité. Ces données constitueront le jeu d'entraînement d'un
futur modèle prédictif de microfuites (apprentissage supervisé).
"""
import json
from datetime import datetime
from flask import Blueprint, jsonify
from models.database import get_db

bp = Blueprint("fuite", __name__)


@bp.post("/fuite-signalee")
def fuite_signalee():
    """Enregistre un snapshot pré-fuite pour la collecte de données d'entraînement."""
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM mesures ORDER BY id DESC LIMIT 30"
        ).fetchall()
        mesures = [dict(r) for r in rows]
        snapshot = json.dumps(mesures, ensure_ascii=False)

        conn.execute(
            "INSERT INTO evenements_fuites (timestamp, snapshot) VALUES (?, ?)",
            (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), snapshot),
        )

    print(f"[Fuite] Événement signalé — snapshot de {len(mesures)} mesures enregistré.")
    return jsonify({"ok": True, "mesures_capturees": len(mesures)})
