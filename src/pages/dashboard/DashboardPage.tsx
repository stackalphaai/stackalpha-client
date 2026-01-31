import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Zap,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { analyticsApi, tradingApi, walletApi } from "@/services/api"
import { useAuthStore } from "@/stores/auth"
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
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState<TradeAnalytics | null>(null)
  const [dailyPnL, setDailyPnL] = useState<DailyPnL[]>([])
  const [activeSignals, setActiveSignals] = useState<Signal[]>([])
  const [openTrades, setOpenTrades] = useState<Trade[]>([])
  const [totalBalance, setTotalBalance] = useState<number>(0)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, pnlRes, signalsRes, tradesRes, walletsRes] = await Promise.all([
          analyticsApi.getTradeAnalytics("30d"),
          analyticsApi.getDailyPnL(30),
          tradingApi.getActiveSignals(),
          tradingApi.getOpenTrades(),
          walletApi.getWallets(),
        ])

        setAnalytics(analyticsRes.data)
        setDailyPnL(pnlRes.data)
        setActiveSignals(signalsRes.data.slice(0, 5))
        setOpenTrades(tradesRes.data.slice(0, 5))

        const balance = walletsRes.data.reduce(
          (sum: number, w: { balance_usd: number | null }) => sum + (w.balance_usd || 0),
          0
        )
        setTotalBalance(balance)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const stats = [
    {
      title: "Total Balance",
      value: `$${totalBalance.toLocaleString()}`,
      change: "+12.5%",
      trend: "up",
      icon: Wallet,
    },
    {
      title: "Active Signals",
      value: activeSignals.length.toString(),
      change: "New today",
      trend: "neutral",
      icon: Zap,
    },
    {
      title: "Win Rate",
      value: analytics ? `${analytics.win_rate.toFixed(1)}%` : "0%",
      change: analytics && analytics.win_rate > 50 ? "Above avg" : "Below avg",
      trend: analytics && analytics.win_rate > 50 ? "up" : "down",
      icon: Target,
    },
    {
      title: "Total P&L",
      value: analytics ? `$${analytics.total_pnl.toLocaleString()}` : "$0",
      change: analytics && analytics.total_pnl > 0 ? "Profit" : "Loss",
      trend: analytics && analytics.total_pnl > 0 ? "up" : "down",
      icon: Activity,
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-[300px]" />
            </CardContent>
          </Card>
          <Card>
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
      className="space-y-6"
    >
      {/* Welcome Banner */}
      {!user?.has_active_subscription && (
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-primary/20">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-lg font-semibold">Upgrade to Pro</h3>
                <p className="text-muted-foreground">
                  Get unlimited signals and auto-trading features
                </p>
              </div>
              <Button variant="gradient" onClick={() => navigate("/subscription")}>
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <div className="flex items-center mt-1">
                    {stat.trend === "up" && (
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    )}
                    {stat.trend === "down" && (
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-xs ${
                        stat.trend === "up"
                          ? "text-green-500"
                          : stat.trend === "down"
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
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
                    <Tooltip
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Signals</CardTitle>
                <CardDescription>Latest trading opportunities</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/signals")}>
                View All
              </Button>
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
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Entry: ${signal.entry_price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-500">
                          {signal.confidence_score}%
                        </p>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Symbol</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Direction</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Entry</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Size</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openTrades.map((trade) => (
                      <tr
                        key={trade.id}
                        className="border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/trades/${trade.id}`)}
                      >
                        <td className="py-3 px-4 font-medium">{trade.symbol}</td>
                        <td className="py-3 px-4">
                          <Badge variant={trade.direction === "long" ? "long" : "short"}>
                            {trade.direction.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          ${trade.entry_price?.toLocaleString() || "-"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          ${trade.position_size_usd.toLocaleString()}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-medium ${
                            (trade.unrealized_pnl || 0) >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {(trade.unrealized_pnl || 0) >= 0 ? "+" : ""}
                          ${(trade.unrealized_pnl || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
