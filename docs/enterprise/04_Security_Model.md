# RedRainbow Security Model & Identity Architecture

## 1. Authentication (AuthN)
- **Primary Auth:** OAuth2 with OpenID Connect (OIDC) support for enterprise IdPs (Okta, Azure AD, PingIdentity).
- **Session Management:** Short-lived JWTs (15m) with HTTP-only, secure Refresh Tokens (7d).
- **MFA:** Enforced Multi-Factor Authentication (TOTP via Authenticator apps, WebAuthn/FIDO2).
- **Directory Integration:** LDAP and Active Directory Sync via the Auth Service.

## 2. Authorization (AuthZ)

### Multi-Tenancy (Tenant Isolation)
Every database query and API request is scoped by a mandatory `tenant_id`. Cross-tenant data access is physically and logically blocked except for the `Super Admin` role.

### Role-Based Access Control (RBAC)
- **Super Admin:** Global access, tenant management, and system-wide configuration.
- **Security Admin:** Full configuration rights within a specific tenant (manage users, assets, SOAR playbooks).
- **SOC Analyst:** Can view dashboards, manage incidents, acknowledge alerts, and trigger non-destructive SOAR actions.
- **Threat Hunter:** Can query raw telemetry in OpenSearch, run custom scans, and access the Evidence Vault.
- **Incident Responder:** Can trigger high-privilege SOAR playbooks (e.g., Block IP) with approval workflows.
- **Auditor:** Read-only access to compliance reports, architecture docs, and Evidence Vault metadata.
- **Viewer:** Read-only access to high-level dashboards.

### Attribute-Based Access Control (ABAC)
Fine-grained access based on asset tags. E.g., A SOC Analyst might only have access to view incidents for assets tagged `environment:production`.

## 3. Platform Security Principles
- **Defensive Only:** No offensive payload deployment. Scanners only utilize safe, non-destructive validation checks.
- **Authorized Scanning:** Scans cannot be executed against unverified assets. Domain ownership (via DNS TXT record) or Agent installation is required prior to scanning.
- **Audit Logging:** Every state-changing API request is logged immutably to the `audit_records` table and shipped to the SIEM.
