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
  DialogTrigger,
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

  const handleConnect = async () => {
    if (!apiKey || !apiSecret) return

    setIsConnecting(true)
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
      setApiKey("")
      setApiSecret("")
      setLabel("")
      setIsTestnet(false)
      fetchConnections()
    } catch (error) {
      showErrorToast(error, "Failed to connect exchange")
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
        <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="h-4 w-4 mr-2" />
              Connect Exchange
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect Binance</DialogTitle>
              <DialogDescription>
                Enter your Binance Futures API key and secret to enable
                automated trading.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
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
                  placeholder="Enter your Binance API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>API Secret</Label>
                <div className="relative">
                  <Input
                    type={showSecret ? "text" : "password"}
                    placeholder="Enter your Binance API secret"
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
                    {showSecret ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
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
                <Switch
                  checked={isTestnet}
                  onCheckedChange={setIsTestnet}
                />
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">API Key Requirements</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>Enable Futures trading permission</li>
                  <li>Restrict to your IP address (recommended)</li>
                  <li>Do NOT enable withdrawal permission</li>
                </ul>
              </div>
              <Button
                variant="gradient"
                className="w-full"
                onClick={handleConnect}
                disabled={isConnecting || !apiKey || !apiSecret}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Exchange"
                )}
              </Button>
            </div>
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
              onClick={() => setShowConnectDialog(true)}
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
