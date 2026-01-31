import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Wallet,
  Plus,
  RefreshCw,
  Power,
  PowerOff,
  Trash2,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { walletApi } from "@/services/api"
import { showSuccessToast, showErrorToast, showWarningToast } from "@/lib/api-error"
import type { Wallet as WalletType } from "@/types"

export default function WalletsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [wallets, setWallets] = useState<WalletType[]>([])
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [syncingWalletId, setSyncingWalletId] = useState<string | null>(null)

  const fetchWallets = async () => {
    try {
      const response = await walletApi.getWallets()
      setWallets(response.data)
    } catch (error) {
      showErrorToast(error, "Failed to load wallets")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWallets()
  }, [])

  const handleConnectWallet = async () => {
    if (!walletAddress) {
      showWarningToast("Please enter a wallet address")
      return
    }

    setIsConnecting(true)
    try {
      await walletApi.connectWallet(walletAddress)
      showSuccessToast("Wallet connected! Please authorize it to enable trading.")
      setShowConnectDialog(false)
      setWalletAddress("")
      fetchWallets()
    } catch (error) {
      showErrorToast(error, "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleGenerateApiWallet = async () => {
    setIsGenerating(true)
    try {
      await walletApi.generateApiWallet()
      showSuccessToast("API wallet generated successfully!")
      fetchWallets()
    } catch (error) {
      showErrorToast(error, "Failed to generate API wallet")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSyncWallet = async (walletId: string) => {
    setSyncingWalletId(walletId)
    try {
      await walletApi.syncWallet(walletId)
      showSuccessToast("Wallet synced successfully!")
      fetchWallets()
    } catch (error) {
      showErrorToast(error, "Failed to sync wallet")
    } finally {
      setSyncingWalletId(null)
    }
  }

  const handleToggleTrading = async (walletId: string, enabled: boolean) => {
    try {
      await walletApi.toggleTrading(walletId, enabled)
      showSuccessToast(`Trading ${enabled ? "enabled" : "disabled"}`)
      fetchWallets()
    } catch (error) {
      showErrorToast(error, "Failed to toggle trading")
    }
  }

  const handleDisconnectWallet = async (walletId: string) => {
    if (!confirm("Are you sure you want to disconnect this wallet?")) return

    try {
      await walletApi.disconnectWallet(walletId)
      showSuccessToast("Wallet disconnected")
      fetchWallets()
    } catch (error) {
      showErrorToast(error, "Failed to disconnect wallet")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Address copied to clipboard")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success"
      case "pending":
        return "warning"
      case "disconnected":
        return "secondary"
      case "suspended":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const masterWallets = wallets.filter((w) => w.wallet_type === "master")
  const apiWallets = wallets.filter((w) => w.wallet_type === "api")

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
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

  const WalletCard = ({ wallet }: { wallet: WalletType }) => (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <Badge variant={getStatusColor(wallet.status) as "success" | "warning" | "secondary" | "destructive"}>
                {wallet.status}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {wallet.wallet_type === "master" ? "Master Wallet" : "API Wallet"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(wallet.address)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSyncWallet(wallet.id)}
              disabled={syncingWalletId === wallet.id}
            >
              {syncingWalletId === wallet.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Address</p>
            <p className="font-mono text-sm truncate">{wallet.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="font-medium">
                ${(wallet.balance_usd || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Margin Used</p>
              <p className="font-medium">
                ${(wallet.margin_used || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {wallet.unrealized_pnl !== null && (
            <div>
              <p className="text-xs text-muted-foreground">Unrealized P&L</p>
              <p
                className={`font-medium ${
                  wallet.unrealized_pnl >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {wallet.unrealized_pnl >= 0 ? "+" : ""}
                ${wallet.unrealized_pnl.toFixed(2)}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2">
              {wallet.is_authorized ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Authorized
                </Badge>
              ) : (
                <Badge variant="warning" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Not Authorized
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleToggleTrading(wallet.id, !wallet.is_trading_enabled)}
                disabled={!wallet.is_authorized}
              >
                {wallet.is_trading_enabled ? (
                  <Power className="h-4 w-4 text-green-500" />
                ) : (
                  <PowerOff className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDisconnectWallet(wallet.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {wallet.last_sync_at && (
            <p className="text-xs text-muted-foreground">
              Last synced: {new Date(wallet.last_sync_at).toLocaleString()}
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
          <h1 className="text-2xl font-bold">Wallets</h1>
          <p className="text-muted-foreground">Manage your Hyperliquid wallets</p>
        </div>
        <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect Wallet</DialogTitle>
              <DialogDescription>
                Connect your Hyperliquid wallet to start trading
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="connect">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="connect">Connect Existing</TabsTrigger>
                <TabsTrigger value="generate">Generate API</TabsTrigger>
              </TabsList>
              <TabsContent value="connect" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Wallet Address</Label>
                  <Input
                    placeholder="0x..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your Hyperliquid wallet address
                  </p>
                </div>
                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              </TabsContent>
              <TabsContent value="generate" className="space-y-4 pt-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm">
                    Generate a new API wallet that will be managed by StackAlpha.
                    This wallet will be used for automated trading.
                  </p>
                </div>
                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={handleGenerateApiWallet}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate API Wallet"}
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Wallets */}
      {wallets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No wallets connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect your Hyperliquid wallet to start trading
            </p>
            <Button variant="gradient" onClick={() => setShowConnectDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Connect Your First Wallet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {masterWallets.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Master Wallets</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {masterWallets.map((wallet) => (
                  <WalletCard key={wallet.id} wallet={wallet} />
                ))}
              </div>
            </div>
          )}

          {apiWallets.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">API Wallets</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {apiWallets.map((wallet) => (
                  <WalletCard key={wallet.id} wallet={wallet} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
