import json
import urllib.request
import urllib.error
import logging

logger = logging.getLogger("webhook_service")
logger.setLevel(logging.INFO)

# Configurable Webhook URL (Can be set via ENV or DB. Mocked for MVP)
# In a real environment, this would be an actual Slack, Teams, or PagerDuty URL
DEFAULT_WEBHOOK_URL = "http://localhost:8000/api/v1/intel/pulses" # Dummy URL just to show it executes

def dispatch_webhook(incident_data: dict, webhook_url: str = DEFAULT_WEBHOOK_URL):
    """
    Asynchronously executes an HTTP POST to an external webhook.
    """
    payload = {
        "text": f"🚨 RedRainbow Alert: New {incident_data.get('severity')} Incident Detected!",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": incident_data.get("title", "Unknown Alert")
                }
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Severity:*\n{incident_data.get('severity')}"},
                    {"type": "mrkdwn", "text": f"*Asset:*\n{incident_data.get('asset_id')}"},
                    {"type": "mrkdwn", "text": f"*Status:*\n{incident_data.get('status')}"}
                ]
            }
        ]
    }

    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(webhook_url, data=data, headers={'Content-Type': 'application/json'})
        
        # We catch exceptions so an external outage doesn't crash our scanner loop
        with urllib.request.urlopen(req, timeout=5) as response:
            logger.info(f"Webhook dispatched successfully to {webhook_url}. Response code: {response.getcode()}")
    except urllib.error.URLError as e:
        logger.warning(f"Failed to dispatch webhook to {webhook_url}: {e.reason}. (This is expected in local MVP if URL is dummy)")
    except Exception as e:
        logger.error(f"Unexpected error dispatching webhook: {e}")
