import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

class MongoManager:
    client: AsyncIOMotorClient = None

db_manager = MongoManager()

async def connect_to_mongo():
    db_manager.client = AsyncIOMotorClient(MONGO_URL)

async def close_mongo_connection():
    db_manager.client.close()

def get_mongo_db():
    # Returns the RedRainbow database instance
    return db_manager.client.redrainbow
