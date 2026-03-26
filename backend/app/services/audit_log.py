from datetime import datetime

from app.db.mongo import get_mongo_db


async def log_audit_event(event: dict):
    event["timestamp"] = datetime.utcnow().isoformat()
    db = get_mongo_db()
    await db.get_collection("audit_events").insert_one(event)
