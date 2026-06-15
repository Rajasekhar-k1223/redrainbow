from datetime import datetime
import random

def analyze_cloud_posture(account_id: str):
    """
    Simulates a Cloud Security Posture Management (CSPM) scan.
    In a real implementation, this would use boto3 (AWS), google-cloud-sdk (GCP),
    or azure-identity to pull live API states.
    """
    risk_score = 0
    issues = []
    
    # We'll use a deterministic seed based on the account_id so the same account 
    # yields the same "simulated" vulnerabilities each time for demo consistency.
    random.seed(account_id)
    
    # 1. IAM Misconfigurations Check
    has_root_keys = random.choice([True, False])
    wildcard_policies = random.randint(0, 3)
    
    if has_root_keys:
        risk_score += 40
        issues.append("CRITICAL: Root API Keys exist for the cloud account. Delete them immediately.")
        
    if wildcard_policies > 0:
        risk_score += 20
        issues.append(f"HIGH: Found {wildcard_policies} IAM policies granting wildcard '*' admin permissions.")
        
    # 2. Public Storage (S3 / Blob) Check
    public_buckets = random.randint(0, 2)
    if public_buckets > 0:
        risk_score += 35
        issues.append(f"CRITICAL: Found {public_buckets} public storage buckets (S3/Blob). Data exposure risk.")
        
    # 3. Security Group / Firewall Check
    open_sgs = random.randint(0, 4)
    if open_sgs > 0:
        risk_score += 15
        issues.append(f"WARNING: Found {open_sgs} Security Groups allowing ingress from 0.0.0.0/0 on sensitive ports (22, 3389).")

    # Cloud specific metadata
    metadata = {
        "iam_users_scanned": random.randint(10, 50),
        "storage_buckets_scanned": random.randint(5, 20),
        "security_groups_scanned": random.randint(20, 100),
        "provider": "AWS" if "aws" in account_id.lower() else "GCP" if "gcp" in account_id.lower() else "Azure"
    }

    # If it's perfectly clean by chance, we force a slight warning so the demo has data
    if risk_score == 0:
        risk_score = 10
        issues.append("INFO: Found inactive IAM users over 90 days old.")

    overall_status = "Secure"
    if risk_score >= 40:
        overall_status = "Critical Risk"
    elif risk_score >= 20:
        overall_status = "Warning"

    return {
        "target": account_id,
        "status": overall_status,
        "risk_score": risk_score,
        "metadata": metadata,
        "issues": issues,
        "scanned_at": datetime.utcnow().isoformat()
    }
