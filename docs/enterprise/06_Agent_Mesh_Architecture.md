# RedRainbow Agent Mesh Architecture

The Security Agent Mesh is the execution muscle of the RedRainbow platform. It consists of containerized security workers that execute specialized scans dynamically based on Celery tasks.

## 1. Mesh Topology
- **API Gateway -> Redis Queue -> Celery Worker -> Docker/Kubernetes Job**
- Workers are stateless. They spin up, execute a target scan, stream results back via the API, and tear down.

## 2. Worker Categories

### Network Security
- **Nmap:** Port scanning, service enumeration, OS detection.
- **Security Onion / Zeek / Suricata:** PCAP analysis and network threat detection (typically deployed as passive sniffers on SPAN ports, sending logs to OpenSearch).

### Web Application Security
- **OWASP ZAP:** Full DAST (Dynamic Application Security Testing) scanning, spidering, and vulnerability detection.
- **Nikto:** Fast CGI and server misconfiguration scanning.

### Container & Kubernetes Security
- **Trivy / Grype:** Container image vulnerability scanning (SBOM generation, CVE matching).
- **Kubescape:** Kubernetes cluster misconfiguration and CIS benchmark validation.
- **Checkov:** IaC (Infrastructure as Code) scanning for Terraform/Helm.

### Malware Analysis
- **REMnux:** Static and dynamic malware analysis toolkit container.
- **CAPE Sandbox:** Automated malware detonation and behavioral analysis (deployed as a heavy VM worker).

### Forensics
- **CAINE / Autopsy:** Digital forensics and disk image analysis.
- **Volatility:** Memory dump (RAM) analysis for advanced persistent threats (APTs).

### OSINT & Attack Surface Management
- **Amass / Recon-ng:** Subdomain discovery and attack surface mapping.
- **SpiderFoot:** Open-source intelligence gathering on IPs and domains.

## 3. Execution Flow
1. User requests a web scan via UI.
2. `Scan Service` validates asset authorization.
3. Task is placed on Redis `web_scan_queue`.
4. An available OWASP ZAP worker picks up the task.
5. ZAP executes the scan, streaming progress via WebSockets.
6. Upon completion, JSON results are pushed to MongoDB.
7. SentinelX reads the JSON, generates a summary, and creates Findings in MySQL.
