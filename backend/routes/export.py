import csv
import io
from flask import Blueprint, request, Response
from models.mesure import get_range, get_history

bp = Blueprint("export", __name__)

@bp.get("/export")
def export_csv():
    hours = request.args.get("hours", type=int)
    date_from = request.args.get("from", "")
    date_to = request.args.get("to", "")

    if date_from and date_to:
        rows = get_range(date_from, date_to)
    else:
        rows = get_history(hours or 8)

    output = io.StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=["id", "timestamp", "temperature", "pression", "eclaboussure", "humidite"],
    )
    writer.writeheader()
    writer.writerows(rows)

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=innofaso_export.csv"},
    )
