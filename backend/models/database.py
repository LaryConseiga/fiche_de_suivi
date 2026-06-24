import sqlite3
from contextlib import contextmanager
from config import Config


def init_db():
    with get_db() as conn:
        # Tables de base — CREATE TABLE IF NOT EXISTS ne touche pas les données existantes
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS mesures (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
                temperature  REAL,
                pression     REAL,
                eclaboussure INTEGER,
                humidite     REAL
            );

            CREATE TABLE IF NOT EXISTS alertes (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
                type      TEXT    NOT NULL,
                valeur    REAL,
                seuil     REAL,
                statut    TEXT    NOT NULL DEFAULT 'active'
            );
        """)
        _migrate(conn)


def _migrate(conn):
    """
    Migration non destructive : ajoute colonnes et tables sans supprimer les données.
    Chaque ALTER TABLE est silencieusement ignoré si la colonne existe déjà.
    """
    nouvelles_colonnes = [
        # Distingue les alertes de seuil instantané des dérives progressives
        "ALTER TABLE alertes ADD COLUMN type_alerte TEXT NOT NULL DEFAULT 'SEUIL'",
        # Températures individuelles des deux mâchoires de soudure
        "ALTER TABLE mesures ADD COLUMN temp_mach1 REAL",
        "ALTER TABLE mesures ADD COLUMN temp_mach2 REAL",
        # Gradient = |mâchoire1 - mâchoire2|, indicateur d'asymétrie de soudure
        "ALTER TABLE mesures ADD COLUMN gradient REAL",
    ]
    for sql in nouvelles_colonnes:
        try:
            conn.execute(sql)
        except Exception:
            pass  # Colonne déjà présente lors d'une exécution précédente

    conn.executescript("""
        -- Score de risque composite calculé à chaque nouvelle mesure
        CREATE TABLE IF NOT EXISTS scores_risque (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
            score     INTEGER NOT NULL,
            niveau    TEXT    NOT NULL
        );

        -- Historique des nettoyages des mâchoires (traçabilité maintenance)
        CREATE TABLE IF NOT EXISTS evenements_nettoyage (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp        TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
            cycles_effectues INTEGER NOT NULL DEFAULT 0
        );

        -- Snapshots pré-fuite pour entraîner un modèle prédictif ultérieurement
        CREATE TABLE IF NOT EXISTS evenements_fuites (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
            snapshot  TEXT    NOT NULL
        );
    """)


@contextmanager
def get_db():
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()
