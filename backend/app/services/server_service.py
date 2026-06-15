import socket
from datetime import datetime
import concurrent.futures

def scan_port(ip: str, port: int, timeout: float = 1.0) -> bool:
    """Attempts to connect to a specific port to see if it is open."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(timeout)
            result = s.connect_ex((ip, port))
            return result == 0
    except Exception:
        return False

def analyze_server_exposure(target: str):
    """
    Performs Open Port Analysis on critical infrastructure ports to detect
    exposure and configuration drift.
    """
    # Clean target (e.g. "core-db-prod-01 (10.0.1.55)" -> "10.0.1.55")
    # For simplicity, if it's not an IP, we'll try to resolve it or just scan it directly if it's a hostname
    ip_target = target
    if "(" in target and ")" in target:
        ip_target = target.split("(")[1].split(")")[0].strip()

    # Define critical ports to scan
    CRITICAL_PORTS = {
        21: "FTP",
        22: "SSH",
        23: "Telnet",
        80: "HTTP",
        443: "HTTPS",
        3306: "MySQL",
        3389: "RDP",
        5432: "PostgreSQL",
        27017: "MongoDB"
    }

    # Ports that are universally considered a high risk if exposed to the public internet
    HIGH_RISK_EXPOSURES = [21, 23, 3306, 3389, 5432, 27017]

    risk_score = 0
    issues = []
    open_ports = []

    try:
        # Resolve hostname to IP if needed
        target_ip = socket.gethostbyname(ip_target)
    except Exception as e:
        return {
            "target": target,
            "status": "Offline / Unresolvable",
            "risk_score": 100,
            "issues": [f"Could not resolve target IP: {str(e)}"],
            "open_ports": [],
            "scanned_at": datetime.utcnow().isoformat()
        }

    # Perform concurrent port scan
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_port = {executor.submit(scan_port, target_ip, port): port for port in CRITICAL_PORTS.keys()}
        for future in concurrent.futures.as_completed(future_to_port):
            port = future_to_port[future]
            try:
                is_open = future.result()
                if is_open:
                    open_ports.append({"port": port, "service": CRITICAL_PORTS[port]})
                    
                    if port in HIGH_RISK_EXPOSURES:
                        risk_score += 40
                        issues.append(f"CRITICAL: {CRITICAL_PORTS[port]} (Port {port}) is exposed. This violates security baselines.")
                    elif port == 22:
                        risk_score += 15
                        issues.append(f"WARNING: SSH (Port 22) is open. Ensure strong authentication and fail2ban are active.")
            except Exception:
                pass

    overall_status = "Healthy"
    if risk_score >= 40:
        overall_status = "Critical Risk"
    elif risk_score >= 15:
        overall_status = "Warning"

    return {
        "target": target,
        "resolved_ip": target_ip,
        "status": overall_status,
        "risk_score": risk_score,
        "open_ports": open_ports,
        "issues": issues,
        "scanned_at": datetime.utcnow().isoformat()
    }
