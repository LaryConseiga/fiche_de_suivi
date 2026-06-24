import json
import threading
import serial
from config import Config
from models.mesure import insert_mesure
from models.score import insert_score
from alert_engine import check_and_fire
from risk_engine import calcul_score_risque
from drift_engine import detect_drift
import cycles
import gemini_advisor

_thread  = None
_running = False


def _read_loop(socketio):
    global _running
    try:
        ser = serial.Serial(Config.SERIAL_PORT, Config.SERIAL_BAUD, timeout=1)
    except serial.SerialException as e:
        print(f"[SerialReader] Impossible d'ouvrir {Config.SERIAL_PORT}: {e}")
        _running = False
        # Basculer automatiquement en simulation si DEMO_MODE est activé
        if Config.DEMO_MODE:
            print("[SerialReader] Bascule en mode simulation (DEMO_MODE=true)")
            import simulator
            simulator.start(socketio)
        return

    print(f"[SerialReader] Écoute sur {Config.SERIAL_PORT} @ {Config.SERIAL_BAUD} bauds")
    while _running:
        try:
            line = ser.readline().decode("utf-8", errors="ignore").strip()
            if not line:
                continue

            data = json.loads(line)

            # ── 1. Persistance ───────────────────────────────────────────────
            insert_mesure(data)
            cycles.increment()   # chaque mesure = 1 sachet produit

            # ── 2. Score de risque composite ────────────────────────────────
            score_result = calcul_score_risque(data, cycles.get_cycles())
            insert_score(score_result["score"], score_result["niveau"])

            # ── 3. Détection de dérives progressives ─────────────────────────
            drift_result = detect_drift(socketio)

            # ── 4. Gradient inter-mâchoires pour le payload ─────────────────
            T1 = data.get("T1", data.get("T"))
            T2 = data.get("T2", data.get("T"))
            gradient = round(abs(T1 - T2), 2) if T1 is not None and T2 is not None else None

            # ── 5. Payload enrichi vers le frontend ──────────────────────────
            # Traduit les clés Arduino brutes (T, P, ecl, hr) en noms de champs métier
            # et ajoute les nouvelles variables calculées (score, cycles, dérives)
            payload = {
                "temperature":    data.get("T"),
                "pression":       data.get("P"),
                "eclaboussure":   data.get("ecl"),
                "humidite":       data.get("hr"),
                "gradient":       gradient,
                "score":          score_result["score"],
                "niveau_risque":  score_result["niveau"],
                "cycles":         cycles.get_cycles(),
                "drift_temp":     drift_result["drift_temp"],
                "drift_pression": drift_result["drift_pression"],
            }
            socketio.emit("mesure", payload)

            # ── 6. Alertes de seuil (comportement inchangé) ──────────────────
            check_and_fire(data, socketio)

            # ── 7. Conseil IA Gemini (non bloquant) ──────────────────────────
            gemini_advisor.check_and_notify(payload, drift_result, socketio)

        except json.JSONDecodeError:
            pass
        except Exception as e:
            print(f"[SerialReader] Erreur: {e}")

    ser.close()


def start(socketio):
    global _thread, _running
    if _running:
        return
    _running = True
    _thread = threading.Thread(target=_read_loop, args=(socketio,), daemon=True)
    _thread.start()


def stop():
    global _running
    _running = False
