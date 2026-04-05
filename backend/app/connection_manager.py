"""Track WebSocket clients and broadcast JSON payloads."""

from fastapi import WebSocket

from app.schemas import VehicleState, VehicleStateMessage


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.add(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self._connections.discard(websocket)

    async def broadcast_vehicle_state(self, state: VehicleState) -> None:
        payload = VehicleStateMessage(data=state).model_dump(mode="json")
        dead: list[WebSocket] = []
        for ws in self._connections:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._connections.discard(ws)
