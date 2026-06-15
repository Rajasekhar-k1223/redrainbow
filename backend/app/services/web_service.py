import httpx
from datetime import datetime

def analyze_web_security(target: str):
    """
    Performs an active Web Application Security scan on the target.
    Analyzes HTTP Headers, Cookies, and Server details.
    """
    # Ensure URL formatting
    if not target.startswith("http"):
        url = f"https://{target}"
    else:
        url = target

    risk_score = 0
    issues = []
    
    headers_analyzed = {
        "Strict-Transport-Security": False,
        "Content-Security-Policy": False,
        "X-Frame-Options": False,
        "X-Content-Type-Options": False
    }
    
    server_info = "Unknown"
    cookies_analyzed = []

    try:
        # We disable redirects and use a short timeout to prevent hanging
        with httpx.Client(timeout=10.0, follow_redirects=False, verify=False) as client:
            response = client.get(url)
            
            # 1. Analyze Headers
            for header in headers_analyzed.keys():
                if header.lower() in [k.lower() for k in response.headers.keys()]:
                    headers_analyzed[header] = True
                else:
                    risk_score += 10
                    issues.append(f"Missing security header: {header}")
                    
            # 2. Check for Server Information Leakage (OWASP A05: Security Misconfiguration)
            if "server" in [k.lower() for k in response.headers.keys()]:
                server_info = response.headers.get("server", "Unknown")
                if any(char.isdigit() for char in server_info):
                    # If server string contains numbers, it's likely leaking exact version
                    risk_score += 15
                    issues.append(f"Server header leaking version information: {server_info}")
                    
            if "x-powered-by" in [k.lower() for k in response.headers.keys()]:
                risk_score += 15
                issues.append(f"X-Powered-By header leaking technology stack: {response.headers.get('x-powered-by')}")
                
            # 3. Analyze Cookies
            for cookie_name, cookie_value in response.cookies.items():
                cookie_obj = next((c for c in client.cookies.jar if c.name == cookie_name), None)
                secure = getattr(cookie_obj, 'secure', False)
                httponly = getattr(cookie_obj, 'has_nonsearchable_domain', False) # httpx cookie jar handling
                
                # Manual parsing if standard attributes aren't accessible
                raw_cookie_headers = response.headers.get_list('set-cookie')
                is_secure = False
                is_httponly = False
                
                for rc in raw_cookie_headers:
                    if cookie_name in rc:
                        is_secure = "Secure" in rc
                        is_httponly = "HttpOnly" in rc
                        
                cookies_analyzed.append({
                    "name": cookie_name,
                    "secure": is_secure,
                    "httponly": is_httponly
                })
                
                if not is_secure:
                    risk_score += 5
                    issues.append(f"Cookie '{cookie_name}' missing Secure flag")
                if not is_httponly:
                    risk_score += 5
                    issues.append(f"Cookie '{cookie_name}' missing HttpOnly flag")

    except httpx.RequestError as exc:
        risk_score += 100
        issues.append(f"Failed to connect to target: {str(exc)}")
        return {
            "target": url,
            "status": "Offline / Unreachable",
            "risk_score": risk_score,
            "issues": issues,
            "scanned_at": datetime.utcnow().isoformat()
        }

    overall_status = "Healthy"
    if risk_score >= 50:
        overall_status = "Critical Risk"
    elif risk_score >= 20:
        overall_status = "Warning"

    return {
        "target": url,
        "status": overall_status,
        "risk_score": risk_score,
        "headers": headers_analyzed,
        "server_info": server_info,
        "cookies_found": len(cookies_analyzed),
        "issues": issues,
        "scanned_at": datetime.utcnow().isoformat()
    }
