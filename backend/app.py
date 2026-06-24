import eventlet
eventlet.monkey_patch()

from dotenv import load_dotenv
load_dotenv()

import os
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS

from config import Config
from models.database import init_db
from routes.data import bp as data_bp
from routes.history import bp as history_bp
from routes.alerts import bp as alerts_bp
from routes.export import bp as export_bp
from routes.nettoyage import bp as nettoyage_bp
from routes.fuite import bp as fuite_bp
from sockets.events import register_events
import serial_reader

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, origins=Config.CORS_ORIGINS)
socketio = SocketIO(app, cors_allowed_origins=Config.CORS_ORIGINS, async_mode="eventlet")

app.register_blueprint(data_bp)
app.register_blueprint(history_bp)
app.register_blueprint(alerts_bp)
app.register_blueprint(export_bp)
app.register_blueprint(nettoyage_bp)
app.register_blueprint(fuite_bp)

register_events(socketio)

# Initialisation au démarrage — fonctionne avec python app.py ET gunicorn
init_db()
serial_reader.start(socketio)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port, debug=False, allow_unsafe_werkzeug=True)
