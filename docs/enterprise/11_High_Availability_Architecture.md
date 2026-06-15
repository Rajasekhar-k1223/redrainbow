# High-Availability (HA) Architecture

To support enterprise-scale cyber defense operations and ensure 99.99% uptime, RedRainbow utilizes a comprehensive High-Availability design.

## 1. Multi-Region Active-Active Deployment
- **Global Load Balancing**: AWS Route 53 or Cloudflare load balances traffic across two geographically isolated Kubernetes clusters (e.g., `us-east-1` and `eu-west-1`).
- **Stateless Tier**: The React UI and FastAPI control plane are entirely stateless. JWT authentication and stateless REST design allow requests to be routed to any region without session affinity.

## 2. Data Tier High Availability
- **Primary Database (MySQL/Postgres)**: Configured in a Multi-AZ cluster. Read replicas are deployed in secondary regions to offload heavy reporting queries (e.g., Compliance Generation) from the primary writer node.
- **Redis Cache & Queue**: Configured as a Redis Cluster with Sentinel for automatic failover. This ensures the Agent Mesh task queue is never dropped.
- **OpenSearch SIEM**: Deployed as a multi-node cluster with dedicated master, data, and ingest nodes spread across Availability Zones to prevent data loss during node failures.

## 3. Agent Mesh Auto-Scaling
- The Celery workers forming the Agent Mesh utilize **KEDA (Kubernetes Event-driven Autoscaling)**. 
- During a massive vulnerability scan, the Redis queue length will spike. KEDA will automatically provision hundreds of temporary worker pods to parallelize the scan, then spin them down to 0 to save costs once the queue is empty.

## 4. Disaster Recovery (DR)
- **RTO/RPO**: Recovery Time Objective is < 15 minutes. Recovery Point Objective is < 5 minutes.
- Automated snapshots of the persistent volumes are taken hourly and shipped to cold storage (e.g., S3 Glacier) in an isolated, locked-down AWS account to protect against ransomware.
