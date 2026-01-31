import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  BarChart3,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { analyticsApi } from "@/services/api"
import type { TradeAnalytics, DailyPnL } from "@/types"

interface SymbolPerformance {
  symbol: string
  total_trades: number
  winning_trades: number
  total_pnl: number
  win_rate: number
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState("30d")
  const [analytics, setAnalytics] = useState<TradeAnalytics | null>(null)
  const [dailyPnL, setDailyPnL] = useState<DailyPnL[]>([])
  const [symbolPerformance, setSymbolPerformance] = useState<SymbolPerformance[]>([])

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      try {
        const [analyticsRes, pnlRes, symbolRes] = await Promise.all([
          analyticsApi.getTradeAnalytics(period),
          analyticsApi.getDailyPnL(period === "7d" ? 7 : period === "30d" ? 30 : 90),
          analyticsApi.getPerformanceBySymbol(),
        ])
        setAnalytics(analyticsRes.data)
        setDailyPnL(pnlRes.data)
        setSymbolPerformance(symbolRes.data)
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [period])

  const stats = analytics
    ? [
        {
          title: "Total Trades",
          value: analytics.total_trades,
          icon: Activity,
          color: "text-primary",
          bgColor: "bg-primary/10",
        },
        {
          title: "Win Rate",
          value: `${analytics.win_rate.toFixed(1)}%`,
          icon: Target,
          color: analytics.win_rate >= 50 ? "text-green-500" : "text-red-500",
          bgColor: analytics.win_rate >= 50 ? "bg-green-500/10" : "bg-red-500/10",
        },
        {
          title: "Total P&L",
          value: `$${analytics.total_pnl.toLocaleString()}`,
          icon: analytics.total_pnl >= 0 ? TrendingUp : TrendingDown,
          color: analytics.total_pnl >= 0 ? "text-green-500" : "text-red-500",
          bgColor: analytics.total_pnl >= 0 ? "bg-green-500/10" : "bg-red-500/10",
        },
        {
          title: "Avg P&L per Trade",
          value: `$${analytics.average_pnl.toFixed(2)}`,
          icon: BarChart3,
          color: analytics.average_pnl >= 0 ? "text-green-500" : "text-red-500",
          bgColor: analytics.average_pnl >= 0 ? "bg-green-500/10" : "bg-red-500/10",
        },
      ]
    : []

  const winLossData = analytics
    ? [
        { name: "Wins", value: analytics.winning_trades },
        { name: "Losses", value: analytics.losing_trades },
      ]
    : []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your trading performance</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Best/Worst Trade */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Best Trade</p>
                  <p className="text-2xl font-bold text-green-500 mt-1">
                    +${analytics.best_trade.toFixed(2)}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Worst Trade</p>
                  <p className="text-2xl font-bold text-red-500 mt-1">
                    ${analytics.worst_trade.toFixed(2)}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* P&L Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily P&L</CardTitle>
            <CardDescription>Your profit and loss over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {dailyPnL.length > 0 ? (
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
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString("en", { month: "short", day: "numeric" })
                      }
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
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Win/Loss Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Win/Loss Distribution</CardTitle>
            <CardDescription>Your trading success rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {winLossData.length > 0 && analytics && analytics.total_trades > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={winLossData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No trades yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Symbol */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Symbol</CardTitle>
          <CardDescription>How each trading pair is performing</CardDescription>
        </CardHeader>
        <CardContent>
          {symbolPerformance.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Bar Chart */}
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={symbolPerformance.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                    <YAxis dataKey="symbol" type="category" width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "P&L"]}
                    />
                    <Bar dataKey="total_pnl" radius={[0, 4, 4, 0]}>
                      {symbolPerformance.slice(0, 10).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.total_pnl >= 0 ? "#22c55e" : "#ef4444"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">
                        Symbol
                      </th>
                      <th className="text-right py-2 text-sm font-medium text-muted-foreground">
                        Trades
                      </th>
                      <th className="text-right py-2 text-sm font-medium text-muted-foreground">
                        Win Rate
                      </th>
                      <th className="text-right py-2 text-sm font-medium text-muted-foreground">
                        P&L
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {symbolPerformance.slice(0, 10).map((item) => (
                      <tr key={item.symbol} className="border-b last:border-0">
                        <td className="py-2 font-medium">{item.symbol}</td>
                        <td className="py-2 text-right text-muted-foreground">
                          {item.total_trades}
                        </td>
                        <td className="py-2 text-right">
                          <span
                            className={
                              item.win_rate >= 50 ? "text-green-500" : "text-red-500"
                            }
                          >
                            {item.win_rate.toFixed(1)}%
                          </span>
                        </td>
                        <td
                          className={`py-2 text-right font-medium ${
                            item.total_pnl >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {item.total_pnl >= 0 ? "+" : ""}${item.total_pnl.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No symbol performance data yet
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
