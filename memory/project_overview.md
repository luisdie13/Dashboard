---
name: project-overview
description: IoT Energy Monitoring Dashboard - architecture, stack, and known issues fixed
metadata:
  type: project
---

IoT Energy Monitoring Dashboard (Quinto Semestre - UI/UX).

**Stack:** Node.js + Express + Socket.io + PostgreSQL (backend), React + Recharts + socket.io-client (frontend), Docker Compose for full stack.

**Architecture:** Clean Architecture 4 layers — Domain models, Application services, Infrastructure (repositories + socketManager), Presentation (controllers + routes). Manual DI via route files.

**Why:** University project simulating real-time solar inverter monitoring with 5 fake nodes (NODE_1–NODE_5).

**How to apply:** When adding features, follow the existing 4-layer pattern. WebSocket emission always goes through `req.app.locals.socketManager` (never global variables — this is a requirement).

**Critical fixes applied (2026-07-03):**
- MetricController and NodeController now correctly emit WebSocket events after DB writes
- socketManager CORS fixed to handle comma-separated CORS_ORIGIN env var
- Dashboard.jsx useEffect split into two: socket setup (once) + data loading (on node change) — was leaking listeners and calling disconnect() on node change
- Added missing required filters: search by node ID/location (client-side) + Hoy/Ayer/Último Mes quick buttons
- App.jsx now falls back to MOCK_NODES if API is unavailable instead of showing error screen
- socketService now has off() method for proper listener cleanup
- Deleted empty backend/src/domain/interfaces/ directory
- Fixed PORT=4000 → PORT=3000 in backend/.env
- LogsTable key changed from index to composite nodo_id+timestamp+index
