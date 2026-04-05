import { useEffect, useRef, useState } from 'react'
import { getVehicleWsUrl } from '../env'
import type { VehicleState } from '../types/vehicle'
import { isVehicleStateMessage } from '../types/vehicle'

export type VehicleChannelStatus = 'connecting' | 'open' | 'closed' | 'error'

const INITIAL_BACKOFF_MS = 1000
const MAX_BACKOFF_MS = 30_000

export type UseVehicleChannelResult = {
  /** Latest state from a `vehicle_state` WebSocket message; null until first message. */
  state: VehicleState | null
  status: VehicleChannelStatus
  /** Set when missing env, parse failures are ignored, or a socket error event fires. */
  lastError: string | null
  /** Increments when scheduling a reconnect after close/error; resets on successful `open`. */
  retryCount: number
}

/**
 * Subscribes to `VITE_WS_URL`, expects `{ type: "vehicle_state", data: VehicleState }`.
 * Reconnects with exponential backoff after close or failed open.
 */
export function useVehicleChannel(): UseVehicleChannelResult {
  const [state, setState] = useState<VehicleState | null>(null)
  const [status, setStatus] = useState<VehicleChannelStatus>('connecting')
  const [lastError, setLastError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const attemptRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false

    const clearReconnect = () => {
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
    }

    function scheduleReconnect() {
      clearReconnect()
      setRetryCount((n) => n + 1)
      const exp = Math.min(MAX_BACKOFF_MS, INITIAL_BACKOFF_MS * 2 ** attemptRef.current)
      const jitter = Math.random() * 400
      reconnectTimerRef.current = setTimeout(connect, exp + jitter)
    }

    function connect() {
      if (cancelledRef.current) return

      let url: string
      try {
        url = getVehicleWsUrl()
      } catch (e) {
        setStatus('error')
        setLastError(e instanceof Error ? e.message : 'WebSocket URL not configured')
        return
      }

      attemptRef.current += 1
      setStatus('connecting')

      try {
        wsRef.current?.close()
        const ws = new WebSocket(url)
        wsRef.current = ws

        ws.onopen = () => {
          if (cancelledRef.current) return
          attemptRef.current = 0
          setRetryCount(0)
          setLastError(null)
          setStatus('open')
        }

        ws.onmessage = (ev) => {
          if (cancelledRef.current) return
          try {
            const data: unknown = JSON.parse(ev.data as string)
            if (isVehicleStateMessage(data)) {
              setState(data.data)
            }
          } catch {
            setLastError('Invalid WebSocket JSON')
          }
        }

        ws.onerror = () => {
          if (cancelledRef.current) return
          setLastError('WebSocket error')
        }

        ws.onclose = () => {
          if (cancelledRef.current) return
          setStatus('closed')
          scheduleReconnect()
        }
      } catch (e) {
        if (cancelledRef.current) return
        setStatus('error')
        setLastError(e instanceof Error ? e.message : 'Failed to open WebSocket')
        scheduleReconnect()
      }
    }

    connect()

    return () => {
      cancelledRef.current = true
      clearReconnect()
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [])

  return { state, status, lastError, retryCount }
}
