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
  History,
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
import { TopGainers, AIBriefingCard, StatCard } from "@/components/features"
import { analyticsApi, exchangeApi, tradingApi, walletApi } from "@/services/api"
import { useAuthStore } from "@/stores/auth"
import { cn, formatPrice } from "@/lib/utils"
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
      subtitle: "Your current total savings",
      tooltip: "Combined USD balance across all connected wallets and exchanges",
      value: `$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: totalBalance > 0 ? "Connected" : "No accounts",
      trend: (totalBalance > 0 ? "up" : "neutral") as "up" | "down" | "neutral",
      icon: Wallet,
    },
    {
      title: "Success Rate",
      subtitle: "How often your AI wins",
      tooltip: "Percentage of closed trades that were profitable (last 30 days)",
      value: analytics ? `${analytics.win_rate.toFixed(1)}%` : "0%",
      change: analytics && analytics.win_rate > 50 ? "Above avg" : "Below avg",
      trend: winTrend,
      icon: Target,
    },
    {
      title: "Total P&L",
      subtitle: "Your total net earnings",
      tooltip: "Cumulative realized profit & loss across all closed trades (last 30 days)",
      value: analytics ? `$${analytics.total_pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00",
      change: analytics && analytics.total_pnl > 0 ? "Profit" : analytics && analytics.total_pnl < 0 ? "Loss" : "No trades",
      trend: pnlTrend,
      icon: Activity,
    },
    {
      title: "New Opportunities",
      subtitle: "Fresh AI recommendations",
      tooltip: "AI-generated trading opportunities currently available to execute",
      value: activeSignals.length.toString(),
      change: activeSignals.length > 0 ? "Live now" : "None active",
      trend: (activeSignals.length > 0 ? "up" : "neutral") as "up" | "down" | "neutral",
      icon: Zap,
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

      {/* AI Daily Briefing */}
      <motion.div variants={itemVariants}>
        <AIBriefingCard
          userName={user?.full_name?.split(" ")[0]}
          performanceSummary={
            analytics && analytics.total_pnl >= 0 
              ? `Your portfolio is performing well, with a net profit of $${analytics.total_pnl.toFixed(2)} in the last 30 days.`
              : "Your portfolio is currently adjusting. Our AI is actively looking for high-probability signals to optimize your performance."
          }
          marketSentiment={
            activeSignals.length > 0 
              ? `Markets are showing high volatility with ${activeSignals.length} high-confidence opportunities detected across Binance and Hyperliquid.`
              : "Markets are currently consolidating. This is a great time to review your risk management settings."
          }
          recommendation={
            activeSignals.length > 0 
              ? `I recommend reviewing the ${activeSignals[0].symbol} ${activeSignals[0].direction} signal - it has a ${activeSignals[0].confidence_score}% confidence score.`
              : "Stay tuned for new signals. Our models are analyzing 150+ markets 24/7 for your next opportunity."
          }
          onAction={() => navigate("/signals")}
        />
      </motion.div>

      {/* Welcome Banner / Upgrade */}
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
        {stats.map((stat, i) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
            subtitle={stat.subtitle}
            delay={i * 0.1}
          />
        ))}
      </motion.div>

      {/* Charts and Tables */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* P&L Chart - Bento Style */}
        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance History
              </CardTitle>
              <CardDescription>Visualizing your growth over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyPnL}>
                    <defs>
                      <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-white/5" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                      className="text-[10px] font-bold text-zinc-500"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(value) => `$${value}`}
                      className="text-[10px] font-bold text-zinc-500"
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                      }}
                      itemStyle={{ color: "#fff", fontWeight: "bold" }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Earnings"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="pnl"
                      stroke="hsl(var(--primary))"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorPnl)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Recommendations - Bento Style */}
        <motion.div variants={itemVariants} className="md:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    AI Recommendations
                  </CardTitle>
                  <CardDescription>Top picks for you</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/signals")} className="text-zinc-500 hover:text-white">
                  All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                {activeSignals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                      <Activity className="w-6 h-6 text-zinc-700" />
                    </div>
                    <p className="text-sm font-bold text-zinc-500">
                      Analyzing markets...<br />No signals active.
                    </p>
                  </div>
                ) : (
                  activeSignals.map((signal, i) => (
                    <div
                      key={signal.id}
                      className="group/item relative flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden"
                      onClick={() => navigate(`/signals/${signal.id}`)}
                    >
                      {i === 0 && (
                        <div className="absolute top-0 right-0">
                          <Badge className="rounded-none rounded-bl-lg bg-primary/20 text-primary border-none text-[8px] font-black uppercase">Top Pick</Badge>
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover/item:scale-110",
                            signal.direction === "long"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          )}
                        >
                          {signal.direction === "long" ? (
                            <TrendingUp className="h-6 w-6" />
                          ) : (
                            <TrendingDown className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-white">{signal.symbol}</span>
                            <Badge className={cn(
                              "text-[8px] font-black uppercase border-none",
                              signal.direction === "long" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                            )}>
                              {signal.direction}
                            </Badge>
                          </div>
                          <p className="text-xs font-bold text-zinc-500">
                            Entry: {formatPrice(signal.entry_price)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary text-lg leading-none">
                          {signal.confidence_score}%
                        </p>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter mt-1">
                          Match
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            {activeSignals.length > 0 && (
              <div className="p-6 pt-0">
                <Button variant="outline" className="w-full rounded-xl border-white/5 text-zinc-400 hover:text-white" onClick={() => navigate("/signals")}>
                  View All Signals
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Lower Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={itemVariants}>
          <TopGainers limit={6} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Your Open Trades
                </CardTitle>
                <CardDescription>Currently active positions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/trades")} className="text-zinc-500 hover:text-white">
                All
              </Button>
            </CardHeader>
            <CardContent>
              {openTrades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                    <History className="w-6 h-6 text-zinc-700" />
                  </div>
                  <p className="text-sm font-bold text-zinc-500">
                    No active trades.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {openTrades.map((trade) => (
                    <div
                      key={trade.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group/trade"
                      onClick={() => navigate(`/trades/${trade.id}`)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-white">{trade.symbol}</span>
                          <Badge className={cn(
                            "text-[8px] font-black uppercase border-none",
                            trade.direction === "long" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                          )}>
                            {trade.direction}
                          </Badge>
                        </div>
                        <span
                          className={cn(
                            "font-black text-sm",
                            (trade.unrealized_pnl || 0) >= 0 ? "text-green-400" : "text-red-400"
                          )}
                        >
                          {(trade.unrealized_pnl || 0) >= 0 ? "+" : ""}
                          ${(trade.unrealized_pnl || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
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
