import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "innofaso-secret-2024")
    DATABASE_PATH = os.getenv("DATABASE_PATH", "innofaso.db")

    SERIAL_PORT = os.getenv("SERIAL_PORT", "COM3")
    SERIAL_BAUD = int(os.getenv("SERIAL_BAUD", "9600"))

    # Mettre DEMO_MODE=true pour activer la simulation sans Arduino
    DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"

    # Seuils d'alerte
    TEMP_MIN = 120.0
    PRESSION_MIN = 3.5
    ECLABOUSSURE_TRIGGER = 1

    # CORS_ORIGINS=*            → tout autoriser (dev/demo)
    # CORS_ORIGINS=https://a.vercel.app,https://b.vercel.app → liste
    _cors_env = os.getenv("CORS_ORIGINS", "")
    if _cors_env == "*":
        CORS_ORIGINS = "*"
    elif _cors_env:
        CORS_ORIGINS = [o.strip() for o in _cors_env.split(",") if o.strip()]
    else:
        CORS_ORIGINS = ["http://localhost:5173", "http://localhost:3000"]
