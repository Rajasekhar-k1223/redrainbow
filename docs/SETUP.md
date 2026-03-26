# Setup Guide

## 1. Environment
- Copy `.env.example` to `.env` and fill values.
- Ensure MySQL, MongoDB, and Redis are reachable.

## 2. Backend
```powershell
cd C:\Rajasekhar\RedRainbow\backend
python -m pip install -r ..\backend\requirements.txt
python -m pip install -r ..\backend\requirements-dev.txt
$env:PYTHONPATH="C:\Rajasekhar\RedRainbow\backend"
python -m alembic -c ..\alembic.ini upgrade head
python -m uvicorn app.main:app --reload --port 8080
```

## 3. Frontend
```powershell
cd C:\Rajasekhar\RedRainbow\frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

## 4. Health Checks
- Backend: `http://localhost:8080/health`
- Redis: `http://localhost:8080/health/redis`
- Mongo: `http://localhost:8080/health/mongo`
