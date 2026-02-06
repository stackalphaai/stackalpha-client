import { useEffect, useRef, useState, useCallback } from "react"

export interface CoinData {
  symbol: string
  mid_price: number
  mark_price: number
  prev_day_price: number
  day_change_pct: number
  volume_24h: number
  funding_rate: number
  open_interest: number
}

export interface TopGainersData {
  gainers: CoinData[]
  losers: CoinData[]
  top_volume: CoinData[]
  total_coins: number
}

interface TopGainersMessage {
  type: string
  timestamp: number
  data: TopGainersData
}

interface UseTopGainersOptions {
  enabled?: boolean
}

function getWsBaseUrl(): string {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  return `${protocol}//${window.location.host}/api`
}

const MAX_RECONNECT_DELAY = 30000
const INITIAL_RECONNECT_DELAY = 1000
const HEARTBEAT_INTERVAL = 30000

export function useTopGainers(options: UseTopGainersOptions = {}) {
  const { enabled = true } = options

  const [data, setData] = useState<TopGainersData | null>(null)
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
      wsRef.current.onclose = null // Prevent reconnect on intentional close
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (!enabledRef.current) return

    cleanup()

    const wsUrl = `${getWsBaseUrl()}/v1/ws/top-gainers`

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setError(null)
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY

        // Start heartbeat
        heartbeatRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send("ping")
          }
        }, HEARTBEAT_INTERVAL)
      }

      ws.onmessage = (event) => {
        try {
          const message: TopGainersMessage = JSON.parse(event.data)

          if (message.type === "pong") return

          if (message.type === "top_gainers_update" && message.data) {
            // Detect price direction changes for flash animations
            const changes: Record<string, "up" | "down" | null> = {}
            const allCoins = [...(message.data.gainers || []), ...(message.data.losers || [])]

            for (const coin of allCoins) {
              const prevPrice = prevPricesRef.current[coin.symbol]
              if (prevPrice !== undefined && prevPrice !== coin.mid_price) {
                changes[coin.symbol] = coin.mid_price > prevPrice ? "up" : "down"
              }
              prevPricesRef.current[coin.symbol] = coin.mid_price
            }

            if (Object.keys(changes).length > 0) {
              setPriceChanges(changes)
              // Clear flash after animation
              setTimeout(() => setPriceChanges({}), 600)
            }

            setData(message.data)
          }
        } catch {
          // Ignore parse errors
        }
      }

      ws.onclose = () => {
        setIsConnected(false)

        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current)
          heartbeatRef.current = null
        }

        // Reconnect with exponential backoff
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
    } catch (err) {
      setError("Failed to create WebSocket connection")
    }
  }, [cleanup])

  useEffect(() => {
    enabledRef.current = enabled

    if (enabled) {
      connect()
    } else {
      cleanup()
      setIsConnected(false)
      setData(null)
    }

    return cleanup
  }, [enabled, connect, cleanup])

  return {
    data,
    isConnected,
    error,
    priceChanges,
    gainers: data?.gainers ?? [],
    losers: data?.losers ?? [],
    topVolume: data?.top_volume ?? [],
    totalCoins: data?.total_coins ?? 0,
  }
}
