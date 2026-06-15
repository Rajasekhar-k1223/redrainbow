from sqlalchemy.orm import Session
from app.models.siem import SiemLog
from app.models.incident import Incident

def calculate_compliance_report(db: Session, tenant_id: str):
    """
    Dynamically calculates compliance readiness scores based on active telemetry.
    Maps active incidents and critical SIEM logs to framework controls.
    """
    
    # 1. Fetch active telemetry
    active_incidents = db.query(Incident).filter(Incident.tenant_id == tenant_id, Incident.status == 'Open').all()
    recent_critical_logs = db.query(SiemLog).filter(SiemLog.tenant_id == tenant_id, SiemLog.severity == 'CRITICAL').limit(10).all()
    
    # Base scores start at 100
    scores = {
        "CIS": 100,
        "SOC2": 100,
        "ISO": 100
    }
    
    violations = []
    
    # Map Incidents to Frameworks
    for inc in active_incidents:
        title = inc.title.lower()
        if "s3" in title or "public" in title or "storage" in title:
            scores["SOC2"] -= 15
            violations.append({
                "id": f"inc-{inc.id}",
                "framework": "SOC2",
                "control": "CC6.1 - Logical Access",
                "asset": inc.asset_id or "Cloud Environment",
                "issue": inc.title,
                "severity": inc.severity
            })
        elif "port" in title or "ssh" in title or "firewall" in title:
            scores["CIS"] -= 20
            violations.append({
                "id": f"inc-{inc.id}",
                "framework": "CIS",
                "control": "Control 4 - Secure Configuration",
                "asset": inc.asset_id or "Network Asset",
                "issue": inc.title,
                "severity": inc.severity
            })
        else:
            scores["ISO"] -= 10
            violations.append({
                "id": f"inc-{inc.id}",
                "framework": "ISO",
                "control": "A.12.2.1 - Malware Protection",
                "asset": inc.asset_id or "Endpoint",
                "issue": inc.title,
                "severity": inc.severity
            })

    # Map SIEM Logs
    for log in recent_critical_logs:
        if "auth" in log.event_type.lower() or "login" in log.event_type.lower():
            scores["SOC2"] -= 5
            violations.append({
                "id": f"log-{log.id}",
                "framework": "SOC2",
                "control": "CC6.2 - User Authentication",
                "asset": log.source_ip or "Identity Provider",
                "issue": log.message or "Authentication Failure Burst",
                "severity": "High"
            })

    # Ensure scores don't drop below 0
    for k in scores:
        if scores[k] < 0:
            scores[k] = 0

    # Build Frameworks payload
    def get_status(score):
        if score >= 90: return "Excellent"
        if score >= 75: return "Good"
        if score >= 60: return "Attention Needed"
        return "At Risk"

    frameworks = [
        {"id": "cis", "name": "CIS Critical Security Controls", "score": scores["CIS"], "status": get_status(scores["CIS"])},
        {"id": "soc2", "name": "SOC2 Type II", "score": scores["SOC2"], "status": get_status(scores["SOC2"])},
        {"id": "iso", "name": "ISO 27001", "score": scores["ISO"], "status": get_status(scores["ISO"])}
    ]

    return {
        "frameworks": frameworks,
        "violations": violations
    }
