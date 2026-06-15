# Kubernetes Deployment Plan

RedRainbow is designed to be fully cloud-ready and orchestrated via Kubernetes (K8s) in production environments (EKS, GKE, AKS).

## 1. Cluster Architecture

### Namespaces
- `redrainbow-system`: Core API, AI service, SIEM backend, and UI.
- `redrainbow-agents`: The Agent Mesh (Celery workers).
- `redrainbow-data`: Stateful workloads (Database, Redis, OpenSearch).

### Ingress
- An **NGINX Ingress Controller** will route external traffic.
- `/api/*` routes to the FastAPI `api` service.
- `/*` routes to the React `ui` service.
- TLS termination is handled at the Ingress layer via cert-manager.

## 2. Workload Definitions

### Stateless Deployments
- **API Gateway (FastAPI)**: Deployed as a Kubernetes `Deployment`. Horizontally scaled using a HorizontalPodAutoscaler (HPA) targeting 70% CPU utilization.
- **Frontend UI (React/Nginx)**: Lightweight `Deployment`, scaled via HPA.
- **Agent Mesh (Celery Workers)**: Deployed as a `Deployment`. Scaling is determined by KEDA (Kubernetes Event-driven Autoscaling) based on the length of the Redis task queue.

### Stateful Sets
- **MySQL/Postgres**: Deployed as a `StatefulSet` with persistent volume claims (PVCs) backed by fast NVMe SSDs.
- **Redis**: Deployed as a `StatefulSet` (or via a managed service like ElastiCache) for persistent queue durability.
- **OpenSearch**: Deployed as a `StatefulSet` cluster for SIEM log ingestion.

## 3. Security Context
- All pods must run with `securityContext.runAsNonRoot = true`.
- Network Policies must restrict traffic so that only the Ingress controller can communicate with the API, and only the API/Workers can communicate with the database.

## 4. CI/CD Integration
- GitHub Actions will build Docker images and push them to an Elastic Container Registry (ECR).
- Helm charts will be updated with the new image tags, triggering an ArgoCD sync to automatically deploy the changes to the cluster.
