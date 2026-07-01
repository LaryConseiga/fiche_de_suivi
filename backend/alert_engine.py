from datetime import datetime
from config import Config
from models.alerte import insert_alerte, get_active

MAX_ALERTES_ACTIVES = 5
COOLDOWN_SECONDES   = 60

_cooldowns: dict = {}


def check_and_fire(data: dict, socketio) -> list:
    triggered = []

    # Ne pas générer de nouvelles alertes si le plafond est atteint
    if len(get_active()) >= MAX_ALERTES_ACTIVES:
        return triggered

    T   = data.get("T")
    P   = data.get("P")
    ecl = data.get("ecl")
    maintenant = datetime.now()

    if T is not None and T < Config.TEMP_MIN and _peut_emettre("temperature", maintenant):
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
            "timestamp":   maintenant.strftime("%Y-%m-%d %H:%M:%S"),
        }
        triggered.append(alert)
        socketio.emit("alerte", alert)

    if P is not None and P < Config.PRESSION_MIN and _peut_emettre("pression", maintenant):
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
            "timestamp":   maintenant.strftime("%Y-%m-%d %H:%M:%S"),
        }
        triggered.append(alert)
        socketio.emit("alerte", alert)

    if ecl == Config.ECLABOUSSURE_TRIGGER and _peut_emettre("eclaboussure", maintenant):
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
            "timestamp":   maintenant.strftime("%Y-%m-%d %H:%M:%S"),
        }
        triggered.append(alert)
        socketio.emit("alerte", alert)

    return triggered


def _peut_emettre(type_: str, maintenant: datetime) -> bool:
    derniere = _cooldowns.get(type_)
    if derniere and (maintenant - derniere).total_seconds() < COOLDOWN_SECONDES:
        return False
    _cooldowns[type_] = maintenant
    return True
