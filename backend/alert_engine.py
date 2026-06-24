from datetime import datetime
from config import Config
from models.alerte import insert_alerte


def check_and_fire(data: dict, socketio) -> list:
    """
    Vérifie les seuils critiques et émet des alertes de type SEUIL si franchis.
    Comportement inchangé par rapport à la version initiale — seuls statut,
    timestamp et type_alerte sont ajoutés aux payloads pour le frontend.
    """
    triggered = []
    T   = data.get("T")
    P   = data.get("P")
    ecl = data.get("ecl")

    if T is not None and T < Config.TEMP_MIN:
        alerte_id = insert_alerte("temperature", T, Config.TEMP_MIN, type_alerte="SEUIL")
        alert = {
            "id":          alerte_id,
            "type":        "temperature",
            "type_alerte": "SEUIL",
            "message":     f"Température basse : {T}°C < {Config.TEMP_MIN}°C",
            "valeur":      T,
            "seuil":       Config.TEMP_MIN,
            "niveau":      "critique",
            "statut":      "active",
            "timestamp":   datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }
        triggered.append(alert)
        socketio.emit("alerte", alert)

    if P is not None and P < Config.PRESSION_MIN:
        alerte_id = insert_alerte("pression", P, Config.PRESSION_MIN, type_alerte="SEUIL")
        alert = {
            "id":          alerte_id,
            "type":        "pression",
            "type_alerte": "SEUIL",
            "message":     f"Pression faible : {P} bar < {Config.PRESSION_MIN} bar",
            "valeur":      P,
            "seuil":       Config.PRESSION_MIN,
            "niveau":      "alerte",
            "statut":      "active",
            "timestamp":   datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }
        triggered.append(alert)
        socketio.emit("alerte", alert)

    if ecl == Config.ECLABOUSSURE_TRIGGER:
        alerte_id = insert_alerte("eclaboussure", 1, 0, type_alerte="SEUIL")
        alert = {
            "id":          alerte_id,
            "type":        "eclaboussure",
            "type_alerte": "SEUIL",
            "message":     "Éclaboussure détectée dans la zone de soudure !",
            "valeur":      1,
            "seuil":       0,
            "niveau":      "critique",
            "statut":      "active",
            "timestamp":   datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }
        triggered.append(alert)
        socketio.emit("alerte", alert)

    return triggered
