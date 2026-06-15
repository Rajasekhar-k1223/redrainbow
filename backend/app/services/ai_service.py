import google.generativeai as genai
from app.core.config import settings

def get_gemini_client():
    """Initialize and return the Gemini model client."""
    if not settings.gemini_api_key:
        return None
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel("gemini-1.5-flash")


def generate_remediation_plan(incident_title: str, incident_summary: str, asset_identifier: str = "Unknown") -> str:
    """
    Uses Gemini to generate a structured remediation plan for a given security incident.
    Returns a structured markdown string or a fallback message.
    """
    model = get_gemini_client()
    
    if not model:
        return (
            "**AI Core Offline** — No Gemini API key configured.\n\n"
            "To enable AI-powered remediation, set a valid `GEMINI_API_KEY` in your `.env` file.\n\n"
            "**Generic Remediation Steps:**\n"
            "1. Isolate the affected system from the network.\n"
            "2. Preserve forensic evidence before making changes.\n"
            "3. Identify the root cause from audit logs.\n"
            "4. Apply patches or configuration changes.\n"
            "5. Restore from a known-good backup if necessary.\n"
            "6. Conduct a post-incident review and update playbooks."
        )

    prompt = f"""You are a Principal Incident Responder at a world-class Security Operations Center.

A security incident has been detected. Your task is to provide a clear, professional, and actionable remediation plan.

**Incident Title:** {incident_title}
**Incident Details:** {incident_summary}
**Affected Asset:** {asset_identifier}

Respond ONLY in markdown format. Structure your response as:
1. **Immediate Actions (0-1 hour)** - Containment steps
2. **Short-Term Remediation (1-24 hours)** - Investigation and fixes
3. **Long-Term Hardening (1-7 days)** - Systemic improvements to prevent recurrence
4. **Key Indicators of Compromise (IOCs)** to monitor

Be specific, concise, and technical. Limit to 300 words."""

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return (
            f"**AI Core Error** — Failed to contact Gemini API: {str(e)}\n\n"
            "Please check your `GEMINI_API_KEY` and network connection."
        )
