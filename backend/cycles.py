"""
Compteur de cycles de soudure depuis le dernier nettoyage des mâchoires.
Un cycle correspond à la production d'un sachet (46 sachets/minute en régime nominal).
Au-delà de 800 cycles, l'encrassement augmente le risque de microfuite.
"""

_cycles = 0


def get_cycles() -> int:
    """Retourne le nombre de cycles effectués depuis le dernier nettoyage."""
    return _cycles


def increment():
    """Incrémente le compteur d'un cycle à chaque sachet produit."""
    global _cycles
    _cycles += 1


def reset() -> int:
    """
    Remet le compteur à zéro après nettoyage des mâchoires.
    Retourne la valeur finale avant remise à zéro (pour l'enregistrement en base).
    """
    global _cycles
    valeur_finale = _cycles
    _cycles = 0
    return valeur_finale
