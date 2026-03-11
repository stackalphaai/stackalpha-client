import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Shield,
  AlertTriangle,
  Activity,
  TrendingDown,
  Power,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { riskApi } from "@/services/api"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { RiskSettings, PortfolioMetrics, CircuitBreakerStatus } from "@/types"

export default function RiskManagementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showKillSwitchDialog, setShowKillSwitchDialog] = useState(false)

  const [settings, setSettings] = useState<RiskSettings | null>(null)
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null)
  const [circuitBreaker, setCircuitBreaker] = useState<CircuitBreakerStatus | null>(null)

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => {
      fetchMetrics()
    }, 5000) // Refresh metrics every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [settingsRes, metricsRes, cbRes] = await Promise.all([
        riskApi.getSettings(),
        riskApi.getPortfolioMetrics(),
        riskApi.getCircuitBreakerStatus(),
      ])

      setSettings(settingsRes.data)
      setMetrics(metricsRes.data)
      setCircuitBreaker(cbRes.data)
    } catch (error) {
      console.error("Failed to fetch risk data:", error)
      toast.error("Failed to load risk management data")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMetrics = async () => {
    try {
      const [metricsRes, cbRes] = await Promise.all([
        riskApi.getPortfolioMetrics(),
        riskApi.getCircuitBreakerStatus(),
      ])
      setMetrics(metricsRes.data)
      setCircuitBreaker(cbRes.data)
    } catch (error) {
      console.error("Failed to fetch metrics:", error)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return

    setIsSaving(true)
    try {
      await riskApi.updateSettings(settings)
      toast.success("Risk settings updated successfully")
      await fetchData()
    } catch (error) {
      toast.error("Failed to update settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePauseTrading = async () => {
    try {
      await riskApi.pauseTrading({ reason: "Manual pause by user" })
      toast.success("Trading paused")
      await fetchData()
    } catch (error) {
      toast.error("Failed to pause trading")
    }
  }

  const handleResumeTrading = async () => {
    try {
      await riskApi.resumeTrading()
      toast.success("Trading resumed")
      await fetchData()
    } catch (error) {
      toast.error("Failed to resume trading")
    }
  }

  const handleKillSwitch = async () => {
    try {
      await riskApi.activateKillSwitch(true)
      setShowKillSwitchDialog(false)
      toast.error("Kill switch activated - All trading stopped")
      await fetchData()
    } catch (error) {
      toast.error("Failed to activate kill switch")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!settings || !metrics || !circuitBreaker) return null

  const portfolioHeatColor =
    metrics.portfolio_heat >= 60 ? "text-red-500" : metrics.portfolio_heat >= 40 ? "text-yellow-500" : "text-green-500"

  const statusColor =
    circuitBreaker.status === "active"
      ? "text-green-500"
      : circuitBreaker.status === "paused"
      ? "text-yellow-500"
      : "text-red-500"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Risk Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure position sizing, drawdown limits, and circuit breakers
        </p>
      </div>

      {/* Circuit Breaker Status Banner */}
      {circuitBreaker.status !== "active" && (
        <Card className="border-yellow-500 bg-yellow-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <div>
                  <div className="font-semibold">
                    Trading {circuitBreaker.status === "paused" ? "Paused" : "Stopped"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {circuitBreaker.paused_reason}
                  </div>
                </div>
              </div>
              {circuitBreaker.status === "paused" && (
                <Button onClick={handleResumeTrading} className="gap-2">
                  <Play className="h-4 w-4" />
                  Resume Trading
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-default">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">Portfolio Heat</div>
                  <Activity className={`h-5 w-5 ${portfolioHeatColor}`} />
                </div>
                <div className={`text-3xl font-bold ${portfolioHeatColor}`}>
                  {metrics.portfolio_heat.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Risk exposure across positions
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            Overall risk exposure across all positions. &lt;40% = safe (green), 40–60% = moderate (yellow), &gt;60% = high risk (red)
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-default">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">Daily P&L</div>
                  <TrendingDown className={metrics.daily_pnl >= 0 ? "text-green-500" : "text-red-500"} />
                </div>
                <div className={`text-3xl font-bold ${metrics.daily_pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                  ${metrics.daily_pnl.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.abs(metrics.daily_pnl / metrics.total_equity * 100).toFixed(2)}% of equity
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>Today's realized and unrealized P&L as a percentage of total account equity</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-default">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">Open Positions</div>
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div className="text-3xl font-bold">
                  {metrics.open_positions_count}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Max: {settings.max_open_positions}
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>Number of currently open positions out of your configured maximum</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-default">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">Consecutive Losses</div>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="text-3xl font-bold text-red-500">
                  {metrics.consecutive_losses}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Max: {settings.max_consecutive_losses}
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>Current streak of losing trades in a row. Trading halts automatically at the configured max</TooltipContent>
        </Tooltip>
      </div>

      {/* Emergency Controls */}
      <Card className="border-red-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Power className="h-5 w-5 text-red-500" />
            Emergency Controls
          </CardTitle>
          <CardDescription>Quick actions to protect your capital</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="font-medium mb-1">Trading Status</div>
              <div className="flex items-center gap-2">
                {circuitBreaker.trading_allowed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className={statusColor}>
                  {circuitBreaker.status === "active" ? "Active" : circuitBreaker.status === "paused" ? "Paused" : "Stopped"}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              {circuitBreaker.status === "active" ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handlePauseTrading} className="gap-2">
                      <Pause className="h-4 w-4" />
                      Pause Trading
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Temporarily stop new trades from opening without closing existing positions</TooltipContent>
                </Tooltip>
              ) : circuitBreaker.status === "paused" ? (
                <Button onClick={handleResumeTrading} className="gap-2">
                  <Play className="h-4 w-4" />
                  Resume Trading
                </Button>
              ) : null}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="destructive" onClick={() => setShowKillSwitchDialog(true)} className="gap-2">
                    <Power className="h-4 w-4" />
                    Kill Switch
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Emergency: immediately close ALL open positions and stop all trading</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Settings</CardTitle>
          <CardDescription>Configure your risk management parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Position Sizing */}
          <div className="space-y-4">
            <div className="font-medium">Position Sizing</div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="cursor-default">Position Sizing Method</Label>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Fixed Percent: risk the same % per trade. Fixed Amount: risk a set $ amount. Kelly: mathematically optimal sizing based on win rate. Risk Parity: equal risk across all positions
                  </TooltipContent>
                </Tooltip>
                <Select
                  value={settings.position_sizing_method}
                  onValueChange={(value) =>
                    setSettings({ ...settings, position_sizing_method: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed_percent">Fixed Percent</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    <SelectItem value="kelly">Kelly Criterion</SelectItem>
                    <SelectItem value="risk_parity">Risk Parity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="cursor-default">Max Position Size (%)</Label>
                  </TooltipTrigger>
                  <TooltipContent>Maximum percentage of account balance to risk on a single trade</TooltipContent>
                </Tooltip>
                <Input
                  type="number"
                  value={settings.max_position_size_percent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      max_position_size_percent: parseFloat(e.target.value),
                    })
                  }
                  min={1}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="cursor-default">Max Position Size ($)</Label>
                  </TooltipTrigger>
                  <TooltipContent>Hard dollar cap on any single position regardless of account size</TooltipContent>
                </Tooltip>
                <Input
                  type="number"
                  value={settings.max_position_size_usd}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      max_position_size_usd: parseFloat(e.target.value),
                    })
                  }
                  min={100}
                  step={100}
                />
              </div>

              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="cursor-default">Max Open Positions</Label>
                  </TooltipTrigger>
                  <TooltipContent>Maximum number of trades that can be open simultaneously. Limits overall exposure</TooltipContent>
                </Tooltip>
                <Input
                  type="number"
                  value={settings.max_open_positions}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      max_open_positions: parseInt(e.target.value),
                    })
                  }
                  min={1}
                  max={20}
                />
              </div>
            </div>
          </div>

          {/* Drawdown Limits */}
          <div className="space-y-4">
            <div className="font-medium">Drawdown Limits</div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="cursor-default">Max Daily Loss ($)</Label>
                  </TooltipTrigger>
                  <TooltipContent>Trading halts automatically if total losses exceed this dollar amount today</TooltipContent>
                </Tooltip>
                <Input
                  type="number"
                  value={settings.max_daily_loss_usd}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      max_daily_loss_usd: parseFloat(e.target.value),
                    })
                  }
                  min={10}
                  step={10}
                />
              </div>

              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="cursor-default">Max Daily Loss (%)</Label>
                  </TooltipTrigger>
                  <TooltipContent>Trading pauses if daily losses exceed this percentage of total account equity</TooltipContent>
                </Tooltip>
                <Input
                  type="number"
                  value={settings.max_daily_loss_percent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      max_daily_loss_percent: parseFloat(e.target.value),
                    })
                  }
                  min={1}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="cursor-default">Max Weekly Loss (%)</Label>
                  </TooltipTrigger>
                  <TooltipContent>Trading pauses for the week if cumulative losses exceed this percentage of equity</TooltipContent>
                </Tooltip>
                <Input
                  type="number"
                  value={settings.max_weekly_loss_percent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      max_weekly_loss_percent: parseFloat(e.target.value),
                    })
                  }
                  min={1}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="cursor-default">Max Consecutive Losses</Label>
                  </TooltipTrigger>
                  <TooltipContent>Trading pauses after this many losing trades in a row to prevent tilt-driven losses</TooltipContent>
                </Tooltip>
                <Input
                  type="number"
                  value={settings.max_consecutive_losses}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      max_consecutive_losses: parseInt(e.target.value),
                    })
                  }
                  min={1}
                  max={10}
                />
              </div>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="space-y-4">
            <div className="font-medium">Advanced Features</div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="cursor-default">Trailing Stop Loss</Label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Stop loss moves automatically in your favor as price rises, locking in profits while limiting downside
                    </TooltipContent>
                  </Tooltip>
                  <div className="text-xs text-muted-foreground">
                    Automatically lock in profits
                  </div>
                </div>
                <Switch
                  checked={settings.enable_trailing_stop}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enable_trailing_stop: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="cursor-default">Scale Out</Label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Automatically close portions of the position at predefined profit targets, securing gains incrementally
                    </TooltipContent>
                  </Tooltip>
                  <div className="text-xs text-muted-foreground">
                    Take profits in tranches
                  </div>
                </div>
                <Switch
                  checked={settings.enable_scale_out}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enable_scale_out: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="cursor-default">Pyramiding</Label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Add to a winning position as price moves in your favor, increasing exposure when the trade is profitable
                    </TooltipContent>
                  </Tooltip>
                  <div className="text-xs text-muted-foreground">
                    Add to winning positions
                  </div>
                </div>
                <Switch
                  checked={settings.enable_pyramiding}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enable_pyramiding: checked })
                  }
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full">
              {isSaving ? "Saving..." : "Save Risk Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Kill Switch Confirmation */}
      <AlertDialog open={showKillSwitchDialog} onOpenChange={setShowKillSwitchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Emergency Kill Switch
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">This will immediately:</span>
              <span className="block font-medium text-foreground">- Close all open positions</span>
              <span className="block font-medium text-foreground">- Stop all automated trading</span>
              <span className="block mt-2">Are you absolutely sure you want to proceed?</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleKillSwitch}
            >
              Activate Kill Switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
