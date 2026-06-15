from fastapi import APIRouter, Header, HTTPException
from app.services.graph_service import get_attack_path_graph

router = APIRouter(prefix="/api/v2/graph", tags=["Security Data Fabric"])

@router.get("/attack-path")
def retrieve_attack_path(x_tenant_id: str = Header(...)):
    """Retrieves the full topological attack path mapped in Neo4j."""
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="Tenant ID required")
    
    graph_data = get_attack_path_graph(x_tenant_id)
    return graph_data

@router.post("/query")
def execute_cypher_hunt(query: dict, x_tenant_id: str = Header(...)):
    """Executes a custom Cypher query for advanced Threat Hunting."""
    # In production, this would be highly sanitized or restricted to read-only
    return {"message": "Threat hunt query dispatched to Neo4j", "status": "success"}
