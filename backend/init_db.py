"""
Script d'initialisation de la base de données InnoFaso.
Lance : py init_db.py
"""
from models.database import init_db, get_db
from config import Config

if __name__ == "__main__":
    print(f"Initialisation de la base : {Config.DATABASE_PATH}")
    init_db()

    # Vérification des tables créées
    with get_db() as conn:
        tables = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        ).fetchall()
        print("Tables créées :")
        for t in tables:
            print(f"  - {t['name']}")

    print("Base de données prête.")
