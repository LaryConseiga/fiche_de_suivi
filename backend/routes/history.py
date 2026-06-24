from flask import Blueprint, jsonify, request
from models.mesure import get_history, get_range

bp = Blueprint("history", __name__)

@bp.get("/history")
def history():
    hours = request.args.get("hours", 8, type=int)
    return jsonify(get_history(hours))

@bp.get("/history/range")
def history_range():
    date_from = request.args.get("from", "")
    date_to = request.args.get("to", "")
    if not date_from or not date_to:
        return jsonify({"error": "Paramètres 'from' et 'to' requis"}), 400
    return jsonify(get_range(date_from, date_to))
