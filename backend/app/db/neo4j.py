import os
import logging
from neo4j import GraphDatabase

logger = logging.getLogger("neo4j")

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

class Neo4jManager:
    def __init__(self):
        self.driver = None

    def connect(self):
        try:
            self.driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
            logger.info("Connected to Neo4j Security Data Fabric")
        except Exception as e:
            logger.error(f"Neo4j connection failed: {e}")

    def close(self):
        if self.driver:
            self.driver.close()

neo4j_manager = Neo4jManager()

def get_neo4j_driver():
    # In MVP, if the driver isn't connected, we try connecting lazy
    if not neo4j_manager.driver:
        neo4j_manager.connect()
    return neo4j_manager.driver
