"""API and WebSocket payload models for vehicle visualization (Phase 0 contract)."""

from typing import Literal

from pydantic import BaseModel, Field


PAINT_PALETTE_LEN = 4


class VehicleState(BaseModel):
    """Authoritative in-memory vehicle state (mirrors frontend `VehicleState`)."""

    headlights_on: bool = False
    brake_lights_on: bool = False
    paint_index: int = Field(
        0,
        ge=0,
        le=PAINT_PALETTE_LEN - 1,
        description="Index into the configured paint palette",
    )


class HeadlightsPatch(BaseModel):
    on: bool


class BrakeLightsPatch(BaseModel):
    on: bool


class PaintPatch(BaseModel):
    index: int = Field(..., ge=0, le=PAINT_PALETTE_LEN - 1)


class VehicleStateMessage(BaseModel):
    """WebSocket envelope broadcast after REST mutations."""

    type: Literal["vehicle_state"] = "vehicle_state"
    data: VehicleState
