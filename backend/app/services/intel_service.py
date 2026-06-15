from datetime import datetime, timedelta
import random

def fetch_otx_pulses():
    """
    Simulates fetching live Threat Intelligence Pulses from AlienVault OTX.
    In a production environment, this would use `requests.get('https://otx.alienvault.com/api/v1/pulses/subscribed')`.
    """
    now = datetime.utcnow()
    
    # Mock live IoCs
    pulses = [
        {
            "id": "otx-pulse-001",
            "name": "Lazarus Group - Operation DreamJob 2026",
            "author": "AlienVault",
            "created": (now - timedelta(hours=2)).isoformat(),
            "tags": ["APT", "Lazarus", "Phishing"],
            "indicator_count": 14,
            "indicators": [
                {"type": "domain", "indicator": "secure-hr-portal.com"},
                {"type": "IPv4", "indicator": "185.199.108.153"},
                {"type": "FileHash-SHA256", "indicator": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
            ],
            "risk_score": 95
        },
        {
            "id": "otx-pulse-002",
            "name": "Kinsing Malware Campaign targeting Cloud Native Environments",
            "author": "Unit42",
            "created": (now - timedelta(hours=12)).isoformat(),
            "tags": ["Cryptojacking", "Docker", "Kinsing"],
            "indicator_count": 8,
            "indicators": [
                {"type": "IPv4", "indicator": "193.106.191.137"},
                {"type": "IPv4", "indicator": "142.44.191.122"},
                {"type": "URL", "indicator": "http://193.106.191.137/kinsing"}
            ],
            "risk_score": 88
        },
        {
            "id": "otx-pulse-003",
            "name": "Cobalt Strike Watermarking - DarkSide Affiliates",
            "author": "Mandiant",
            "created": (now - timedelta(days=1)).isoformat(),
            "tags": ["Ransomware", "Cobalt Strike", "DarkSide"],
            "indicator_count": 21,
            "indicators": [
                {"type": "IPv4", "indicator": "45.144.225.33"},
                {"type": "domain", "indicator": "cdn-cache-update.com"}
            ],
            "risk_score": 98
        }
    ]
    
    return {
        "status": "success",
        "source": "AlienVault OTX",
        "pulses": pulses
    }
