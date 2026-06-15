from fastapi import APIRouter

mssp_router = APIRouter(prefix="/api/v2/mssp", tags=["Multi-Tenant SaaS"])
@mssp_router.get("/tenants")
def get_tenants(): return {"managed_tenants": 24}

marketplace_router = APIRouter(prefix="/api/v2/marketplace", tags=["Marketplace"])
@marketplace_router.get("/plugins")
def get_plugins(): return {"available_plugins": 15}

developer_router = APIRouter(prefix="/api/v2/developer", tags=["Developer Platform"])
@developer_router.get("/keys")
def get_keys(): return {"active_api_keys": 3}
