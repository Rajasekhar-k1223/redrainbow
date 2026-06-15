import urllib.request
import urllib.parse
import json
import logging
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

# Hardcoded for the local mock firewall
FIREWALL_URL = "http://127.0.0.1:8000/api/v1/firewall/block_ip"

def execute_playbook_action(playbook_id: str, db: Session) -> str:
    """
    Executes the underlying orchestration action for a given playbook.
    """
    logger.info(f"Executing SOAR Playbook: {playbook_id}")
    
    # In a real app, we would look up the playbook's specific actions.
    # For this architecture demonstration, we assume all playbooks trigger an IP block.
    
    payload = {
        "ip_address": "198.51.100.42", # Mock malicious IP
        "reason": f"Automated block via SOAR Playbook {playbook_id}"
    }
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(FIREWALL_URL, data=data, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            result = json.loads(response.read().decode('utf-8'))
            logger.info(f"Firewall response: {result}")
            return result.get("message", "Action executed successfully.")
    except Exception as e:
        logger.error(f"SOAR Execution failed: {str(e)}")
        raise Exception(f"Failed to communicate with firewall: {str(e)}")
