"""
Route POST /nettoyage — Modification 3.
Enregistre un nettoyage des mâchoires et remet le compteur de cycles à zéro.
À appeler par l'opérateur ou le technicien après chaque opération de nettoyage.
"""
from datetime import datetime
from flask import Blueprint, jsonify
import cycles
from models.database import get_db

bp = Blueprint("nettoyage", __name__)


@bp.post("/nettoyage")
def nettoyage():
    """Remet le compteur à zéro et trace l'événement dans l'historique de maintenance."""
    cycles_effectues = cycles.reset()

    with get_db() as conn:
        conn.execute(
            "INSERT INTO evenements_nettoyage (timestamp, cycles_effectues) VALUES (?, ?)",
            (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), cycles_effectues),
        )

    print(f"[Nettoyage] Mâchoires nettoyées après {cycles_effectues} cycles.")
    return jsonify({"ok": True, "cycles_effectues": cycles_effectues})
