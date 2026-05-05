from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, users, evidence, orchestrator
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
