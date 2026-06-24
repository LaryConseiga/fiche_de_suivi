"""
Simulateur de données capteurs — mode démo sans Arduino.

Génère des mesures réalistes pour tester toutes les fonctionnalités :
score de risque composite, détection de dérives, compteur de cycles, alertes.

Scénarios simulés automatiquement :
  - Fonctionnement normal (T 130–145°C, P ~4 bar)
  - Dérive descendante de température toutes les ~2 minutes
  - Chute de pression toutes les ~3 minutes
  - Gradient inter-mâchoires variable (parfois > 5°C → +2 pts score)
  - Éclaboussure simulée toutes les ~100 mesures
"""
import time
import math
import random
import threading

from models.mesure import insert_mesure
from models.score import insert_score
from risk_engine import calcul_score_risque
from drift_engine import detect_drift
from alert_engine import check_and_fire
import cycles
import gemini_advisor

_thread  = None
_running = False


def _boucle_simulation(socketio):
    global _running
    tick = 0
    print("[Simulator] ▶ Mode démo actif — simulation des capteurs (1 mesure/s)")

    while _running:
        tick += 1

        # ── Température (°C) ─────────────────────────────────────────────
        # Oscillation sinusoïdale autour de 137°C + bruit aléatoire
        T_base = 137 + 8 * math.sin(tick / 25)
        # Toutes les 2 min (120 ticks) : dérive descendante progressive sur 25 mesures
        # → fait monter le score et déclenche la détection de dérive
        phase_derive = tick % 120
        if 50 <= phase_derive < 75:
            T_base -= (phase_derive - 50) * 1.2
        T = round(T_base + random.uniform(-1.5, 1.5), 1)

        # Températures des deux mâchoires (gradient variable 0–9°C)
        # Un gradient > 5°C ajoute 2 points au score de risque
        gradient_val = abs(4 * math.sin(tick / 40) + random.uniform(-1, 3))
        T1 = round(T + gradient_val / 2, 1)
        T2 = round(T - gradient_val / 2, 1)

        # ── Pression (bar) ───────────────────────────────────────────────
        # Oscille autour de 4 bar ; chute toutes les ~3 min sur 20 mesures
        P_base = 4.0 + 0.25 * math.sin(tick / 18)
        phase_pression = tick % 180
        if 90 <= phase_pression < 110:
            P_base -= (phase_pression - 90) * 0.06
        P = round(max(P_base + random.uniform(-0.08, 0.08), 2.0), 2)

        # ── Éclaboussure ─────────────────────────────────────────────────
        # Simulée à tick 50, 150, 250 … (toutes les 100 mesures)
        ecl = 1 if (tick % 100 == 50) else 0

        # ── Humidité ambiante ────────────────────────────────────────────
        hr = round(52 + 8 * math.sin(tick / 70) + random.uniform(-1.5, 1.5), 1)

        data = {"T": T, "T1": T1, "T2": T2, "P": P, "ecl": ecl, "hr": hr}

        # ── Pipeline identique à serial_reader.py ───────────────────────
        insert_mesure(data)
        cycles.increment()

        score_result = calcul_score_risque(data, cycles.get_cycles())
        insert_score(score_result["score"], score_result["niveau"])

        drift_result = detect_drift(socketio)

        payload = {
            "temperature":    T,
            "pression":       P,
            "eclaboussure":   ecl,
            "humidite":       hr,
            "gradient":       round(abs(T1 - T2), 2),
            "score":          score_result["score"],
            "niveau_risque":  score_result["niveau"],
            "cycles":         cycles.get_cycles(),
            "drift_temp":     drift_result["drift_temp"],
            "drift_pression": drift_result["drift_pression"],
        }
        socketio.emit("mesure", payload)
        check_and_fire(data, socketio)

        # ── Conseil IA Gemini (non bloquant) ─────────────────────────────
        gemini_advisor.check_and_notify(payload, drift_result, socketio)

        time.sleep(1)   # cadence : 1 mesure par seconde


def start(socketio):
    global _thread, _running
    if _running:
        return
    _running = True
    _thread = threading.Thread(target=_boucle_simulation, args=(socketio,), daemon=True)
    _thread.start()


def stop():
    global _running
    _running = False
