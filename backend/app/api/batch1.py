from fastapi import APIRouter

ctem_router = APIRouter(prefix="/api/v2/ctem", tags=["CTEM"])
@ctem_router.get("/exposure")
def get_exposure(): return {"score": 85, "status": "active", "shadow_it_count": 12}

attack_path_router = APIRouter(prefix="/api/v2/attack-path", tags=["Attack Path"])
@attack_path_router.get("/simulate")
def simulate_path(): return {"risk_paths": 4, "critical_choke_points": 2}

posture_router = APIRouter(prefix="/api/v2/posture", tags=["Posture Scoring"])
@posture_router.get("/score")
def get_score(): return {"organization_score": 86, "trend": "+2.4%"}
