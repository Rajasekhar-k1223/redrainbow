from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import logging

logger = logging.getLogger("websockets")
logger.setLevel(logging.INFO)

router = APIRouter(tags=["Real-time Telemetry"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    """Real-time WebSocket endpoint for streaming security events to the frontend."""
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect the client to send much, we just keep the connection open
            data = await websocket.receive_text()
            logger.info(f"Client message: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
