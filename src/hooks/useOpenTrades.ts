import { useEffect, useRef, useState, useCallback } from "react"
import { useAuthStore } from "@/stores/auth"
import type { LiveTradeData, TradesSummary } from "@/types"

interface TradesUpdateMessage {
  type: string
  timestamp: number
  data: {
    trades: LiveTradeData[]
    summary: TradesSummary
  }
}

interface UseOpenTradesOptions {
  enabled?: boolean
}

function getWsBaseUrl(): string {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL
  const apiUrl = import.meta.env.VITE_API_URL
  if (apiUrl) {
    return apiUrl.replace(/^https:/, "wss:").replace(/^http:/, "ws:")
  }
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  return `${protocol}//${window.location.host}/api`
}

const MAX_RECONNECT_DELAY = 30000
const INITIAL_RECONNECT_DELAY = 1000
const HEARTBEAT_INTERVAL = 30000

export function useOpenTrades(options: UseOpenTradesOptions = {}) {
  const { enabled = true } = options

  const [trades, setTrades] = useState<LiveTradeData[]>([])
  const [summary, setSummary] = useState<TradesSummary>({
    total_open: 0,
    total_unrealized_pnl: 0,
    total_margin_used: 0,
  })
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const enabledRef = useRef(enabled)

  // Track previous prices for flash animations
  const [priceChanges, setPriceChanges] = useState<Record<string, "up" | "down" | null>>({})
  const prevPricesRef = useRef<Record<string, number>>({})

  enabledRef.current = enabled

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (!enabledRef.current) return

    const token = useAuthStore.getState().accessToken
    if (!token) {
      setError("Not authenticated")
      return
    }

    cleanup()

    const wsUrl = `${getWsBaseUrl()}/v1/ws/trades?token=${encodeURIComponent(token)}`

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setError(null)
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY

        heartbeatRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send("ping")
          }
        }, HEARTBEAT_INTERVAL)
      }

      ws.onmessage = (event) => {
        try {
          const message: TradesUpdateMessage = JSON.parse(event.data)

          if (message.type === "pong") return

          if (message.type === "trades_update" && message.data) {
            // Detect price changes for flash animations
            const changes: Record<string, "up" | "down" | null> = {}
            for (const trade of message.data.trades) {
              const prevPrice = prevPricesRef.current[trade.id]
              const currentPrice = trade.current_price || 0
              if (prevPrice !== undefined && prevPrice !== currentPrice) {
                changes[trade.id] = currentPrice > prevPrice ? "up" : "down"
              }
              prevPricesRef.current[trade.id] = currentPrice
            }

            if (Object.keys(changes).length > 0) {
              setPriceChanges(changes)
              setTimeout(() => setPriceChanges({}), 600)
            }

            setTrades(message.data.trades)
            setSummary(message.data.summary)
          }
        } catch {
          // Ignore parse errors
        }
      }

      ws.onclose = (event) => {
        setIsConnected(false)

        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current)
          heartbeatRef.current = null
        }

        // Don't reconnect if auth failed
        if (event.code === 4001) {
          setError("Authentication failed")
          return
        }

        if (enabledRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectDelayRef.current = Math.min(
              reconnectDelayRef.current * 2,
              MAX_RECONNECT_DELAY
            )
            connect()
          }, reconnectDelayRef.current)
        }
      }

      ws.onerror = () => {
        setError("WebSocket connection error")
      }
    } catch {
      setError("Failed to create WebSocket connection")
    }
  }, [cleanup])

  // Watch for auth changes — reconnect on token change, disconnect on logout
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    enabledRef.current = enabled

    if (enabled && accessToken) {
      connect()
    } else {
      cleanup()
      setIsConnected(false)
      setTrades([])
      setSummary({ total_open: 0, total_unrealized_pnl: 0, total_margin_used: 0 })
    }

    return cleanup
  }, [enabled, accessToken, connect, cleanup])

  return {
    trades,
    summary,
    isConnected,
    error,
    priceChanges,
  }
}
