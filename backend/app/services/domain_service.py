import socket
import ssl
import dns.resolver
from datetime import datetime

def check_ssl_certificate(domain: str):
    """
    Connects to port 443 and calculates the days until the SSL certificate expires.
    """
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                
                # 'notAfter' is a string like 'May  9 23:59:59 2024 GMT'
                expire_date_str = cert['notAfter']
                expire_date = datetime.strptime(expire_date_str, "%b %d %H:%M:%S %Y %Z")
                days_remaining = (expire_date - datetime.utcnow()).days
                
                return {
                    "valid": True,
                    "days_remaining": days_remaining,
                    "expires_on": expire_date_str
                }
    except Exception as e:
        return {
            "valid": False,
            "error": str(e)
        }

def validate_email_security(domain: str):
    """
    Queries DNS TXT records to validate SPF and DMARC configurations.
    """
    spf_valid = False
    dmarc_valid = False
    records = []

    try:
        # Check standard TXT for SPF
        txt_answers = dns.resolver.resolve(domain, 'TXT')
        for rdata in txt_answers:
            txt_string = rdata.to_text().strip('"')
            records.append(txt_string)
            if txt_string.startswith("v=spf1"):
                spf_valid = True
    except Exception:
        pass

    try:
        # Check _dmarc subdomain for DMARC
        dmarc_domain = f"_dmarc.{domain}"
        dmarc_answers = dns.resolver.resolve(dmarc_domain, 'TXT')
        for rdata in dmarc_answers:
            txt_string = rdata.to_text().strip('"')
            records.append(f"_dmarc: {txt_string}")
            if txt_string.startswith("v=DMARC1"):
                dmarc_valid = True
    except Exception:
        pass

    return {
        "spf_valid": spf_valid,
        "dmarc_valid": dmarc_valid,
        "raw_records": records
    }

def scan_domain(domain: str):
    """
    Master function to perform a full Domain Security scan.
    """
    # Clean up domain string in case user entered https://
    domain = domain.replace("https://", "").replace("http://", "").split("/")[0]
    
    ssl_info = check_ssl_certificate(domain)
    email_info = validate_email_security(domain)
    
    risk_score = 0
    issues = []
    
    if not ssl_info.get("valid"):
        risk_score += 50
        issues.append("SSL Certificate is invalid or unreachable.")
    elif ssl_info.get("days_remaining", 0) < 30:
        risk_score += 20
        issues.append(f"SSL Certificate expiring soon ({ssl_info.get('days_remaining')} days).")
        
    if not email_info["spf_valid"]:
        risk_score += 15
        issues.append("Missing SPF record. Domain vulnerable to email spoofing.")
        
    if not email_info["dmarc_valid"]:
        risk_score += 15
        issues.append("Missing DMARC record. Domain vulnerable to email spoofing.")
        
    overall_status = "Healthy"
    if risk_score > 30:
        overall_status = "High Risk"
    elif risk_score > 0:
        overall_status = "Warning"
        
    return {
        "domain": domain,
        "status": overall_status,
        "risk_score": risk_score,
        "ssl": ssl_info,
        "email_security": email_info,
        "issues": issues,
        "scanned_at": datetime.utcnow().isoformat()
    }
