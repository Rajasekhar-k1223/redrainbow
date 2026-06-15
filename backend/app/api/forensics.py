from fastapi import APIRouter, Header, HTTPException
import uuid

router = APIRouter(prefix="/api/v1/forensics", tags=["Digital Forensics"])

@router.get("/cases")
def list_forensic_cases(x_tenant_id: str = Header(...)):
    """Fetches active digital forensic investigations and timeline events."""
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="Tenant ID is required")
        
    # Mock data for MVP. In production, this would query a MongoDB `forensic_metadata` collection.
    cases = [
        {
            "id": "CASE-" + str(uuid.uuid4())[:8],
            "title": "Data Exfiltration via DNS Tunneling",
            "status": "Active Investigation",
            "assigned_to": "DFIR-Team-Alpha",
            "artifacts_collected": 12,
            "timeline": [
                {"time": "2026-06-08T09:00:00Z", "event": "Large outbound DNS queries detected on core-db-prod"},
                {"time": "2026-06-08T09:15:00Z", "event": "Memory dump initiated (Volatility)"},
                {"time": "2026-06-08T10:30:00Z", "event": "Malicious beaconing artifact extracted to Vault"}
            ]
        },
        {
            "id": "CASE-" + str(uuid.uuid4())[:8],
            "title": "Ransomware Initial Access - Phishing",
            "status": "Closed",
            "assigned_to": "SOC-Tier-3",
            "artifacts_collected": 5,
            "timeline": [
                {"time": "2026-06-05T14:22:00Z", "event": "Malicious macro executed on user workstation"},
                {"time": "2026-06-05T15:00:00Z", "event": "Endpoint isolated by Monitorix agent"}
            ]
        }
    ]
    return cases
