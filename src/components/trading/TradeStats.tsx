import { useEffect, useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  BarChart3,
  Trophy,
  Skull,
  Timer,
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { analyticsApi } from "@/services/api"
import type { TradeAnalytics, DailyPnL } from "@/types"

interface SymbolPerformance {
  symbol: string
  total_trades: number
  winning_trades: number
  total_pnl: number
  win_rate: number
}

const PIE_COLORS = ["#22c55e", "#ef4444"]

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
}

interface TradeStatsProps {
  /** If true, show a compact view suitable for embedding above a trades list */
  compact?: boolean
}

export function TradeStats({ compact = false }: TradeStatsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState("30d")
  const [analytics, setAnalytics] = useState<TradeAnalytics | null>(null)
  const [dailyPnL, setDailyPnL] = useState<DailyPnL[]>([])
  const [symbolPerf, setSymbolPerf] = useState<SymbolPerformance[]>([])

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true)
      try {
        const days = period === "7d" ? 7 : period === "30d" ? 30 : 90
        const [aRes, pRes, sRes] = await Promise.all([
          analyticsApi.getTradeAnalytics(period),
          analyticsApi.getDailyPnL(days),
          analyticsApi.getPerformanceBySymbol(),
        ])
        setAnalytics(aRes.data)
        setDailyPnL(pRes.data)
        setSymbolPerf(sRes.data?.slice(0, 8) || [])
      } catch {
        // silently fail — stats are non-critical
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [period])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        {!compact && <Skeleton className="h-72" />}
      </div>
    )
  }

  if (!analytics) return null

  const winLossData = [
    { name: "Wins", value: analytics.winning_trades },
    { name: "Losses", value: analytics.losing_trades },
  ]

  // Cumulative PnL curve
  const cumulativePnL = dailyPnL.reduce<{ date: string; cumPnl: number; pnl: number }[]>(
    (acc, d) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].cumPnl : 0
      acc.push({ date: d.date, cumPnl: +(prev + d.pnl).toFixed(2), pnl: d.pnl })
      return acc
    },
    []
  )

  const avgDurationHrs = analytics.average_duration_seconds
    ? (analytics.average_duration_seconds / 3600).toFixed(1)
    : null

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Performance Overview</p>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats cards — 2 rows on mobile, 1 row on desktop */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {/* Total Trades */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">
                  Total Trades
                  <InfoTooltip content="Closed trades in selected period" />
                </p>
                <p className="text-xl font-bold mt-0.5">{analytics.total_trades}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Win Rate */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">
                  Win Rate
                  <InfoTooltip content="Percentage of profitable trades" />
                </p>
                <p className={`text-xl font-bold mt-0.5 ${analytics.win_rate >= 50 ? "text-green-500" : "text-red-500"}`}>
                  {analytics.win_rate.toFixed(1)}%
                </p>
              </div>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${analytics.win_rate >= 50 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                <Target className={`h-4 w-4 ${analytics.win_rate >= 50 ? "text-green-500" : "text-red-500"}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total PnL */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">
                  Total P&L
                  <InfoTooltip content="Cumulative realized profit/loss" />
                </p>
                <p className={`text-xl font-bold mt-0.5 ${analytics.total_pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {analytics.total_pnl >= 0 ? "+" : ""}${analytics.total_pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${analytics.total_pnl >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                {analytics.total_pnl >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg PnL per Trade */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">
                  Avg per Trade
                  <InfoTooltip content="Average profit/loss per closed trade" />
                </p>
                <p className={`text-xl font-bold mt-0.5 ${analytics.average_pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {analytics.average_pnl >= 0 ? "+" : ""}${analytics.average_pnl.toFixed(2)}
                </p>
              </div>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${analytics.average_pnl >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                <BarChart3 className={`h-4 w-4 ${analytics.average_pnl >= 0 ? "text-green-500" : "text-red-500"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second row: Best/Worst/Duration */}
      <div className="grid gap-3 grid-cols-3">
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
              <Trophy className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Best Trade</p>
              <p className="text-sm font-bold text-green-500">+${analytics.best_trade.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
              <Skull className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Worst Trade</p>
              <p className="text-sm font-bold text-red-500">${analytics.worst_trade.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Timer className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Avg Duration</p>
              <p className="text-sm font-bold">{avgDurationHrs ? `${avgDurationHrs}h` : "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts — skip in compact mode */}
      {!compact && (
        <>
          {/* Equity Curve + Win/Loss Pie */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Equity Curve */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Equity Curve</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  {cumulativePnL.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cumulativePnL}>
                        <defs>
                          <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(d) => new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })}
                          className="text-xs text-muted-foreground"
                        />
                        <YAxis tickFormatter={(v) => `$${v}`} className="text-xs text-muted-foreground" />
                        <RechartsTooltip
                          contentStyle={tooltipStyle}
                          formatter={(value: number) => [`$${value.toFixed(2)}`, "Cumulative P&L"]}
                          labelFormatter={(l) => new Date(l).toLocaleDateString()}
                        />
                        <Area type="monotone" dataKey="cumPnl" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#eqGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      No P&L data for this period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Win/Loss Pie */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Win / Loss</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  {analytics.total_trades > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={winLossData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {winLossData.map((_, idx) => (
                            <Cell key={idx} fill={PIE_COLORS[idx]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      No trades yet
                    </div>
                  )}
                </div>
                <div className="flex justify-center gap-6 text-xs mt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    <span>Wins ({analytics.winning_trades})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span>Losses ({analytics.losing_trades})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily PnL Bars + Symbol Performance */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Daily PnL Bars */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Daily P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  {dailyPnL.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyPnL}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(d) => new Date(d).toLocaleDateString("en", { day: "numeric" })}
                          className="text-xs text-muted-foreground"
                        />
                        <YAxis tickFormatter={(v) => `$${v}`} className="text-xs text-muted-foreground" />
                        <RechartsTooltip
                          contentStyle={tooltipStyle}
                          formatter={(value: number) => [`$${value.toFixed(2)}`, "P&L"]}
                          labelFormatter={(l) => new Date(l).toLocaleDateString()}
                        />
                        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                          {dailyPnL.map((entry, idx) => (
                            <Cell key={idx} fill={entry.pnl >= 0 ? "#22c55e" : "#ef4444"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      No data
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Symbols */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top Symbols</CardTitle>
              </CardHeader>
              <CardContent>
                {symbolPerf.length > 0 ? (
                  <div className="space-y-2.5">
                    {symbolPerf.map((s) => (
                      <div key={s.symbol} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium w-24 truncate">{s.symbol}</span>
                          <span className="text-xs text-muted-foreground">{s.total_trades} trades</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{s.win_rate.toFixed(0)}% WR</span>
                          <span className={`font-mono font-medium ${s.total_pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {s.total_pnl >= 0 ? "+" : ""}${s.total_pnl.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                    No symbol data
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
