# GameDealX AI – Frontend

## Overview
This is the Vite + React + TypeScript front‑end for **GameDealX AI**, a cyber‑punk themed game‑deal aggregator.

## Prerequisites
- Node.js (v20 or later) and npm installed on your machine.
- The backend Flask API must be running (see the `backend/README.md` for details). By default it listens on `http://127.0.0.1:5000`.

## Quick start (development server)
```powershell
# From the project root
cd frontend

# Install dependencies
npm install

# Launch the dev server
npm run dev
```
The app will be available at `http://localhost:3000` and will automatically proxy API requests to the backend.

## Production build
```powershell
npm run build
```
The static files are emitted to the `dist/` folder. You can serve them with any static‑file server (e.g., `npx serve dist`).

## Scripts
- `dev` – Starts Vite dev server with hot‑module replacement.
- `build` – Generates an optimized production bundle.
- `preview` – Locally preview the production bundle.

## Styling
The UI uses **Tailwind CSS** with a dark neon/glassmorphism theme and **Framer Motion** for micro‑animations. All colors are defined in `tailwind.config.js` for easy tweaking.

## Testing the integration
1. Ensure the backend is running (`python app.py` in `backend/`).
2. Open `http://localhost:3000` in your browser.
3. You should see the cyber‑punk dashboard showing game cards, filters, and real‑time deal notifications.

---
*If you prefer to run everything with Docker, see the root `docker-compose.yml` (Docker Desktop is required).*
