import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  Clock,
  BarChart3,
  Brain,
  Zap,
  Activity,
  Gauge,
  Loader2,
  AlertTriangle,
  Wallet,
  Copy,
  Check,
  ExternalLink,
  ArrowDownToLine,
  CircleDollarSign,
  Network,
  ShieldCheck,
  CandlestickChart as CandlestickIcon,
  Layers,
  CheckCircle2,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CandlestickChart, type Candle } from "@/components/charts"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { tradingApi, walletApi, exchangeApi } from "@/services/api"
import { useAuthStore } from "@/stores/auth"
import { useSubscriptionModal } from "@/stores/subscription"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import type { SignalDetail, Wallet as WalletType, ExchangeConnection } from "@/types"
import { formatPrice, formatRelativeTime } from "@/lib/utils"

const INDICATOR_LABELS: Record<string, string> = {
  rsi_14: "RSI (14)",
  macd: "MACD",
  macd_signal: "MACD Signal",
  macd_histogram: "MACD Histogram",
  bb_upper: "BB Upper",
  bb_middle: "BB Middle",
  bb_lower: "BB Lower",
  bb_width: "BB Width",
  ema_9: "EMA (9)",
  ema_21: "EMA (21)",
  ema_50: "EMA (50)",
  sma_200: "SMA (200)",
  stoch_k: "Stoch %K",
  stoch_d: "Stoch %D",
  atr_14: "ATR (14)",
  adx: "ADX",
  di_plus: "DI+",
  di_minus: "DI-",
  current_price: "Current Price",
  price_change_pct: "Price Change %",
  volume_avg: "Avg Volume",
  volume_current: "Current Volume",
}

function formatIndicatorValue(key: string, value: number): string {
  if (key.includes("volume")) return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (key.includes("price") || key.includes("bb_") || key.includes("ema_") || key.includes("sma_"))
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (key.includes("pct")) return `${value.toFixed(2)}%`
  return value.toFixed(4)
}

function getStatusVariant(status: string) {
  switch (status) {
    case "active": return "success" as const
    case "executed": return "info" as const
    case "expired": return "warning" as const
    case "cancelled": return "destructive" as const
    default: return "secondary" as const
  }
}

export default function SignalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const openSubscription = useSubscriptionModal((s) => s.open)
  const [signal, setSignal] = useState<SignalDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Execute dialog state
  const [showExecuteDialog, setShowExecuteDialog] = useState(false)
  const [wallets, setWallets] = useState<WalletType[]>([])
  const [exchanges, setExchanges] = useState<ExchangeConnection[]>([])
  const [selectedWalletId, setSelectedWalletId] = useState("")
  const [selectedExchangeId, setSelectedExchangeId] = useState("")
  const [leverage, setLeverage] = useState("")
  const [positionSizePercent, setPositionSizePercent] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)

  // Insufficient balance dialog
  const [showDepositDialog, setShowDepositDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Chart state
  const [candles, setCandles] = useState<Candle[]>([])
  const [chartInterval, setChartInterval] = useState("15m")
  const [isLoadingCandles, setIsLoadingCandles] = useState(false)

  const isBinanceSignal = signal?.exchange === "binance"

  useEffect(() => {
    const fetchSignal = async () => {
      if (!id) return
      try {
        const response = await tradingApi.getSignal(id)
        setSignal(response.data)
      } catch {
        setError("Signal not found")
      } finally {
        setIsLoading(false)
      }
    }
    fetchSignal()
  }, [id])

  // Fetch candles when signal loads or interval changes
  useEffect(() => {
    if (!signal) return
    const fetchCandles = async () => {
      setIsLoadingCandles(true)
      try {
        const response = await tradingApi.getCandles(signal.symbol, {
          exchange: signal.exchange,
          interval: chartInterval,
          limit: 100,
        })
        setCandles(response.data.candles || [])
      } catch {
        setCandles([])
      } finally {
        setIsLoadingCandles(false)
      }
    }
    fetchCandles()
  }, [signal?.symbol, signal?.exchange, chartInterval])

  const openExecuteDialog = async () => {
    if (!user?.has_active_subscription && !user?.is_subscribed) {
      openSubscription()
      return
    }

    try {
      if (signal?.exchange === "binance") {
        // Load exchange connections for Binance signals
        const response = await exchangeApi.getConnections()
        const activeExchanges = (response.data.items || response.data || []).filter(
          (c: ExchangeConnection) => c.status === "active"
        )
        setExchanges(activeExchanges)
        if (activeExchanges.length === 1) {
          setSelectedExchangeId(activeExchanges[0].id)
        }
      } else {
        // Load wallets for Hyperliquid signals
        const response = await walletApi.getWallets()
        const activeWallets = (response.data.items || response.data || []).filter(
          (w: WalletType) => w.status === "active" && w.is_trading_enabled
        )
        setWallets(activeWallets)
        if (activeWallets.length === 1) {
          setSelectedWalletId(activeWallets[0].id)
        }
      }
      if (signal) {
        setLeverage(String(signal.suggested_leverage))
        setPositionSizePercent(String(signal.suggested_position_size_percent))
      }
      setShowExecuteDialog(true)
    } catch {
      toast.error(signal?.exchange === "binance" ? "Failed to load exchanges" : "Failed to load wallets")
    }
  }

  const handleExecute = async () => {
    if (!signal) return
    if (isBinanceSignal && !selectedExchangeId) return
    if (!isBinanceSignal && !selectedWalletId) return

    setIsExecuting(true)
    try {
      const lev = leverage ? parseInt(leverage) : undefined
      const size = positionSizePercent ? parseFloat(positionSizePercent) : undefined

      await tradingApi.executeSignal(signal.id, {
        wallet_id: isBinanceSignal ? undefined : selectedWalletId,
        exchange_connection_id: isBinanceSignal ? selectedExchangeId : undefined,
        position_size_percent: size,
        leverage: lev,
      })
      toast.success(`Trade opened for ${signal.symbol} ${signal.direction.toUpperCase()}`)
      setShowExecuteDialog(false)
      navigate("/trades")
    } catch (err: unknown) {
      // Extract error message from any API response format
      const data =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string; error?: string; message?: string } } }).response?.data
          : undefined
      const message = data?.detail || data?.error || data?.message

      if (message && /insufficient balance/i.test(message)) {
        setShowExecuteDialog(false)
        setShowDepositDialog(true)
      } else {
        toast.error(message || "Failed to execute signal")
      }
    } finally {
      setIsExecuting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (error || !signal) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-2xl font-bold">Signal Not Found</p>
        <p className="text-muted-foreground">This signal may have been removed or does not exist.</p>
        <Button variant="outline" onClick={() => navigate("/signals")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Signals
        </Button>
      </div>
    )
  }

  const isLong = signal.direction === "long"
  const indicators = signal.technical_indicators
  const analysis = signal.analysis_data

  // Extract MTF data (stored alongside indicators for Binance signals)
  const mtfData = indicators ? {
    bias: (indicators as Record<string, unknown>).mtf_bias as string | undefined,
    stopLoss: (indicators as Record<string, unknown>).mtf_stop_loss as number | undefined,
    tpZones: (indicators as Record<string, unknown>).mtf_tp_zones as number[] | undefined,
    triggerPattern: (indicators as Record<string, unknown>).mtf_trigger_pattern as string | undefined,
    structureLevel: (indicators as Record<string, unknown>).mtf_structure_level as number | undefined,
  } : null
  const selectedWallet = wallets.find((w) => w.id === selectedWalletId)
  const selectedExchange = exchanges.find((e) => e.id === selectedExchangeId)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Back + Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/signals")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                isLong ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
              }`}
            >
              {isLong ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{signal.symbol}</h1>
                <Badge variant={isLong ? "long" : "short"}>
                  {signal.direction.toUpperCase()}
                </Badge>
                <Badge variant={getStatusVariant(signal.status)}>{signal.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(signal.created_at).toLocaleString()}
                <span className="ml-2 text-xs opacity-75">({formatRelativeTime(signal.created_at)})</span>
              </p>
            </div>
          </div>
        </div>
        {signal.status === "active" && (
          <Button variant="gradient" onClick={openExecuteDialog}>
            <Zap className="h-4 w-4 mr-2" />
            Execute Signal
          </Button>
        )}
      </div>

      {/* Price Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Entry Price</p>
            <p className="text-xl font-bold">{formatPrice(signal.entry_price)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Target className="h-3 w-3 text-green-500" /> Take Profit
            </p>
            <p className="text-xl font-bold text-green-500">
              {formatPrice(signal.take_profit_price)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <ShieldAlert className="h-3 w-3 text-red-500" /> Stop Loss
            </p>
            <p className="text-xl font-bold text-red-500">
              {formatPrice(signal.stop_loss_price)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Market Price</p>
            <p className="text-xl font-bold">{formatPrice(signal.market_price_at_creation)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Gauge className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Confidence</p>
            <p className="text-lg font-bold text-primary">
              {(signal.confidence_score * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Brain className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Consensus</p>
            <p className="text-lg font-bold">
              {signal.consensus_votes}/{signal.total_votes}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">R:R Ratio</p>
            <p className="text-lg font-bold">{signal.risk_reward_ratio.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Leverage</p>
            <p className="text-lg font-bold">{signal.suggested_leverage}x</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Position Size</p>
            <p className="text-lg font-bold">{signal.suggested_position_size_percent}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Expires</p>
            <p className="text-lg font-bold">
              {signal.expires_at
                ? new Date(signal.expires_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Candlestick Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CandlestickIcon className="h-5 w-5 text-primary" />
              Price Chart
            </CardTitle>
            <div className="flex gap-1">
              {["5m", "15m", "1h", "4h"].map((interval) => (
                <Button
                  key={interval}
                  variant={chartInterval === interval ? "default" : "ghost"}
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  onClick={() => setChartInterval(interval)}
                >
                  {interval}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoadingCandles ? (
            <Skeleton className="w-full h-[400px] rounded-lg" />
          ) : (
            <CandlestickChart
              candles={candles}
              entryPrice={signal.entry_price}
              takeProfitPrice={signal.take_profit_price}
              stopLossPrice={signal.stop_loss_price}
              direction={signal.direction}
              height={400}
            />
          )}
        </CardContent>
      </Card>

      {/* Multi-Timeframe Analysis (Binance signals with MTF data) */}
      {mtfData?.bias && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              4-Timeframe Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* 4h Trend */}
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">4H TREND</span>
                  <Badge variant={mtfData.bias === "BUY" ? "long" : "short"} className="text-[10px]">
                    {mtfData.bias}
                  </Badge>
                </div>
                <p className="text-sm font-semibold">
                  {mtfData.bias === "BUY" ? "Higher Highs & Lows" : "Lower Highs & Lows"}
                </p>
                <p className="text-xs text-muted-foreground">Sets directional bias</p>
              </div>

              {/* 1h Confirmation */}
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">1H CONFIRM</span>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-sm font-semibold">Trend Confirmed</p>
                {mtfData.tpZones && mtfData.tpZones.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    TP Zone: {formatPrice(mtfData.tpZones[0])}
                  </p>
                )}
              </div>

              {/* 15m Entry Zone */}
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">15M ZONE</span>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-sm font-semibold">At Entry Zone</p>
                {mtfData.structureLevel && (
                  <p className="text-xs text-muted-foreground">
                    Structure: {formatPrice(mtfData.structureLevel)}
                  </p>
                )}
              </div>

              {/* 5m Trigger */}
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">5M TRIGGER</span>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-sm font-semibold capitalize">
                  {(mtfData.triggerPattern || "").replace(/_/g, " ")}
                </p>
                <p className="text-xs text-muted-foreground">Entry pattern confirmed</p>
              </div>
            </div>

            {/* SL from structure */}
            {mtfData.stopLoss && (
              <div className="mt-4 flex items-center gap-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Structure-Based Stop Loss</p>
                  <p className="text-xs text-muted-foreground">
                    Behind 15m structure + 1x 5m ATR buffer
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-500">
                    {formatPrice(mtfData.stopLoss)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(Math.abs(signal.entry_price - mtfData.stopLoss) / signal.entry_price * 100).toFixed(2)}% from entry
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Outcome (if executed) */}
      {signal.outcome !== "pending" && (
        <Card
          className={`border-l-4 ${
            signal.outcome === "tp_hit"
              ? "border-l-green-500"
              : signal.outcome === "sl_hit"
                ? "border-l-red-500"
                : "border-l-yellow-500"
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Outcome</p>
              <p className="text-lg font-bold">
                {signal.outcome.replace("_", " ").toUpperCase()}
              </p>
            </div>
            {signal.actual_pnl_percent !== null && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">P&L</p>
                <p
                  className={`text-2xl font-bold ${
                    signal.actual_pnl_percent >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {signal.actual_pnl_percent >= 0 ? "+" : ""}
                  {signal.actual_pnl_percent.toFixed(2)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Analysis */}
        {analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.key_factors && analysis.key_factors.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Key Factors</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.key_factors.map((factor, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {analysis.combined_reasoning && (
                <div>
                  <p className="text-sm font-medium mb-2">Reasoning</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.combined_reasoning}
                  </p>
                </div>
              )}
              {analysis.market_data && (
                <div>
                  <p className="text-sm font-medium mb-2">Market Context</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(analysis.market_data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                        <span className="font-medium">
                          {typeof value === "number"
                            ? value < 0.01 && value > 0
                              ? value.toFixed(6)
                              : value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Technical Indicators */}
        {indicators && Object.keys(indicators).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Technical Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {Object.entries(indicators)
                  .filter(([key]) => !key.startsWith("mtf_") && typeof indicators[key] === "number")
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {INDICATOR_LABELS[key] || key}
                      </span>
                      <span className="font-mono font-medium">
                        {formatIndicatorValue(key, value as number)}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Execute Signal Dialog */}
      <Dialog open={showExecuteDialog} onOpenChange={setShowExecuteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Execute Signal — {signal.symbol} {signal.direction.toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              Review parameters and confirm to open a {signal.direction} position.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Exchange badge */}
            <Badge variant="outline" className="text-xs">
              {isBinanceSignal ? "Binance Futures" : "Hyperliquid"}
            </Badge>

            {/* Wallet / Exchange Selection */}
            {isBinanceSignal ? (
              <div className="space-y-2">
                <Label>Exchange Connection</Label>
                {exchanges.length === 0 ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-sm">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    <span>
                      No Binance connections found.{" "}
                      <button className="text-primary underline" onClick={() => navigate("/exchanges")}>
                        Connect your exchange
                      </button>{" "}
                      first.
                    </span>
                  </div>
                ) : (
                  <Select value={selectedExchangeId} onValueChange={setSelectedExchangeId}>
                    <SelectTrigger>
                      <Wallet className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select exchange" />
                    </SelectTrigger>
                    <SelectContent>
                      {exchanges.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.label || "Binance"} {e.is_testnet ? "(Testnet)" : ""}
                          {e.balance_usd != null && ` — $${e.balance_usd.toLocaleString()}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Wallet</Label>
                {wallets.length === 0 ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-sm">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    <span>
                      No trading-enabled wallets found.{" "}
                      <button className="text-primary underline" onClick={() => navigate("/wallets")}>
                        Connect a wallet
                      </button>{" "}
                      first.
                    </span>
                  </div>
                ) : (
                  <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                    <SelectTrigger>
                      <Wallet className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.address.slice(0, 6)}...{w.address.slice(-4)} ({w.wallet_type})
                          {w.balance_usd != null && ` — $${w.balance_usd.toLocaleString()}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Trade Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leverage">Leverage</Label>
                <Input
                  id="leverage"
                  type="number"
                  min={1}
                  max={20}
                  value={leverage}
                  onChange={(e) => setLeverage(e.target.value)}
                  placeholder={String(signal.suggested_leverage)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="positionSize">Position Size %</Label>
                <Input
                  id="positionSize"
                  type="number"
                  min={1}
                  max={100}
                  step={0.5}
                  value={positionSizePercent}
                  onChange={(e) => setPositionSizePercent(e.target.value)}
                  placeholder={String(signal.suggested_position_size_percent)}
                />
              </div>
            </div>

            {/* Trade Summary */}
            <div className="rounded-lg border p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Direction</span>
                <Badge variant={isLong ? "long" : "short"}>
                  {signal.direction.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entry Price</span>
                <span className="font-medium">{formatPrice(signal.entry_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Take Profit</span>
                <span className="font-medium text-green-500">{formatPrice(signal.take_profit_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stop Loss</span>
                <span className="font-medium text-red-500">{formatPrice(signal.stop_loss_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">R:R Ratio</span>
                <span className="font-medium">{signal.risk_reward_ratio.toFixed(2)}</span>
              </div>
              {(() => {
                const balanceSource = isBinanceSignal ? selectedExchange?.balance_usd : selectedWallet?.balance_usd
                if (balanceSource != null && positionSizePercent) {
                  return (
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">Est. Position</span>
                      <span className="font-medium">
                        ~${((balanceSource * parseFloat(positionSizePercent)) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExecuteDialog(false)} disabled={isExecuting}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleExecute}
              disabled={
                isExecuting ||
                (isBinanceSignal ? !selectedExchangeId || exchanges.length === 0 : !selectedWalletId || wallets.length === 0)
              }
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Confirm Trade
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insufficient Balance — Deposit Instructions Dialog */}
      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="h-14 w-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
              <CircleDollarSign className="h-7 w-7 text-amber-500" />
            </div>
            <DialogTitle className="text-center text-xl">Insufficient Balance</DialogTitle>
            <DialogDescription className="text-center">
              You need more USDC in your Hyperliquid perps account to execute this trade.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 overflow-y-auto flex-1 min-h-0">
            {/* Balance vs Required comparison */}
            {selectedWallet && signal && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Available balance</span>
                  <span className="font-bold text-destructive">
                    ${(selectedWallet.balance_usd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {positionSizePercent && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estimated position</span>
                    <span className="font-bold">
                      ~${((selectedWallet.balance_usd ?? 0) * parseFloat(positionSizePercent) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Signal</span>
                  <span className="font-medium">
                    {signal.symbol} {signal.direction.toUpperCase()} @ {leverage || signal.suggested_leverage}x
                  </span>
                </div>
              </div>
            )}

            {/* Wallet address with copy */}
            {selectedWallet && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-1.5">Your wallet address</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono flex-1 truncate">
                    {selectedWallet.address}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedWallet.address)
                      setCopied(true)
                      toast.success("Address copied!")
                      setTimeout(() => setCopied(false), 2000)
                    }}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {/* Network & currency info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <Network className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Network</p>
                <p className="text-sm font-semibold">Arbitrum One</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <CircleDollarSign className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Currency</p>
                <p className="text-sm font-semibold">USDC</p>
              </div>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-3">
              <p className="text-sm font-medium">How to deposit</p>

              <div className="flex gap-3 items-start">
                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Get USDC on Arbitrum</p>
                  <p className="text-xs text-muted-foreground">
                    Buy USDC on any exchange (Binance, Coinbase, Bybit) or bridge
                    from another network to Arbitrum One.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Send to your wallet</p>
                  <p className="text-xs text-muted-foreground">
                    Withdraw USDC to the address above on the{" "}
                    <span className="font-medium text-foreground">Arbitrum</span> network.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Deposit into Hyperliquid</p>
                  <p className="text-xs text-muted-foreground">
                    Open{" "}
                    <a
                      href="https://app.hyperliquid.xyz/portfolio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline inline-flex items-center gap-0.5"
                    >
                      app.hyperliquid.xyz <ExternalLink className="h-3 w-3" />
                    </a>
                    {" "}and deposit USDC into your perps account.
                  </p>
                </div>
              </div>
            </div>

            {/* Security note */}
            <div className="flex gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Your funds stay in your wallet.</span>{" "}
                StackAlpha can only place and close trades — it cannot
                withdraw or transfer your funds.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 shrink-0">
            {/* Primary action — sync wallet and retry */}
            <Button
              variant="gradient"
              className="w-full"
              disabled={isSyncing}
              onClick={async () => {
                if (!selectedWalletId) return
                setIsSyncing(true)
                try {
                  await walletApi.syncWallet(selectedWalletId)
                  // Refresh wallet data
                  const response = await walletApi.getWallets()
                  const activeWallets = (response.data.items || response.data || []).filter(
                    (w: WalletType) => w.status === "active" && w.is_trading_enabled
                  )
                  setWallets(activeWallets)
                  const updatedWallet = activeWallets.find((w: WalletType) => w.id === selectedWalletId)
                  if (updatedWallet) {
                    toast.success(`Balance updated: $${(updatedWallet.balance_usd ?? 0).toLocaleString()}`)
                  }
                  // Close deposit dialog and re-open execute dialog to retry
                  setShowDepositDialog(false)
                  setShowExecuteDialog(true)
                } catch {
                  toast.error("Failed to sync wallet. Try again in a moment.")
                } finally {
                  setIsSyncing(false)
                }
              }}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing Wallet...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Sync Wallet & Retry
                </>
              )}
            </Button>
            {/* Secondary actions */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button variant="outline" onClick={() => window.open("https://app.hyperliquid.xyz/portfolio", "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Hyperliquid
              </Button>
              <Button variant="outline" onClick={() => { setShowDepositDialog(false); navigate("/wallets") }}>
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Wallets
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
