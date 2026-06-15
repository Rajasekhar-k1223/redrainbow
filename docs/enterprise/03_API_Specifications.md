# RedRainbow API Specifications

The platform utilizes a FastAPI-based API Gateway pattern to route traffic to underlying microservices. All APIs require a valid JWT bearer token.

## Global Headers
- `Authorization`: Bearer `<JWT>`
- `X-Tenant-ID`: `<Tenant-UUID>` (Required for multi-tenancy enforcement)

---

## 1. Auth Service
Handles identity, sessions, and RBAC.

- `POST /api/v1/auth/login`: Authenticate and return JWT.
- `POST /api/v1/auth/mfa/verify`: Verify MFA token.
- `GET /api/v1/auth/me`: Get current user profile and permissions.
- `POST /api/v1/auth/sso/saml`: SAML SSO assertion endpoint.

## 2. Asset Service
Manages the inventory of domains, servers, containers, and cloud accounts.

- `GET /api/v1/assets`: List assets (supports filtering by `asset_type`, `tags`).
- `POST /api/v1/assets`: Register a new asset (requires authorization).
- `GET /api/v1/assets/{id}`: Get asset details and current risk score.
- `PUT /api/v1/assets/{id}`: Update asset metadata (e.g., criticality, owner).
- `DELETE /api/v1/assets/{id}`: Remove an asset.

## 3. Scan & Threat Service
Orchestrates the Security Agent Mesh and retrieves findings.

- `POST /api/v1/scans/schedule`: Trigger a new scan for an asset. Payload defines scan type (e.g., OWASP ZAP, Nmap).
- `GET /api/v1/scans/{id}/status`: Check the status of a Celery worker executing a scan.
- `GET /api/v1/findings`: Retrieve vulnerabilities and security findings across assets.
- `GET /api/v1/threats/iocs`: Query the Threat Intelligence integration for known IOCs.

## 4. Incident & SOAR Service
Manages security incidents and automated playbooks.

- `GET /api/v1/incidents`: List active security incidents.
- `POST /api/v1/incidents`: Manually create an incident.
- `POST /api/v1/soar/playbooks/{id}/execute`: Trigger a SOAR playbook (e.g., Block IP, Quarantine Endpoint).
- `POST /api/v1/soar/actions/approve`: Approve a high-risk SOAR action (e.g., Shutdown VM).

## 5. Telemetry & Monitorix Service (WebSockets)
Handles real-time data streaming from agents.

- `WS /ws/v1/telemetry`: WebSocket endpoint for the Mission Control UI to consume live CPU/RAM/Network events.
- `POST /api/v1/monitorix/heartbeat`: Endpoint for Monitorix agents to check-in.
- `POST /api/v1/monitorix/ingest`: Bulk ingestion of offline buffered telemetry data.

## 6. AI Copilot Service (SentinelX)
Interfaces with the AI SOC capabilities.

- `POST /api/v1/ai/summarize/incident/{id}`: Generate an AI summary of an incident and its root cause.
- `POST /api/v1/ai/recommendations`: Request AI-driven remediation steps for a specific finding.
- `POST /api/v1/ai/ask`: Chat interface for the AI Security Intelligence Copilot.
