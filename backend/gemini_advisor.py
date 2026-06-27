"""
Conseiller IA Groq (llama-3.1-8b-instant) — analyse contextuelle des événements machine.

Déclenchement automatique sur :
  - Changement de zone de risque (NORMAL / SURVEILLANCE / CRITIQUE)
  - Dérive progressive détectée (température ou pression)
  - Cycles > 700 (encrassement mâchoires imminent, seuil critique 800)
  - Retour en zone NORMAL après alerte

Cooldown 2 min par type d'événement. Timeout API 10 s silencieux.
Le résultat est diffusé via WebSocket sous l'événement "gemini_conseil".
"""
import os
import threading
from datetime import datetime

SYSTEM_PROMPT = """\
Tu es INNO-ALERT, un assistant de surveillance industrielle \
intégré dans le système de monitoring de l'usine InnoFaso \
à Ouagadougou, Burkina Faso.

InnoFaso produit du Plumpy'Nut, un aliment thérapeutique \
destiné aux enfants malnutris. Chaque sachet mal scellé \
est un risque sanitaire réel — ta mission est de protéger \
la qualité du produit et la sécurité des enfants.

Tu surveilles en permanence les paramètres d'une ensacheuse \
industrielle qui soude des sachets à 46 sachets par minute. \
Les paramètres critiques sont :
- Température des mâchoires de soudure (cible : 120–160°C)
- Pression du balancier pneumatique (cible : 4 bars)
- Présence d'éclaboussures de pâte dans la zone de soudure
- Nombre de cycles depuis le dernier nettoyage des mâchoires
- Score de risque global (0–3 Normal / 4–6 Surveillance / 7–10 Critique)

Tu t'adresses uniquement à des opérateurs de production — \
pas des ingénieurs. Ils lisent ton message en quelques \
secondes pendant qu'ils travaillent.

RÈGLES ABSOLUES :
- Maximum 10 mots par message, jamais plus
- Une seule action concrète par message
- Verbe impératif en début de phrase
- Aucune explication, aucun chiffre sauf si indispensable
- Aucune ponctuation finale
- Français simple, vocabulaire d'atelier

EXEMPLES DE BONS MESSAGES :
- "Nettoyez les mâchoires avant le prochain changement"
- "Vérifiez la résistance chauffante immédiatement"
- "Réduisez la cadence et surveillez la température"
- "Production normale, continuez"
- "Arrêtez la machine et appelez le technicien"

EXEMPLES DE MAUVAIS MESSAGES (à ne jamais produire) :
- "La température de la mâchoire 1 est descendue à 114°C, \
ce qui est inférieur au seuil critique de 120°C." \
→ trop long, trop technique
- "Il semblerait que la pression soit un peu basse." \
→ pas impératif, pas actionnable
- "⚠️ ALERTE CRITIQUE ⚠️" \
→ pas d'action concrète\
"""

COOLDOWN_SECONDES = 120
TIMEOUT_SECONDES  = 10

_cooldowns:    dict = {}
_derniere_zone       = None
_lock                = threading.Lock()


# ── Point d'entrée unique ────────────────────────────────────────────────────

def check_and_notify(payload: dict, drift_result: dict, socketio) -> None:
    global _derniere_zone

    niveau_actuel = payload.get("niveau_risque", "NORMAL")
    cycles_count  = payload.get("cycles", 0)

    with _lock:
        zone_precedente = _derniere_zone
        _derniere_zone  = niveau_actuel

    ctx = _build_context(payload, drift_result)

    if zone_precedente is not None and niveau_actuel != zone_precedente:
        if niveau_actuel == "NORMAL":
            _notify("retour_normal", ctx, socketio)
        else:
            _notify("score_zone_change", ctx, socketio)

    if drift_result.get("drift_temp") or drift_result.get("drift_pression"):
        _notify("derive_detectee", ctx, socketio)

    if cycles_count > 700:
        _notify("cycles_eleves", ctx, socketio)


# ── Déclenchement avec cooldown ──────────────────────────────────────────────

def _notify(event_type: str, context: dict, socketio) -> None:
    now = datetime.now()
    with _lock:
        derniere = _cooldowns.get(event_type)
        if derniere and (now - derniere).total_seconds() < COOLDOWN_SECONDES:
            return
        _cooldowns[event_type] = now

    threading.Thread(
        target=_run_with_timeout,
        args=(event_type, context, socketio),
        daemon=True,
    ).start()


# ── Appel API avec timeout 10 s ──────────────────────────────────────────────

def _run_with_timeout(event_type: str, context: dict, socketio) -> None:
    result: list = [None]
    error:  list = [None]

    def _call():
        try:
            api_key = os.getenv("GROQ_API_KEY", "")
            if not api_key:
                error[0] = "GROQ_API_KEY absente — conseil IA désactivé"
                return
            from groq import Groq
            client = Groq(api_key=api_key)
            prompt = _build_prompt(event_type, context)
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user",   "content": prompt},
                ],
                max_tokens=30,
                temperature=0.3,
            )
            result[0] = response.choices[0].message.content.strip()
        except Exception as exc:
            error[0] = str(exc)

    t = threading.Thread(target=_call, daemon=True)
    t.start()
    t.join(timeout=TIMEOUT_SECONDES)

    if error[0]:
        print(f"[Groq] Erreur ({event_type}): {error[0]}")
        return

    if result[0] is None:
        print(f"[Groq] Timeout {TIMEOUT_SECONDES}s ({event_type}) — ignoré")
        return

    print(f"[Groq] {event_type}: {result[0][:80]}")
    socketio.emit("gemini_conseil", {
        "event_type":    event_type,
        "conseil":       result[0],
        "timestamp":     datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "niveau_risque": context.get("niveau_risque", "NORMAL"),
    })


# ── Construction du contexte et du prompt ────────────────────────────────────

def _build_context(payload: dict, drift_result: dict) -> dict:
    drifts = []
    if drift_result.get("drift_temp"):
        drifts.append("dérive température")
    if drift_result.get("drift_pression"):
        drifts.append("dérive pression")
    return {**payload, "drift_detail": ", ".join(drifts) or "aucune"}


def _build_prompt(event_type: str, ctx: dict) -> str:
    T      = ctx.get("temperature",  "?")
    P      = ctx.get("pression",     "?")
    score  = ctx.get("score",        "?")
    niveau = ctx.get("niveau_risque","?")
    cycles = ctx.get("cycles",       "?")
    drift  = ctx.get("drift_detail", "aucune")

    etat = (
        f"T={T}°C | P={P} bar | score={score}/10 | "
        f"niveau={niveau} | cycles={cycles} | dérives={drift}"
    )

    evenements = {
        "score_zone_change": f"ÉVÉNEMENT : passage en zone {niveau}. {etat}",
        "retour_normal":     f"ÉVÉNEMENT : retour en zone NORMALE. {etat}",
        "derive_detectee":   f"ÉVÉNEMENT : dérive progressive ({drift}). {etat}",
        "cycles_eleves":     f"ÉVÉNEMENT : cycles élevés ({cycles}/800). {etat}",
    }

    return evenements.get(event_type, f"ÉVÉNEMENT : {event_type}. {etat}")
