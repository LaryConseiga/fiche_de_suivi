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

    # En production : CORS_ORIGINS=https://your-app.vercel.app
    _cors_env = os.getenv("CORS_ORIGINS", "")
    CORS_ORIGINS = (
        [o.strip() for o in _cors_env.split(",") if o.strip()]
        if _cors_env
        else ["http://localhost:5173", "http://localhost:3000"]
    )
