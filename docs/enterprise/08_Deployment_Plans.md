# RedRainbow Deployment Plans

## 1. Docker Compose Deployment (Self-Hosted / MVP)
Designed for single-server or bare-metal deployments during the MVP phase.
- **`docker-compose.yml`** orchestrates the entire stack on a single host.
- **Services:**
  - `frontend`: Nginx serving the React/Vite static build.
  - `api_gateway`: FastAPI uvicorn workers.
  - `celery_worker`: Python environment with Docker socket mounted (to spawn Agent Mesh containers).
  - `mysql`, `mongodb`, `redis`, `opensearch`: Stateful data stores with local volume mounts.
- **Networking:** Internal Docker bridge network. API exposed via port 443 with TLS termination at Nginx.

## 2. Kubernetes Deployment Plan (Enterprise / High-Availability)
Designed for cloud-native, horizontally scalable deployments on AWS EKS, Azure AKS, or self-hosted k8s.

### Architecture Components
- **Ingress Controller:** Nginx or Traefik for routing external traffic and managing TLS via cert-manager.
- **Frontend / Backend Pods:** Managed by `Deployments` with `HorizontalPodAutoscalers` (HPA) targeting CPU/Memory metrics.
- **Security Agent Mesh (Jobs):** Celery workers will NOT mount the docker socket. Instead, they will use the Kubernetes API to spawn dynamic `Jobs` for each scan. This ensures true isolation and ephemeral execution.
- **Databases:** Deployed using official Operators (e.g., Percona Operator for MySQL, MongoDB Community Operator, ECK for OpenSearch) to handle clustering and backups automatically.
- **Storage:** PersistentVolumeClaims (PVCs) backed by cloud block storage (eBS, Azure Disk). Evidence Vault points to S3.

### Helm Charts
The platform will be packaged into a unified Helm Chart (`helm/redrainbow`) allowing for easy deployment and configuration overrides per environment (dev, staging, prod).
