# Architecture Overview

## Components
- React frontend (web UI)
- FastAPI backend (API services)
- MySQL (relational data)
- MongoDB (logs/events/analytics)

## Data Flow
1. User interacts with React UI.
2. UI sends requests to FastAPI API.
3. API reads/writes MySQL for critical relational data.
4. API writes logs/events to MongoDB.

## Trust Boundaries
- Public: React UI
- Protected: API layer
- Private: Databases and internal services

## Security Baseline
- TLS everywhere
- RBAC/ABAC authorization
- Private DB networks
- Centralized logging
