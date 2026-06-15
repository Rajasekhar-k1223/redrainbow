# Integrations, SIEM, and Evidence Vault Architecture

RedRainbow relies on deep integrations with ecosystem tools to provide comprehensive cyber defense.

## 1. Monitorix Integration Architecture
Monitorix acts as the core endpoint telemetry agent.
- **Data Flow**: Agents written in C++/Rust are deployed on endpoints. They collect file integrity monitoring (FIM), process logs, and network events.
- **Streaming**: Telemetry is streamed to RedRainbow via a dedicated, high-throughput gRPC endpoint (`/api/v1/telemetry/stream`).
- **Offline Buffering**: If the endpoint loses network connectivity, Monitorix buffers events locally using an encrypted SQLite database and replays them upon reconnection.
- **Tamper Detection**: A heartbeat signal is sent every 30 seconds. If the heartbeat drops or the agent service is forcefully killed, the RedRainbow platform automatically raises a "Tamper Detected" critical incident.

## 2. UniCloudOps Integration Architecture
UniCloudOps provides cloud remediation and Terraform orchestration.
- **SOAR Handoff**: When a RedRainbow SOAR playbook dictates a cloud remediation (e.g., "Isolate Compromised EC2 Instance"), RedRainbow sends an API payload to the UniCloudOps webhook.
- **Execution**: UniCloudOps receives the payload and triggers a predefined Terraform state change to modify the AWS Security Group, effectively quarantining the instance. 

## 3. SIEM Architecture (OpenSearch)
RedRainbow's massive volume of security events requires a dedicated SIEM backbone.
- **Ingestion**: Raw logs from endpoints, servers, and cloud accounts are ingested via Logstash or Vector.
- **Normalization**: Logs are parsed into the Elastic Common Schema (ECS) format for standardized querying.
- **Correlation Engine**: RedRainbow's backend periodically runs correlation rules (written in Sigma) against the OpenSearch indices. When a rule matches (e.g., "5 failed logins followed by a successful login"), an `Incident` is generated in the primary MySQL database.

## 4. Evidence Vault Architecture
- **Immutable Storage**: Artifacts (e.g., PCAP files, malware samples, memory dumps) are stored in an S3-compatible object store configured with "Object Lock" (WORM - Write Once, Read Many) to guarantee immutability for legal forensics.
- **Chain of Custody**: A cryptographic SHA-256 hash of the artifact is calculated upon upload and stored in a specialized `Evidence` MongoDB collection. Any subsequent download verifies the hash to ensure the chain of custody has not been broken.
