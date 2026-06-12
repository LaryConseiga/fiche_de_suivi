# InnoFaso — Fiche de Suivi Micro-Fuites

## Lancer le projet

### Backend (Flask)
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Écoute sur **http://localhost:5000**

> Avant de brancher l'Arduino, modifie `SERIAL_PORT` dans `backend/config.py`
> (ex: `COM3` sur Windows, `/dev/ttyUSB0` sur Linux).

---

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
Ouvre **http://localhost:5173**

---

## Architecture

```
fiche_de_suivi/
├── backend/
│   ├── app.py               # Entrée Flask + SocketIO
│   ├── config.py            # Ports, seuils, secrets
│   ├── serial_reader.py     # Thread lecture Arduino
│   ├── alert_engine.py      # Vérification des seuils
│   ├── models/
│   │   ├── database.py      # Init SQLite + contexte
│   │   ├── mesure.py        # CRUD mesures
│   │   └── alerte.py        # CRUD alertes
│   ├── routes/
│   │   ├── data.py          # GET /data
│   │   ├── history.py       # GET /history + GET /history/range
│   │   ├── alerts.py        # GET /alerts + PATCH /alerts/:id/resolve
│   │   └── export.py        # GET /export (CSV)
│   └── sockets/
│       └── events.py        # Événements WebSocket connect/disconnect
│
└── frontend/
    └── src/
        ├── types/           # Interfaces TypeScript (Mesure, Alerte)
        ├── services/        # api.ts (axios) + socket.ts (socket.io)
        ├── hooks/           # useWebSocket, useSensorData, useAlerts
        ├── store/           # Zustand : sensorStore + alertStore
        ├── components/
        │   ├── layout/      # Header (logo + statut) + Sidebar (nav)
        │   ├── gauges/      # GaugeCard SVG semi-circulaire
        │   ├── charts/      # TemperatureChart + PressureChart (Recharts)
        │   └── alerts/      # AlertBadge + AlertPanel
        └── pages/
            ├── Dashboard.tsx  # Jauges + alertes actives + courbes 8h
            ├── History.tsx    # Courbes avec filtre période/plage
            ├── Alerts.tsx     # Tableau complet des alertes
            └── Reports.tsx    # Export CSV par période ou plage
```

## Palette couleurs InnoFaso

| Rôle              | Hex       |
|-------------------|-----------|
| Vert principal    | `#2D7A3A` |
| Vert clair feuille| `#6AAF3D` |
| Or / drapeau BF   | `#F5A623` |
| Rouge alerte / BF | `#C62828` |
| Fond général      | `#F2F8F3` |
