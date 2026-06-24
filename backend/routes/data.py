from flask import Blueprint, jsonify
from models.mesure import get_latest

bp = Blueprint("data", __name__)

@bp.get("/data")
def latest():
    rows = get_latest(limit=1)
    return jsonify(rows[0] if rows else {})
