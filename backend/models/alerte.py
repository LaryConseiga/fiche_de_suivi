from models.database import get_db


def insert_alerte(type_: str, valeur: float, seuil: float, type_alerte: str = "SEUIL") -> int:
    """
    Enregistre une alerte en précisant son origine :
    - type_alerte='SEUIL' : un seuil critique a été franchi instantanément
    - type_alerte='DERIVE' : une tendance anormale est détectée sur les dernières mesures
    """
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO alertes (type, valeur, seuil, type_alerte) VALUES (?, ?, ?, ?)",
            (type_, valeur, seuil, type_alerte),
        )
        return cur.lastrowid


def get_active():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM alertes WHERE statut = 'active' ORDER BY timestamp DESC"
        ).fetchall()
        return [dict(r) for r in rows]


def get_all(limit: int = 100):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM alertes ORDER BY timestamp DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]


def resolve_alerte(alerte_id: int):
    with get_db() as conn:
        conn.execute(
            "UPDATE alertes SET statut = 'resolue' WHERE id = ?", (alerte_id,)
        )
