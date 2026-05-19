import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useSubscriptionModal } from "@/stores/subscription"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Zap,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { TopGainers } from "@/components/features/TopGainers"
import { analyticsApi, exchangeApi, tradingApi, walletApi } from "@/services/api"
import { useAuthStore } from "@/stores/auth"
import { formatPrice } from "@/lib/utils"
import type { Signal, Trade, DailyPnL, TradeAnalytics } from "@/types"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const openSubscription = useSubscriptionModal((s) => s.open)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [analytics, setAnalytics] = useState<TradeAnalytics | null>(null)
  const [dailyPnL, setDailyPnL] = useState<DailyPnL[]>([])
  const [activeSignals, setActiveSignals] = useState<Signal[]>([])
  const [openTrades, setOpenTrades] = useState<Trade[]>([])
  const [totalBalance, setTotalBalance] = useState<number>(0)

  const fetchDashboardData = async () => {
    setHasError(false)
    try {
      const [analyticsRes, pnlRes, signalsRes, tradesRes, walletsRes, exchangesRes] = await Promise.allSettled([
        analyticsApi.getTradeAnalytics("30d"),
        analyticsApi.getDailyPnL(30),
        tradingApi.getActiveSignals(),
        tradingApi.getOpenTrades(),
        walletApi.getWallets(),
        exchangeApi.getConnections(),
      ])

      const allRejected = [analyticsRes, pnlRes, signalsRes, tradesRes, walletsRes, exchangesRes].every(
        (r) => r.status === "rejected"
      )
      if (allRejected) setHasError(true)

      if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value.data)
      if (pnlRes.status === "fulfilled") setDailyPnL(pnlRes.value.data)
      if (signalsRes.status === "fulfilled") setActiveSignals(signalsRes.value.data.slice(0, 5))
      if (tradesRes.status === "fulfilled") setOpenTrades(tradesRes.value.data.slice(0, 5))

      // Sum balances from both wallets (Hyperliquid) and exchanges (Binance)
      let balance = 0
      if (walletsRes.status === "fulfilled") {
        balance += walletsRes.value.data.reduce(
          (sum: number, w: { balance_usd: number | null }) => sum + (w.balance_usd || 0),
          0
        )
      }
      if (exchangesRes.status === "fulfilled") {
        const exchanges = exchangesRes.value.data.items || exchangesRes.value.data || []
        balance += exchanges.reduce(
          (sum: number, ex: { balance_usd: number | null }) => sum + (ex.balance_usd || 0),
          0
        )
      }
      setTotalBalance(balance)
    } catch {
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const winTrend: "up" | "down" = analytics && analytics.win_rate > 50 ? "up" : "down"
  const pnlTrend: "up" | "down" | "neutral" = analytics && analytics.total_pnl > 0 ? "up" : analytics && analytics.total_pnl < 0 ? "down" : "neutral"

  const stats = [
    {
      title: "Total Balance",
      tooltip: "Combined USD balance across all connected wallets and exchanges",
      value: `$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: totalBalance > 0 ? "Connected" : "No accounts",
      trend: (totalBalance > 0 ? "up" : "neutral") as "up" | "down" | "neutral",
      icon: Wallet,
    },
    {
      title: "Active Signals",
      tooltip: "AI-generated trading opportunities currently available to execute",
      value: activeSignals.length.toString(),
      change: activeSignals.length > 0 ? "Live now" : "None active",
      trend: (activeSignals.length > 0 ? "up" : "neutral") as "up" | "down" | "neutral",
      icon: Zap,
    },
    {
      title: "Win Rate",
      tooltip: "Percentage of closed trades that were profitable (last 30 days)",
      value: analytics ? `${analytics.win_rate.toFixed(1)}%` : "0%",
      change: analytics && analytics.win_rate > 50 ? "Above avg" : "Below avg",
      trend: winTrend,
      icon: Target,
    },
    {
      title: "Total P&L",
      tooltip: "Cumulative realized profit & loss across all closed trades (last 30 days)",
      value: analytics ? `$${analytics.total_pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00",
      change: analytics && analytics.total_pnl > 0 ? "Profit" : analytics && analytics.total_pnl < 0 ? "Loss" : "No trades",
      trend: pnlTrend,
      icon: Activity,
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shimmer">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="shimmer">
            <CardContent className="p-6">
              <Skeleton className="h-[300px]" />
            </CardContent>
          </Card>
          <Card className="shimmer">
            <CardContent className="p-6">
              <Skeleton className="h-[300px]" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 relative"
    >
      <div className="aurora-glow w-[400px] h-[400px] top-[-10%] right-[-10%] opacity-20" />

      {/* Welcome Banner */}
      {!user?.has_active_subscription && !user?.is_subscribed && (
        <motion.div variants={itemVariants}>
          <Card glossy className="border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity shimmer" />
            <CardContent className="flex items-center justify-between p-8 relative">
              <div>
                <h3 className="text-2xl font-black gradient-text mb-1">Upgrade to Pro</h3>
                <p className="text-zinc-400 font-medium">
                  Get unlimited signals and auto-trading features
                </p>
              </div>
              <Button variant="gradient" size="lg" onClick={openSubscription} className="btn-glow px-8">
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <Card key={stat.title} className="relative group overflow-hidden border-white/5 bg-black/40 backdrop-blur-3xl">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="relative z-10">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    {stat.title}
                    <InfoTooltip content={stat.tooltip} />
                  </p>
                  <h3 className="text-3xl font-black text-white mt-2 tracking-tight">{stat.value}</h3>
                  <div className="flex items-center mt-2">
                    <div className={cn(
                      "flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                      stat.trend === "up" ? "bg-green-500/10 text-green-400" : 
                      stat.trend === "down" ? "bg-red-500/10 text-red-400" : "bg-zinc-500/10 text-zinc-400"
                    )}>
                      {stat.trend === "up" && <ArrowUpRight className="h-3 w-3 mr-0.5" />}
                      {stat.trend === "down" && <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                      {stat.change}
                    </div>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-white/5 shadow-inner">
                  <stat.icon className="h-7 w-7 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts and Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* P&L Chart */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <CardDescription>Daily profit/loss over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyPnL}>
                    <defs>
                      <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                      className="text-xs text-muted-foreground"
                    />
                    <YAxis
                      tickFormatter={(value) => `$${value}`}
                      className="text-xs text-muted-foreground"
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "P&L"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="pnl"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorPnl)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Signals */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Signals</CardTitle>
                  <CardDescription>Latest trading opportunities</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/signals")}>
                  View All
                </Button>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => navigate("/signals/exchange/binance")}
                >
                  Binance Signals
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => navigate("/signals/exchange/hyperliquid")}
                >
                  Hyperliquid Signals
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSignals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No active signals at the moment
                  </p>
                ) : (
                  activeSignals.map((signal) => (
                    <div
                      key={signal.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate(`/signals/${signal.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            signal.direction === "long"
                              ? "bg-green-500/20 text-green-500"
                              : "bg-red-500/20 text-red-500"
                          }`}
                        >
                          {signal.direction === "long" ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : (
                            <TrendingDown className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{signal.symbol}</span>
                            <Badge variant={signal.direction === "long" ? "long" : "short"}>
                              {signal.direction.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {(signal.exchange || "hyperliquid") === "binance" ? "Binance" : "HL"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Entry: {formatPrice(signal.entry_price)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-500">
                          {signal.confidence_score}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Confidence
                          <InfoTooltip content="AI model confidence in this signal" />
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Movers + Open Trades */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Movers - Real-time via WebSocket */}
        <motion.div variants={itemVariants}>
          <TopGainers limit={8} />
        </motion.div>

        {/* Open Trades */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Open Trades</CardTitle>
                <CardDescription>Your active positions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/trades")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {openTrades.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No open trades at the moment
                </p>
              ) : (
                <div className="space-y-3">
                  {openTrades.map((trade) => (
                    <div
                      key={trade.id}
                      className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/trades/${trade.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{trade.symbol}</span>
                          <Badge variant={trade.direction === "long" ? "long" : "short"} className="text-xs">
                            {trade.direction.toUpperCase()}
                          </Badge>
                        </div>
                        <span
                          className={`font-medium text-sm ${
                            (trade.unrealized_pnl || 0) >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {(trade.unrealized_pnl || 0) >= 0 ? "+" : ""}
                          ${(trade.unrealized_pnl || 0).toFixed(2)}
                          <InfoTooltip content="Estimated profit/loss if closed at current price" />
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Entry: {trade.entry_price ? formatPrice(trade.entry_price) : "-"}</span>
                        <span>Size: ${trade.position_size_usd.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
