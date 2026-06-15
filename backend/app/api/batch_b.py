from fastapi import APIRouter

# ─── Layer 36: Data Security Posture Management (DSPM) ───────────────────────
dspm_router = APIRouter(prefix="/api/v2/dspm", tags=["DSPM"])

@dspm_router.get("/data-assets")
def get_data_assets():
    return {"data_assets": [
        {"id": "da-001", "type": "PII", "path": "s3://prod-bucket/users/", "exposure": "Public", "risk": "Critical"},
        {"id": "da-002", "type": "PHI", "path": "db://health-prod/patients", "exposure": "Internal", "risk": "High"},
        {"id": "da-003", "type": "PCI", "path": "db://payments/cards", "exposure": "Restricted", "risk": "Medium"},
        {"id": "da-004", "type": "Secrets", "path": ".env files in repo", "exposure": "Public", "risk": "Critical"},
    ]}

@dspm_router.get("/risk-score")
def get_data_risk_score():
    return {
        "overall_data_risk": 74,
        "pii_exposure_count": 12,
        "phi_exposure_count": 3,
        "pci_exposure_count": 5,
        "secrets_exposed": 2
    }

@dspm_router.get("/classification-report")
def get_classification_report():
    return {
        "total_scanned_gb": 2400,
        "classified_gb": 1800,
        "sensitive_data_gb": 340,
        "classification_coverage_pct": 75
    }

# ─── Layer 37: Identity Security Platform ────────────────────────────────────
identity_risk_router = APIRouter(prefix="/api/v2/identity-risk", tags=["Identity Security"])

@identity_risk_router.get("/users")
def get_identity_risks():
    return {"identities": [
        {"user": "svc-db-admin", "type": "Service Account", "risk": "Critical", "excess_perms": 42},
        {"user": "john.doe@corp.com", "type": "Privileged", "risk": "High", "excess_perms": 18},
        {"user": "ci-cd-pipeline", "type": "Machine Identity", "risk": "High", "excess_perms": 11},
    ]}

@identity_risk_router.get("/drift-report")
def get_drift_report():
    return {
        "permission_drifts_detected": 7,
        "accounts_with_excess_privileges": 14,
        "dormant_privileged_accounts": 3,
        "mfa_not_enabled": 5
    }

@identity_risk_router.get("/score")
def get_identity_score():
    return {"identity_risk_score": 68, "trend": "worsening", "critical_identities": 2}

# ─── Layer 38: Security Control Effectiveness ────────────────────────────────
control_effectiveness_router = APIRouter(prefix="/api/v2/control-effectiveness", tags=["Control Effectiveness"])

@control_effectiveness_router.get("/report")
def get_control_effectiveness():
    return {
        "overall_effectiveness_score": 79,
        "controls": [
            {"name": "Firewall", "effectiveness": 91, "gaps": 1},
            {"name": "Endpoint Detection", "effectiveness": 74, "gaps": 3},
            {"name": "SIEM Detection", "effectiveness": 82, "gaps": 2},
            {"name": "Incident Response", "effectiveness": 68, "gaps": 5},
            {"name": "Backup & Recovery", "effectiveness": 85, "gaps": 1},
        ],
        "recommendations": [
            "Tune SIEM rules to reduce false-negative rate",
            "Test IR playbooks against live simulation"
        ]
    }
