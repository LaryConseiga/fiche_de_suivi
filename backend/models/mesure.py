from models.database import get_db


def insert_mesure(data: dict) -> int:
    """
    Persiste une mesure reçue de l'Arduino.
    Si l'Arduino envoie les deux températures (T1, T2), le gradient inter-mâchoires
    est calculé et stocké pour l'analyse de l'asymétrie de soudure.
    """
    T1 = data.get("T1", data.get("T"))
    T2 = data.get("T2", data.get("T"))
    gradient = round(abs(T1 - T2), 2) if T1 is not None and T2 is not None else None

    with get_db() as conn:
        cur = conn.execute(
            """INSERT INTO mesures
               (temperature, pression, eclaboussure, humidite, temp_mach1, temp_mach2, gradient)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (data.get("T"), data.get("P"), data.get("ecl"), data.get("hr"), T1, T2, gradient),
        )
        return cur.lastrowid


def get_latest(limit: int = 1):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM mesures ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]


def get_history(hours: int = 8):
    with get_db() as conn:
        rows = conn.execute(
            """SELECT * FROM mesures
               WHERE timestamp >= datetime('now', 'localtime', ? || ' hours')
               ORDER BY timestamp ASC""",
            (f"-{hours}",),
        ).fetchall()
        return [dict(r) for r in rows]


def get_range(date_from: str, date_to: str):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM mesures WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp ASC",
            (date_from, date_to),
        ).fetchall()
        return [dict(r) for r in rows]
