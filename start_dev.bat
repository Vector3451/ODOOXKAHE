@echo off
REM ── Traveloop Dev Launcher (Windows) ─────────────────────────────────────
echo.
echo  Traveloop — Starting Development Environment
echo  ============================================
echo.

REM ── 1. Copy .env files if they don't exist ────────────────────────────────
if not exist "backend\.env" (
    echo [SETUP] Creating backend\.env from template...
    copy "backend\.env.example" "backend\.env" >nul
    echo [OK]    backend\.env created. Edit it to change JWT_SECRET_KEY.
) else (
    echo [OK]    backend\.env already exists.
)

if not exist ".env" (
    echo [SETUP] Creating .env from template...
    copy ".env.example" ".env" >nul
    echo [OK]    .env created.
) else (
    echo [OK]    .env already exists.
)

REM ── 2. Python virtual environment ─────────────────────────────────────────
if not exist "backend\venv" (
    echo.
    echo [SETUP] Creating Python virtual environment...
    python -m venv backend\venv
    echo [OK]    venv created.
)

echo [SETUP] Installing Python dependencies...
call backend\venv\Scripts\activate.bat
pip install -r backend\requirements.txt -q
echo [OK]    Python deps installed.

REM ── 3. Node deps ──────────────────────────────────────────────────────────
if not exist "node_modules" (
    echo.
    echo [SETUP] Installing Node.js dependencies...
    npm install
    echo [OK]    Node deps installed.
) else (
    echo [OK]    node_modules already present.
)

REM ── 4. Start backend in a new window ──────────────────────────────────────
echo.
echo [START] Launching Flask backend on http://localhost:5000 ...
start "Traveloop Backend" cmd /k "call backend\venv\Scripts\activate.bat && python backend\app.py"

REM ── 5. Give Flask 2 seconds to boot ──────────────────────────────────────
timeout /t 2 /nobreak >nul

REM ── 6. Start frontend ─────────────────────────────────────────────────────
echo [START] Launching Vite frontend on http://localhost:5173 ...
echo.
echo  Both servers are running. Open http://localhost:5173 in your browser.
echo  Press Ctrl+C here to stop the frontend. Close the other window to stop the backend.
echo.
npm run dev
