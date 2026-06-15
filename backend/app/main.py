from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, users, evidence, orchestrator, assets, incidents, soar, ingest, firewall, audit, monitorix, siem, compliance, intel, malware, forensics, integrations, websockets, graph, batch1, batch2, batch3, batch4, batch_a, batch_b, batch_c, batch_d, batch_e, batch_f, batch_g, batch_h, batch_i
from app.core.config import settings
from app.core.security import try_get_username_from_token
from app.db.mongo import get_mongo_db
from app.db.redis import get_redis
from app.services.audit_log import log_audit_event

app = FastAPI(title="RedRainbow API")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(evidence.router)
app.include_router(orchestrator.router)
app.include_router(assets.router)
app.include_router(incidents.router)
app.include_router(soar.router)
app.include_router(ingest.router)
app.include_router(firewall.router)
app.include_router(audit.router)
app.include_router(monitorix.router)
app.include_router(siem.router)
app.include_router(compliance.router)
app.include_router(intel.router)
app.include_router(malware.router)
app.include_router(forensics.router)
app.include_router(integrations.router)
app.include_router(websockets.router)
app.include_router(graph.router)
app.include_router(batch1.ctem_router)
app.include_router(batch1.attack_path_router)
app.include_router(batch1.posture_router)
app.include_router(batch2.soc_router)
app.include_router(batch2.purple_team_router)
app.include_router(batch2.threat_hunting_router)
app.include_router(batch3.mssp_router)
app.include_router(batch3.marketplace_router)
app.include_router(batch3.developer_router)
app.include_router(batch4.sbom_router)
app.include_router(batch4.assistant_router)
app.include_router(batch4.resilience_router)
# ── Commercial Evolution (Layers 31-40) ──────────────────────────────────────
app.include_router(batch_a.digital_twin_router)
app.include_router(batch_a.exec_risk_router)
app.include_router(batch_a.tprm_router)
app.include_router(batch_a.insurance_router)
app.include_router(batch_a.benchmarking_router)
app.include_router(batch_b.dspm_router)
app.include_router(batch_b.identity_risk_router)
app.include_router(batch_b.control_effectiveness_router)
app.include_router(batch_c.auto_investigate_router)
app.include_router(batch_c.federation_router)
# ── Commercial Platform ───────────────────────────────────────────────────────
app.include_router(batch_d.licensing_router)
app.include_router(batch_d.billing_router)
app.include_router(batch_d.customer_success_router)
app.include_router(batch_d.mssp_ops_router)
# ── Developer & Marketplace ───────────────────────────────────────────────────
app.include_router(batch_e.graphql_router)
app.include_router(batch_e.marketplace_evo_router)
app.include_router(batch_e.dev_ecosystem_router)
# ── Layers 41-60 ────────────────────────────────────────────────────────────
app.include_router(batch_f.cyber_econ_router)
app.include_router(batch_f.lakehouse_router)
app.include_router(batch_f.observatory_router)
app.include_router(batch_f.research_router)
app.include_router(batch_f.industry_router)
app.include_router(batch_g.cyber_range_router)
app.include_router(batch_g.partner_router)
app.include_router(batch_g.product_analytics_router)
app.include_router(batch_g.knowledge_router)
app.include_router(batch_g.global_command_router)
app.include_router(batch_h.intel_capture_router)
app.include_router(batch_h.voice_intel_router)
app.include_router(batch_h.doc_intel_router)
app.include_router(batch_h.conversation_router)
app.include_router(batch_h.multimedia_router)
app.include_router(batch_i.kg_ai_router)
app.include_router(batch_i.auto_assistant_router)
app.include_router(batch_i.mission_orchestrator_router)
app.include_router(batch_i.decision_support_router)
app.include_router(batch_i.global_cloud_router)

# ──────────────────────────────────────────────────────────────────────────────
# Exception handler – no manual CORS headers needed; CORSMiddleware (outermost)
# handles injection for ALL responses, including error responses.
# ──────────────────────────────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Our security team has been notified."},
    )


# ──────────────────────────────────────────────────────────────────────────────
# Rate-limit middleware (inner layer – runs after CORS wrapper)
# ──────────────────────────────────────────────────────────────────────────────
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"

    # Skip rate-limiting for loopback (local dev / health checks)
    if client_ip in ("127.0.0.1", "::1", "localhost"):
        return await call_next(request)

    r = get_redis()
    key = f"rate_limit:{client_ip}"

    try:
        count = r.incr(key)
        if count == 1:
            r.expire(key, 60)
        if count > settings.rate_limit_per_minute:
            from fastapi.responses import JSONResponse
            return JSONResponse(status_code=429, content={"detail": "Too many requests"})
    except Exception:
        pass  # Fallback: allow request if Redis is unavailable

    return await call_next(request)


# ──────────────────────────────────────────────────────────────────────────────
# Audit middleware (inner layer – runs after CORS wrapper)
# ──────────────────────────────────────────────────────────────────────────────
@app.middleware("http")
async def audit_middleware(request: Request, call_next):
    response = await call_next(request)
    auth_header = request.headers.get("authorization")
    username = try_get_username_from_token(auth_header)
    event = {
        "method": request.method,
        "path": request.url.path,
        "status_code": response.status_code,
        "client_ip": request.client.host if request.client else None,
        "user": username,
    }
    try:
        await log_audit_event(event)
    except Exception:
        pass
    return response


# ──────────────────────────────────────────────────────────────────────────────
# CORS middleware – MUST be added LAST so it becomes the OUTERMOST layer.
# In FastAPI/Starlette, add_middleware() wraps in reverse order:
#   last added = outermost = first to process request and last to process response.
# This guarantees Access-Control-Allow-Origin is present on EVERY response,
# including 4xx/5xx errors and preflight OPTIONS requests.
# ──────────────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:5176",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────────────────────────────────────
# Health endpoints
# ──────────────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/health/redis")
def health_redis():
    r = get_redis()
    return {"redis": r.ping()}


@app.get("/health/mongo")
async def health_mongo():
    db = get_mongo_db()
    result = await db.command("ping")
    return {"mongo": result.get("ok", 0)}
