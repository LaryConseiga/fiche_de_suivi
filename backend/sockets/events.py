from flask_socketio import SocketIO

def register_events(socketio: SocketIO):
    @socketio.on("connect")
    def on_connect():
        print("[WS] Client connecté")

    @socketio.on("disconnect")
    def on_disconnect():
        print("[WS] Client déconnecté")
