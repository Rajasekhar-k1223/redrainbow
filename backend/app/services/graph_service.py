from app.db.neo4j import get_neo4j_driver
import logging

logger = logging.getLogger("graph_service")

def sync_asset_to_graph(tenant_id: str, asset_id: str, asset_type: str, public: bool):
    """Creates or updates an Asset node in Neo4j."""
    query = """
    MERGE (t:Tenant {id: $tenant_id})
    MERGE (a:Asset {id: $asset_id})
    SET a.type = $asset_type, a.public = $public
    MERGE (t)-[:OWNS]->(a)
    """
    driver = get_neo4j_driver()
    if driver:
        try:
            with driver.session() as session:
                session.run(query, tenant_id=tenant_id, asset_id=asset_id, asset_type=asset_type, public=public)
        except Exception as e:
            logger.error(f"Failed to sync asset to graph: {e}")

def get_attack_path_graph(tenant_id: str):
    """
    Retrieves the subgraph for a tenant to visualize the Attack Path.
    Returns nodes and links formatted for react-force-graph.
    """
    query = """
    MATCH (t:Tenant {id: $tenant_id})-[:OWNS]->(a:Asset)
    OPTIONAL MATCH (a)-[r]->(v)
    RETURN a, r, v
    """
    
    nodes = []
    links = []
    
    driver = get_neo4j_driver()
    if not driver:
        # Mock graph if neo4j is offline in local dev
        return {
            "nodes": [
                {"id": "Public IP", "group": 1},
                {"id": "Web Server", "group": 2},
                {"id": "CVE-2024-1234", "group": 3},
                {"id": "Internal DB", "group": 4}
            ],
            "links": [
                {"source": "Public IP", "target": "Web Server", "label": "HOSTS"},
                {"source": "Web Server", "target": "CVE-2024-1234", "label": "VULNERABLE_TO"},
                {"source": "CVE-2024-1234", "target": "Internal DB", "label": "EXPLOITS"}
            ]
        }
        
    try:
        with driver.session() as session:
            result = session.run(query, tenant_id=tenant_id)
            node_set = set()
            
            for record in result:
                a = record["a"]
                v = record["v"]
                r = record["r"]
                
                if a and a["id"] not in node_set:
                    nodes.append({"id": a["id"], "group": 1, "type": a.get("type", "Asset")})
                    node_set.add(a["id"])
                    
                if v and v.get("id") and v["id"] not in node_set:
                    nodes.append({"id": v["id"], "group": 2})
                    node_set.add(v["id"])
                    
                if a and v and r:
                    links.append({
                        "source": a["id"],
                        "target": v["id"],
                        "label": type(r).__name__
                    })
                    
        return {"nodes": nodes, "links": links}
    except Exception as e:
        logger.error(f"Failed to execute graph query: {e}")
        return {"nodes": [], "links": []}
