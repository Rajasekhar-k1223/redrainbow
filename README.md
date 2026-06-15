# RedRainbow Enterprise Cyber Defense Platform

RedRainbow is a world-class, multi-tenant enterprise cybersecurity platform designed to protect domains, web applications, APIs, servers, containers, cloud infrastructure, and endpoints. It features a modern, AI-driven architecture and a stunning glassmorphic UI.

## Core Capabilities
- **Mission Control Dashboard**: Real-time enterprise threat telemetry and active incident tracking.
- **Agent Mesh Architecture**: Asynchronous background scanning via Celery and Redis.
- **Generative AI Core**: Instantaneous, expert-level incident response strategies powered by Google Gemini 1.5.
- **SOAR Engine**: Security Orchestration, Automation, and Response playbooks capable of active defense (e.g., firewall integration).
- **Compliance Architecture**: Visual readiness mapping for CIS, SOC2, and ISO 27001.
- **Threat Intelligence**: Global adversary tracking and live CVE feeds.
- **Event Ingestion**: Webhook APIs to ingest and normalize alerts from the broader security ecosystem (Splunk, CrowdStrike, AWS).

## Tech Stack
- **Frontend**: React, TypeScript, Vite, TailwindCSS (Vanilla)
- **Backend**: FastAPI, Python 3.x, SQLAlchemy (SQLite/MySQL)
- **Asynchronous Workers**: Celery, Redis
- **AI Integration**: `google-generativeai` (Gemini API)

---

## 🚀 Quickstart Local Development Guide

Follow these steps to spin up the entire RedRainbow platform locally.

### 1. Database & Backend Setup

Open a terminal in the `backend` directory:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

Ensure your `.env` file is properly configured. A default `.env` is provided, but you must add your Gemini API key for the AI Core to function:
```env
DATABASE_URL=sqlite:///./redrainbow.db
SECRET_KEY=your_super_secret_jwt_key
ENVIRONMENT=development
GEMINI_API_KEY=your_gemini_api_key_here
```

Run database migrations and seed the initial enterprise data:
```powershell
alembic upgrade head
python scripts\seed_db.py
```

### 2. Start the Redis Broker
You will need a Redis instance running for the Celery worker to communicate with the FastAPI backend. You can easily start one using Docker:
```powershell
docker run -d -p 6379:6379 redis
```

### 3. Start the Agent Mesh (Celery Worker)
In a new terminal window, activate the virtual environment and start the Celery worker:
```powershell
cd backend
.\venv\Scripts\activate
celery -A app.worker worker --loglevel=info
```

### 4. Start the FastAPI Server
In another terminal, start the main backend server:
```powershell
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload
```
*The API will be available at `http://127.0.0.1:8000`*

### 5. Start the Frontend UI
Finally, in a new terminal, start the React application:
```powershell
cd frontend
npm install
npm run dev
```
*The UI will be available at `http://localhost:5173`*

---

## 🐳 Running with Docker Compose (Cloud-Ready)

To run the entire platform (Database, Redis, Worker, API, UI) in a production-ready containerized environment:

1. Ensure your `backend/.env` file contains your `GEMINI_API_KEY`.
2. From the root directory, build and launch the stack:
```powershell
docker-compose up --build -d
```
3. The platform will automatically wire together the internal networks.
   - Frontend UI: `http://localhost` (Port 80)
   - Backend API: `http://localhost:8000`

---

## 🔐 Default Credentials
Once the frontend is running, you will be redirected to the secure login gateway. Use the seeded Super Admin credentials to access the Mission Control Dashboard:

- **Username / Email**: `admin@acme.corp`
- **Password**: `Admin123!`

---
*Built with precision and security. Defense in depth.*
