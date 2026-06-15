# RedRainbow Ecosystem Integrations

RedRainbow acts as the central brain, integrating with four major ecosystem pillars.

## 1. Monitorix (Endpoint & Server Telemetry)
Monitorix is the lightweight agent installed on target assets (Linux/Windows).
- **Architecture:** Golang-based agent communicating via gRPC/WebSockets to the RedRainbow API Gateway.
- **Data Collection:** EDR capabilities (Processes, Services, File Integrity Monitoring (FIM), USB events, User Logins).
- **Resilience:** Offline buffering ensures telemetry isn't lost during network disconnects. It features tamper detection to alert the SIEM if the agent is killed.

## 2. SentinelX (AI SOC & Intelligence)
SentinelX is the AI brain of the platform.
- **Architecture:** Python microservice utilizing LLMs (e.g., Llama 3 or GPT-4 integration).
- **Capabilities:**
  - **Alert Correlation:** Groups seemingly unrelated events from OpenSearch into a single Incident.
  - **Summarization:** Translates complex JSON scan outputs and raw PCAP data into human-readable Threat Summaries.
  - **Recommendations:** Generates step-by-step remediation plans for SOC Analysts based on CIS benchmarks.

## 3. UniCloudOps (Cloud Security & Automation)
UniCloudOps bridges RedRainbow to cloud infrastructure (AWS/Azure/GCP).
- **Architecture:** Terraform and Cloud SDK orchestrator.
- **Capabilities:**
  - Performs CSPM (Cloud Security Posture Management) checks (IAM review, public S3 bucket detection).
  - Executes Cloud SOAR actions (e.g., using Terraform to dynamically update AWS Security Groups to block malicious IPs).

## 4. SIEM & SOAR (The Operations Core)
- **SIEM (OpenSearch):** Ingests Monitorix telemetry, cloud logs, and agent outputs. Normalizes data using ECS (Elastic Common Schema). Executes detection rules (Sigma rules).
- **SOAR (Celery/Python):** Playbook engine.
  - **Automated Actions:** Block IP on firewall, quarantine endpoint via Monitorix agent, revoke user session.
  - **Human-in-the-Loop:** High-risk actions (Shutdown VM, Disable Prod Account) require a SOC Analyst or Admin approval via the UI before the playbook proceeds.
