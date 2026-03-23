import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Plus,
  RefreshCw,
  Power,
  PowerOff,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  TestTube,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  KeyRound,
  ArrowRight,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { exchangeApi } from "@/services/api"
import { showSuccessToast, showErrorToast } from "@/lib/api-error"
import type { ExchangeConnection } from "@/types"

export default function ExchangesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [connections, setConnections] = useState<ExchangeConnection[]>([])
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [apiSecret, setApiSecret] = useState("")
  const [showSecret, setShowSecret] = useState(false)
  const [isTestnet, setIsTestnet] = useState(false)
  const [label, setLabel] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [disconnectId, setDisconnectId] = useState<string | null>(null)
  const [connectStep, setConnectStep] = useState<"guide" | "keys">("guide")
  const [connectError, setConnectError] = useState("")
  const [serverIp, setServerIp] = useState("")
  const [copiedIp, setCopiedIp] = useState(false)

  const fetchConnections = async () => {
    try {
      const response = await exchangeApi.getConnections()
      setConnections(response.data.items || response.data || [])
    } catch (error) {
      showErrorToast(error, "Failed to load exchanges")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConnections()
  }, [])

  const openConnectDialog = async () => {
    setConnectStep("guide")
    setApiKey("")
    setApiSecret("")
    setLabel("")
    setConnectError("")
    setIsTestnet(false)
    setShowConnectDialog(true)
    try {
      const res = await exchangeApi.getSetupInfo()
      setServerIp(res.data.server_ip || "")
    } catch {
      setServerIp("")
    }
  }

  const copyIp = () => {
    if (!serverIp) return
    navigator.clipboard.writeText(serverIp)
    setCopiedIp(true)
    setTimeout(() => setCopiedIp(false), 2000)
  }

  const handleConnect = async () => {
    if (!apiKey || !apiSecret) return

    setIsConnecting(true)
    setConnectError("")
    try {
      await exchangeApi.connect({
        exchange_type: "binance",
        api_key: apiKey,
        api_secret: apiSecret,
        is_testnet: isTestnet,
        label: label || undefined,
      })
      showSuccessToast("Binance exchange connected successfully!")
      setShowConnectDialog(false)
      fetchConnections()
    } catch (error) {
      const { getErrorMessage } = await import("@/lib/api-error")
      const msg = getErrorMessage(error)
      setConnectError(msg)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSync = async (id: string) => {
    setSyncingId(id)
    try {
      await exchangeApi.syncBalance(id)
      showSuccessToast("Balance synced!")
      fetchConnections()
    } catch (error) {
      showErrorToast(error, "Failed to sync balance")
    } finally {
      setSyncingId(null)
    }
  }

  const handleToggleTrading = async (id: string, enabled: boolean) => {
    try {
      await exchangeApi.toggleTrading(id, enabled)
      showSuccessToast(`Auto-trading ${enabled ? "enabled" : "disabled"}`)
      fetchConnections()
    } catch (error) {
      showErrorToast(error, "Failed to toggle trading")
    }
  }

  const handleDisconnect = async (id: string) => {
    try {
      await exchangeApi.disconnect(id)
      showSuccessToast("Exchange disconnected")
      setDisconnectId(null)
      fetchConnections()
    } catch (error) {
      showErrorToast(error, "Failed to disconnect exchange")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success"
      case "inactive":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const ConnectionCard = ({ connection }: { connection: ExchangeConnection }) => (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <img
                src="https://cryptologos.cc/logos/binance-coin-bnb-logo.svg"
                alt="Binance"
                className="h-6 w-6"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">Binance Futures</p>
                {connection.is_testnet && (
                  <Badge variant="warning" className="text-[10px] px-1.5 py-0 gap-0.5">
                    <TestTube className="h-2.5 w-2.5" />
                    Testnet
                  </Badge>
                )}
              </div>
              <Badge
                variant={
                  getStatusColor(connection.status) as
                    | "success"
                    | "secondary"
                    | "destructive"
                }
              >
                {connection.status}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSync(connection.id)}
              disabled={syncingId === connection.id}
            >
              {syncingId === connection.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {connection.label && (
            <div>
              <p className="text-xs text-muted-foreground">Label</p>
              <p className="text-sm font-medium">{connection.label}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="font-medium">
                ${(connection.balance_usd || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Margin Used</p>
              <p className="font-medium">
                ${(connection.margin_used || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {connection.unrealized_pnl !== null && connection.unrealized_pnl !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground">Unrealized P&L</p>
              <p
                className={`font-medium ${
                  connection.unrealized_pnl >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {connection.unrealized_pnl >= 0 ? "+" : ""}$
                {connection.unrealized_pnl.toFixed(2)}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2">
              {connection.is_trading_enabled ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Auto-Trading On
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Auto-Trading Off
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  handleToggleTrading(
                    connection.id,
                    !connection.is_trading_enabled
                  )
                }
              >
                {connection.is_trading_enabled ? (
                  <Power className="h-4 w-4 text-green-500" />
                ) : (
                  <PowerOff className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setDisconnectId(connection.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {connection.last_sync_at && (
            <p className="text-xs text-muted-foreground">
              Last synced: {new Date(connection.last_sync_at).toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Exchanges</h1>
          <p className="text-muted-foreground">
            Connect your exchange API keys for automated trading
          </p>
        </div>
        <Button variant="gradient" onClick={openConnectDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Connect Exchange
        </Button>
        <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {connectStep === "guide" ? (
                  <>
                    <KeyRound className="h-5 w-5 text-primary" />
                    Set Up Binance API Key
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Connect Your API Key
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {connectStep === "guide"
                  ? "Follow these steps to create your Binance Futures API key"
                  : "Paste your API key and secret below"}
              </DialogDescription>
            </DialogHeader>

            {connectStep === "guide" ? (
              <div className="space-y-4 py-2 overflow-y-auto flex-1 min-h-0">
                {/* Step 1 */}
                <div className="flex gap-3 items-start">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Open Binance API Management</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Go to your Binance account settings and create a new API key.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => window.open("https://www.binance.com/en/my/settings/api-management", "_blank")}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open Binance API Settings
                    </Button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3 items-start">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Create a new API key</p>
                    <p className="text-xs text-muted-foreground">
                      Click &quot;Create API&quot;, choose &quot;System generated&quot;, and name it
                      <span className="font-medium text-foreground"> StackAlpha</span>.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3 items-start">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Set permissions</p>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                        <span>Enable <span className="font-medium text-foreground">Futures</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                        <span>Enable <span className="font-medium text-foreground">Spot & Margin Trading</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-red-500">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Do NOT enable <span className="font-medium">Withdrawals</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4 — IP Restriction */}
                <div className="flex gap-3 items-start">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">4</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Restrict IP access (recommended)</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Under &quot;Restrict access to trusted IPs only&quot;, add the StackAlpha server IP:
                    </p>
                    {serverIp ? (
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/50">
                        <code className="text-sm font-mono flex-1">{serverIp}</code>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyIp}>
                          {copiedIp ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        You can also use &quot;Unrestricted&quot; but IP restriction is safer.
                      </p>
                    )}
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-3 items-start">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">5</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Copy your API Key and Secret</p>
                    <p className="text-xs text-muted-foreground">
                      After creating, Binance will show your API key and secret.
                      Copy both — the secret is only shown once.
                    </p>
                  </div>
                </div>

                {/* Security note */}
                <div className="flex gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Your funds are safe.</span>{" "}
                    StackAlpha can only place and close trades — it cannot withdraw or transfer your funds.
                  </p>
                </div>

                <Button variant="gradient" className="w-full" onClick={() => setConnectStep("keys")}>
                  I have my API key
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4 py-2 overflow-y-auto flex-1 min-h-0">
                <div className="space-y-2">
                  <Label>Label (optional)</Label>
                  <Input
                    placeholder="e.g. Main Account"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    placeholder="Paste your Binance API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Secret</Label>
                  <div className="relative">
                    <Input
                      type={showSecret ? "text" : "password"}
                      placeholder="Paste your Binance API secret"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Testnet Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Use Binance Futures testnet for paper trading
                    </p>
                  </div>
                  <Switch checked={isTestnet} onCheckedChange={setIsTestnet} />
                </div>
                {connectError && (
                  <div className="flex gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-xs text-destructive">{connectError}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setConnectStep("guide")}>
                    Back
                  </Button>
                  <Button
                    variant="gradient"
                    className="flex-1"
                    onClick={handleConnect}
                    disabled={isConnecting || !apiKey || !apiSecret}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Connect Exchange
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Connections */}
      {connections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-1">No exchanges connected</p>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Binance API keys to start automated trading
            </p>
            <Button
              variant="gradient"
              onClick={openConnectDialog}
            >
              <Plus className="h-4 w-4 mr-2" />
              Connect Exchange
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {connections.map((connection) => (
            <ConnectionCard key={connection.id} connection={connection} />
          ))}
        </div>
      )}

      {/* Disconnect Confirmation */}
      <AlertDialog
        open={!!disconnectId}
        onOpenChange={(open) => !open && setDisconnectId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Exchange</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect this exchange? Auto-trading
              will be stopped and API credentials will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => disconnectId && handleDisconnect(disconnectId)}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
