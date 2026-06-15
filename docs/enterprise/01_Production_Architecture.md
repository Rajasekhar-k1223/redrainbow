# RedRainbow Production Architecture

## 1. High-Level Enterprise Architecture

RedRainbow is a multi-tenant, cloud-ready, and self-hosted centralized Cyber Defense Platform. The architecture is designed to scale horizontally across 17 functional layers, ensuring robust defensive security capabilities without offensive automation or unauthorized scanning. 

### Multi-Tenant Model
- **Logical Isolation:** Tenants (Business Units or Customers) are isolated at the database level using Tenant IDs.
- **Data Governance:** All telemetry, incidents, and scan results are strictly tagged with the respective `tenant_id`.
- **Role-Based Access:** Global Admins can oversee all tenants, while Security Admins and SOC Analysts are restricted to specific tenants.

### High-Availability (HA) Design
- **Frontend (Layer 1):** Deployed via CDN or Load Balanced Nginx containers.
- **API Gateway & Control Plane (Layer 3):** Horizontally scaled FastAPI instances behind a Layer 7 Load Balancer.
- **Worker Nodes (Layer 9):** Celery workers auto-scaling based on queue depth in Redis.
- **Databases:** MySQL (Primary/Replica clustering), MongoDB (Replica Sets), and OpenSearch (Clustered Nodes).

## 2. The 17-Layer Architecture Overview

1. **Mission Control UI:** React/Vite dashboard with WebSockets for real-time telemetry.
2. **Identity & Access Security:** JWT/MFA/RBAC with SSO/LDAP integration.
3. **API Gateway & Control Plane:** FastAPI/Celery routing traffic to microservices.
4. **Asset Inventory:** Centralized storage of domains, IPs, containers, and cloud accounts.
5. **Domain Security:** DNS/DNSSEC/SPF/DKIM/DMARC monitoring.
6. **Web Application Security:** OWASP Top 10 detection and SSL analysis.
7. **Server Security:** Configuration drift and patch monitoring for Linux/Windows.
8. **Monitorix Integration:** Native SDK for endpoint telemetry.
9. **Security Agent Mesh:** Containerized workers (Nmap, ZAP, Trivy, REMnux).
10. **Container & Kubernetes Security:** Runtime threat detection and CIS validation.
11. **Cloud Security:** AWS/Azure/GCP IAM and configuration review.
12. **Threat Intelligence:** MITRE ATT&CK, CVE, NVD, MISP integration.
13. **SIEM:** OpenSearch-backed event normalization and correlation.
14. **SentinelX AI:** Alert correlation and automated SOC analysis.
15. **SOAR:** Automated defensive actions (Quarantine, Revoke).
16. **Evidence Vault:** Immutable storage with hash verification for forensics.
17. **Compliance:** Automated mapping to ISO 27001, SOC 2, HIPAA, PCI DSS.

## 3. Core Execution Flow

```text
Operator
  → Mission Control UI
  → API Gateway (Validation & Auth)
  → Asset Validation
  → Scan Scheduler (Celery/Redis)
  → Security Agent Mesh (Workers)
  → Telemetry Collection (MongoDB)
  → SIEM Correlation (OpenSearch)
  → SentinelX AI Analysis
  → Incident Generation (MySQL)
  → SOAR Actions
  → Evidence Vault (Immutable)
  → Compliance Reporting
```
