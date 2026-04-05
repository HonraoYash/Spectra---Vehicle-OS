import { useCallback, useEffect, useState } from 'react'
import {
  VehicleApiError,
  getHealth,
  getVehicleState,
  patchBrakeLights,
  patchHeadlights,
  patchPaint,
  postPaintCycle,
} from '../api/vehicleClient'
import type { VehicleChannelStatus } from './useVehicleChannel'
import type { VehicleState } from '../types/vehicle'

type PendingAction = 'headlights' | 'brake' | 'paint'

export function useVehicleActions(state: VehicleState | null, status: VehicleChannelStatus) {
  const [apiHealth, setApiHealth] = useState<'ok' | 'err' | 'pending'>('pending')
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    getHealth()
      .then(() => {
        if (alive) setApiHealth('ok')
      })
      .catch(() => {
        if (alive) setApiHealth('err')
      })
    return () => {
      alive = false
    }
  }, [])

  const controlsLocked = state === null || status !== 'open' || pending !== null

  const runMutation = useCallback(
    async (key: PendingAction, fn: () => Promise<unknown>) => {
      if (!state || status !== 'open') return
      setPending(key)
      setActionError(null)
      try {
        await fn()
      } catch (e) {
        const msg =
          e instanceof VehicleApiError
            ? e.message || `HTTP ${e.status}`
            : e instanceof Error
              ? e.message
              : 'Request failed'
        setActionError(msg)
        try {
          await getVehicleState()
        } catch {
          /* WS remains authoritative */
        }
      } finally {
        setPending(null)
      }
    },
    [state, status],
  )

  const onHeadlights = useCallback(
    (on: boolean) => {
      void runMutation('headlights', () => patchHeadlights({ on }))
    },
    [runMutation],
  )

  const onBrake = useCallback(
    (on: boolean) => {
      void runMutation('brake', () => patchBrakeLights({ on }))
    },
    [runMutation],
  )

  const onSetPaint = useCallback(
    (index: number) => {
      void runMutation('paint', () => patchPaint({ index }))
    },
    [runMutation],
  )

  const onCyclePaint = useCallback(() => {
    void runMutation('paint', () => postPaintCycle())
  }, [runMutation])

  return {
    apiHealth,
    pending,
    actionError,
    controlsLocked,
    onHeadlights,
    onBrake,
    onSetPaint,
    onCyclePaint,
  }
}
