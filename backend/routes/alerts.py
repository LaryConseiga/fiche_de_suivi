from flask import Blueprint, jsonify, request
from models.alerte import get_active, get_all, resolve_alerte, delete_resolved, delete_all

bp = Blueprint("alerts", __name__)

@bp.get("/alerts")
def alerts():
    statut = request.args.get("statut", "active")
    if statut == "active":
        return jsonify(get_active())
    return jsonify(get_all())

@bp.patch("/alerts/<int:alerte_id>/resolve")
def resolve(alerte_id: int):
    resolve_alerte(alerte_id)
    return jsonify({"ok": True})

@bp.delete("/alerts/resolved")
def purge_resolved():
    count = delete_resolved()
    return jsonify({"ok": True, "supprimees": count})

@bp.delete("/alerts")
def purge_all():
    count = delete_all()
    return jsonify({"ok": True, "supprimees": count})
