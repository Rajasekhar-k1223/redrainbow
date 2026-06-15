import os
import logging
from opensearchpy import OpenSearch, RequestsHttpConnection

logger = logging.getLogger("opensearch")

OPENSEARCH_URL = os.getenv("OPENSEARCH_URL", "http://localhost:9200")

class OpenSearchManager:
    client: OpenSearch = None

    def connect(self):
        try:
            self.client = OpenSearch(
                hosts=[OPENSEARCH_URL],
                connection_class=RequestsHttpConnection,
                use_ssl=False,
                verify_certs=False
            )
            logger.info("Connected to OpenSearch")
        except Exception as e:
            logger.error(f"OpenSearch connection failed: {e}")

os_manager = OpenSearchManager()

def get_opensearch():
    return os_manager.client
