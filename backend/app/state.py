"""In-memory vehicle state (single-process; resets on restart)."""

from app.schemas import (
    PAINT_PALETTE_LEN,
    BrakeLightsPatch,
    HeadlightsPatch,
    PaintPatch,
    VehicleState,
)


class VehicleStore:
    def __init__(self) -> None:
        self._state = VehicleState()

    def get(self) -> VehicleState:
        return self._state.model_copy()

    def patch_headlights(self, body: HeadlightsPatch) -> VehicleState:
        self._state = self._state.model_copy(update={"headlights_on": body.on})
        return self.get()

    def patch_brake_lights(self, body: BrakeLightsPatch) -> VehicleState:
        self._state = self._state.model_copy(update={"brake_lights_on": body.on})
        return self.get()

    def patch_paint(self, body: PaintPatch) -> VehicleState:
        self._state = self._state.model_copy(update={"paint_index": body.index})
        return self.get()

    def cycle_paint(self) -> VehicleState:
        nxt = (self._state.paint_index + 1) % PAINT_PALETTE_LEN
        self._state = self._state.model_copy(update={"paint_index": nxt})
        return self.get()
