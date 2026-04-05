"""FastAPI app: REST mutations, WebSocket broadcasts, CORS from env."""

import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.connection_manager import ConnectionManager
from app.schemas import (
    BrakeLightsPatch,
    HeadlightsPatch,
    PaintPatch,
    VehicleState,
    VehicleStateMessage,
)
from app.state import VehicleStore


def _cors_origins() -> list[str]:
    raw = os.environ.get("CORS_ORIGINS", "http://localhost:5173")
    return [o.strip() for o in raw.split(",") if o.strip()]


store = VehicleStore()
manager = ConnectionManager()


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    yield


app = FastAPI(title="Spectra Vehicle API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=False,
    allow_methods=["GET", "PATCH", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/vehicle", response_model=VehicleState)
def get_vehicle() -> VehicleState:
    return store.get()


@app.patch("/api/vehicle/headlights", response_model=VehicleState)
async def patch_headlights(body: HeadlightsPatch) -> VehicleState:
    state = store.patch_headlights(body)
    await manager.broadcast_vehicle_state(state)
    return state


@app.patch("/api/vehicle/brake-lights", response_model=VehicleState)
async def patch_brake_lights(body: BrakeLightsPatch) -> VehicleState:
    state = store.patch_brake_lights(body)
    await manager.broadcast_vehicle_state(state)
    return state


@app.patch("/api/vehicle/paint", response_model=VehicleState)
async def patch_paint(body: PaintPatch) -> VehicleState:
    state = store.patch_paint(body)
    await manager.broadcast_vehicle_state(state)
    return state


@app.post("/api/vehicle/paint/cycle", response_model=VehicleState)
async def post_paint_cycle() -> VehicleState:
    state = store.cycle_paint()
    await manager.broadcast_vehicle_state(state)
    return state


@app.websocket("/ws/vehicle")
async def vehicle_ws(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        await websocket.send_json(
            VehicleStateMessage(data=store.get()).model_dump(mode="json")
        )
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(websocket)
