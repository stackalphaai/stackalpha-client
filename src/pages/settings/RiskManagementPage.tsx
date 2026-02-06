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
import { riskApi } from "@/services/api"
import type { RiskSettings, PortfolioMetrics, CircuitBreakerStatus } from "@/types"

export default function RiskManagementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

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
    const confirmed = window.confirm(
      "🚨 EMERGENCY KILL SWITCH\n\nThis will immediately:\n- Close all open positions\n- Stop all trading\n\nAre you absolutely sure?"
    )

    if (!confirmed) return

    try {
      await riskApi.activateKillSwitch(true)
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
        <Card>
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

        <Card>
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

        <Card>
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

        <Card>
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
                <Button variant="outline" onClick={handlePauseTrading} className="gap-2">
                  <Pause className="h-4 w-4" />
                  Pause Trading
                </Button>
              ) : circuitBreaker.status === "paused" ? (
                <Button onClick={handleResumeTrading} className="gap-2">
                  <Play className="h-4 w-4" />
                  Resume Trading
                </Button>
              ) : null}

              <Button variant="destructive" onClick={handleKillSwitch} className="gap-2">
                <Power className="h-4 w-4" />
                Kill Switch
              </Button>
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
                <Label>Position Sizing Method</Label>
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
                <Label>Max Position Size (%)</Label>
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
                <Label>Max Position Size ($)</Label>
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
                <Label>Max Open Positions</Label>
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
                <Label>Max Daily Loss ($)</Label>
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
                <Label>Max Daily Loss (%)</Label>
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
                <Label>Max Weekly Loss (%)</Label>
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
                <Label>Max Consecutive Losses</Label>
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
                  <Label>Trailing Stop Loss</Label>
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
                  <Label>Scale Out</Label>
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
                  <Label>Pyramiding</Label>
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
    </motion.div>
  )
}
