#!/usr/bin/env bash
# ── Traveloop Dev Launcher (macOS / Linux) ───────────────────────────────
set -e
cd "$(dirname "$0")"

echo ""
echo " Traveloop — Starting Development Environment"
echo " ============================================"
echo ""

# ── 1. Copy .env files if they don't exist ──────────────────────────────────
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "[SETUP] Created backend/.env — edit JWT_SECRET_KEY before deploying."
else
    echo "[OK]    backend/.env already exists."
fi

if [ ! -f .env ]; then
    cp .env.example .env
    echo "[SETUP] Created .env"
else
    echo "[OK]    .env already exists."
fi

# ── 2. Python virtual environment ───────────────────────────────────────────
if [ ! -d backend/venv ]; then
    echo "[SETUP] Creating Python virtual environment..."
    python3 -m venv backend/venv
fi

echo "[SETUP] Installing Python dependencies..."
source backend/venv/bin/activate
pip install -r backend/requirements.txt -q
echo "[OK]    Python deps installed."

# ── 3. Node deps ────────────────────────────────────────────────────────────
if [ ! -d node_modules ]; then
    echo "[SETUP] Installing Node.js dependencies..."
    npm install
fi

# ── 4. Start both servers concurrently ──────────────────────────────────────
echo ""
echo "[START] Launching Flask backend on http://localhost:5000 ..."
echo "[START] Launching Vite frontend on http://localhost:5173 ..."
echo ""
echo "  Press Ctrl+C to stop both servers."
echo ""

# Run both in background, kill both on Ctrl+C
trap 'kill 0' INT

(source backend/venv/bin/activate && python backend/app.py) &
npm run dev &

wait
