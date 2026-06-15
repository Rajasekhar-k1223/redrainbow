from fastapi import APIRouter

soc_router = APIRouter(prefix="/api/v2/soc", tags=["SOC Workspace"])
@soc_router.get("/cases")
def get_cases(): return {"active_cases": 5}

purple_team_router = APIRouter(prefix="/api/v2/purple-team", tags=["Purple Team"])
@purple_team_router.get("/coverage")
def get_coverage(): return {"mitre_coverage": "74%"}

threat_hunting_router = APIRouter(prefix="/api/v2/threat-hunting", tags=["Threat Hunting"])
@threat_hunting_router.get("/queries")
def get_queries(): return {"saved_queries": 12}
