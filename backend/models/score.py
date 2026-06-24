from models.database import get_db


def insert_score(score: int, niveau: str) -> int:
    """Persiste le score de risque composite pour traçabilité et analyse historique de production."""
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO scores_risque (score, niveau) VALUES (?, ?)",
            (score, niveau),
        )
        return cur.lastrowid
