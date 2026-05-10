# Traveloop ✈️

A full-stack travel planning application — React + Vite frontend, Flask backend, SQLite database.

---

## Prerequisites

| Tool | Minimum Version | Check |
|------|----------------|-------|
| **Python** | 3.10+ | `python --version` |
| **Node.js** | 18+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **Git** | any | `git --version` |

---

## Quick Start (any OS)

### Windows
```bat
git clone https://github.com/Vector3451/ODOOXKAHE.git
cd ODOOXKAHE
start_dev.bat
```
Double-click `start_dev.bat` or run it in a terminal. It will:
1. Create `backend/.env` and `.env` from the included templates
2. Create a Python virtual environment in `backend/venv/`
3. Install all Python and Node.js dependencies
4. Boot the Flask backend and the Vite dev server

### macOS / Linux
```bash
git clone https://github.com/Vector3451/ODOOXKAHE.git
cd ODOOXKAHE
chmod +x start_dev.sh
./start_dev.sh
```

Once both servers are running, open **http://localhost:5173** in your browser.

---

## Manual Setup (step-by-step)

### Backend

```bash
# 1. Create & activate virtual environment
python -m venv backend/venv

# Windows
backend\venv\Scripts\activate

# macOS / Linux
source backend/venv/bin/activate

# 2. Install Python dependencies
pip install -r backend/requirements.txt

# 3. Copy the environment template
cp backend/.env.example backend/.env
# Then edit backend/.env and set a strong JWT_SECRET_KEY

# 4. Start the Flask server
python backend/app.py
# Runs on http://localhost:5000
# Auto-creates dev.db and seeds sample data on first run
```

### Frontend

```bash
# 1. Install Node.js dependencies
npm install

# 2. Copy the environment template
cp .env.example .env
# VITE_API_URL defaults to http://localhost:5000/api — change if needed

# 3. Start the dev server
npm run dev
# Runs on http://localhost:5173
```

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET_KEY` | `dev-insecure-key-change-before-deploy` | **Must change in production** — use `python -c "import secrets; print(secrets.token_hex(32))"` |
| `DATABASE_URL` | `sqlite:///dev.db` | SQLite (dev) or PostgreSQL/MySQL URI (prod) |
| `FLASK_ENV` | `development` | Set to `production` to disable debug mode |
| `CORS_ORIGINS` | `*` | Comma-separated allowed origins, e.g. `http://localhost:5173` |

### Frontend — `.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend API base URL |

---

## Project Structure

```
ODOOXKAHE/
├── backend/
│   ├── app.py              # Flask application entry point
│   ├── models.py           # SQLAlchemy models (schema v4)
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Backend env template (safe to commit)
│   └── routes/
│       ├── auth.py         # /api/auth  — register, login, profile
│       ├── trips.py        # /api/trips — CRUD + expenses
│       ├── cities.py       # /api/cities
│       ├── community.py    # /api/community
│       ├── admin.py        # /api/admin — analytics (admin role)
│       └── ai.py           # /api/ai   — AI itinerary generator
├── src/
│   ├── lib/api.ts          # Unified API client
│   └── routes/             # React page components
├── .env.example            # Frontend env template (safe to commit)
├── start_dev.bat           # One-click launcher — Windows
├── start_dev.sh            # One-click launcher — macOS / Linux
├── package.json            # Node.js dependencies
└── trip_planner_schema_v4.sql  # Reference SQL schema (documentation)
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Get JWT token |
| GET | `/api/auth/profile` | JWT | Get current user |
| PUT | `/api/auth/profile` | JWT | Update profile |
| POST | `/api/auth/logout` | JWT | Invalidate session |
| GET | `/api/trips/` | JWT | List user trips |
| POST | `/api/trips/` | JWT | Create trip |
| GET | `/api/trips/:id` | JWT | Get trip details |
| PATCH | `/api/trips/:id` | JWT | Update trip |
| DELETE | `/api/trips/:id` | JWT | Delete trip |
| GET | `/api/trips/:id/expenses` | JWT | List expenses |
| POST | `/api/trips/:id/expenses` | JWT | Add expense |
| GET | `/api/cities/` | — | List cities |
| GET | `/api/cities/search?q=` | — | Search cities |
| GET | `/api/community/posts` | — | List community posts |
| POST | `/api/community/posts` | JWT | Create post |
| GET | `/api/admin/analytics` | JWT (admin) | Dashboard analytics |
| POST | `/api/ai/generate` | JWT | Generate AI itinerary |
| GET | `/api/stats` | — | Public platform stats |

---

## Database

- **Development**: SQLite (`dev.db`) — zero-setup, auto-created on first run
- **Production**: Set `DATABASE_URL` in `backend/.env` to a PostgreSQL or MySQL URI
- The database is **auto-migrated** via SQLAlchemy's `create_all()` on startup
- Seed data (2 users, 3 trips, 4 cities, 2 posts, 4 expenses) is inserted automatically on first boot

> `dev.db` is git-ignored — every developer gets a fresh local database.

---

## Default Credentials (seed data)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@traveloop.io` | `admin123` |
| Client | `client@traveloop.io` | `client123` |

> Change these immediately in any shared or production environment.

---

## Switching to PostgreSQL / MySQL (Production)

1. Install the driver:
   ```bash
   pip install psycopg2-binary   # PostgreSQL
   # or
   pip install pymysql           # MySQL
   ```
2. Set `DATABASE_URL` in `backend/.env`:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/traveloop
   ```
3. Restart the backend — `create_all()` will create all tables automatically.

---

## Built With

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, TanStack Router/Query |
| UI | Tailwind CSS v4, Radix UI, shadcn/ui |
| Charts | Recharts |
| Maps | Leaflet + react-leaflet |
| Backend | Flask 3, Flask-JWT-Extended, Flask-SQLAlchemy |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT (access token in localStorage) |
