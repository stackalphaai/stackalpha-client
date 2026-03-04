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
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  ExternalLink,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { walletApi } from "@/services/api"
import { showSuccessToast, showErrorToast, showWarningToast } from "@/lib/api-error"
import { WalletOnboardingFlow } from "./WalletOnboardingFlow"
import type { Wallet as WalletType } from "@/types"

export default function WalletsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [wallets, setWallets] = useState<WalletType[]>([])
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [syncingWalletId, setSyncingWalletId] = useState<string | null>(null)
  const [showDisconnected, setShowDisconnected] = useState(false)
  const [walletToDisconnect, setWalletToDisconnect] = useState<string | null>(null)
  const [verifyingWalletId, setVerifyingWalletId] = useState<string | null>(null)

  // Agent wallet form
  const [agentAddress, setAgentAddress] = useState("")
  const [agentPrivateKey, setAgentPrivateKey] = useState("")
  const [agentMasterAddress, setAgentMasterAddress] = useState("")
  const [showAgentKey, setShowAgentKey] = useState(false)

  // API wallet form
  const [apiAddress, setApiAddress] = useState("")
  const [apiPrivateKey, setApiPrivateKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)

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

  const resetForms = () => {
    setAgentAddress("")
    setAgentPrivateKey("")
    setAgentMasterAddress("")
    setShowAgentKey(false)
    setApiAddress("")
    setApiPrivateKey("")
    setShowApiKey(false)
  }

  const handleConnectAgentWallet = async () => {
    if (!agentAddress || !agentPrivateKey || !agentMasterAddress) {
      showWarningToast("Please fill in all fields")
      return
    }

    setIsConnecting(true)
    try {
      await walletApi.connectAgentWallet(agentAddress, agentPrivateKey, agentMasterAddress)
      showSuccessToast("Agent wallet connected! Verify agent approval to enable trading.")
      setShowConnectDialog(false)
      resetForms()
      fetchWallets()
    } catch (error) {
      showErrorToast(error, "Failed to connect agent wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleConnectApiWallet = async () => {
    if (!apiAddress || !apiPrivateKey) {
      showWarningToast("Please fill in all fields")
      return
    }

    setIsConnecting(true)
    try {
      await walletApi.connectApiWallet(apiAddress, apiPrivateKey)
      showSuccessToast("API wallet connected! Trading is now enabled.")
      setShowConnectDialog(false)
      resetForms()
      fetchWallets()
    } catch (error) {
      showErrorToast(error, "Failed to connect API wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleVerifyAgent = async (walletId: string) => {
    setVerifyingWalletId(walletId)
    try {
      const response = await walletApi.verifyAgentApproval(walletId)
      if (response.data.is_agent_approved) {
        showSuccessToast("Agent wallet approved! Trading is now enabled.")
      } else {
        showWarningToast("Agent not yet approved. Please approve it on app.hyperliquid.xyz first.")
      }
      fetchWallets()
    } catch (error) {
      showErrorToast(error, "Failed to verify agent approval")
    } finally {
      setVerifyingWalletId(null)
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
    try {
      await walletApi.disconnectWallet(walletId)
      showSuccessToast("Wallet disconnected")
      setWalletToDisconnect(null)
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

  const activeWallets = wallets.filter((w) => w.status !== "disconnected")
  const disconnectedWallets = wallets.filter((w) => w.status === "disconnected")
  const visibleWallets = showDisconnected ? wallets : activeWallets
  const agentWallets = visibleWallets.filter((w) => w.wallet_type === "agent")
  const apiWallets = visibleWallets.filter((w) => w.wallet_type === "api")

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
                {wallet.wallet_type === "agent" ? "Agent Wallet" : "API Wallet"}
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
            <p className="text-xs text-muted-foreground">
              {wallet.wallet_type === "agent" ? "Agent Address" : "Address"}
            </p>
            <p className="font-mono text-sm truncate">{wallet.address}</p>
          </div>

          {wallet.master_address && (
            <div>
              <p className="text-xs text-muted-foreground">Master Wallet</p>
              <p className="font-mono text-sm truncate">{wallet.master_address}</p>
            </div>
          )}

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

          {/* Agent Approval for agent wallets */}
          {wallet.wallet_type === "agent" && !wallet.is_agent_approved && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-600 dark:text-yellow-400">Agent Approval Required</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Approve this agent wallet on Hyperliquid to enable trading.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1"
                  onClick={() => window.open("https://app.hyperliquid.xyz/API", "_blank")}
                >
                  <ExternalLink className="h-3 w-3" />
                  Approve on Hyperliquid
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleVerifyAgent(wallet.id)}
                  disabled={verifyingWalletId === wallet.id}
                >
                  {verifyingWalletId === wallet.id ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  Verify Approval
                </Button>
              </div>
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
              {wallet.wallet_type === "agent" && wallet.is_agent_approved && (
                <Badge variant="success" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Agent Approved
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
                onClick={() => setWalletToDisconnect(wallet.id)}
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
        <Dialog open={showConnectDialog} onOpenChange={(open) => { setShowConnectDialog(open); if (!open) resetForms() }}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Connect Wallet</DialogTitle>
              <DialogDescription>
                Connect your Hyperliquid wallet to start trading
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="agent">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="agent">Agent Wallet</TabsTrigger>
                <TabsTrigger value="api">API Wallet</TabsTrigger>
              </TabsList>
              <TabsContent value="agent" className="space-y-4 pt-4">
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <p className="text-sm font-medium">How Agent Wallets Work</p>
                  <p className="text-xs text-muted-foreground">
                    An agent wallet trades on behalf of your master wallet. Your funds stay in
                    your master wallet — the agent only has permission to place trades.
                    You must approve the agent on{" "}
                    <a href="https://app.hyperliquid.xyz/API" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      app.hyperliquid.xyz/API
                    </a>{" "}
                    before trading can begin.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Agent Wallet Address</Label>
                  <Input
                    placeholder="0x..."
                    value={agentAddress}
                    onChange={(e) => setAgentAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Agent Private Key</Label>
                  <div className="relative">
                    <Input
                      type={showAgentKey ? "text" : "password"}
                      placeholder="Enter agent wallet private key"
                      value={agentPrivateKey}
                      onChange={(e) => setAgentPrivateKey(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowAgentKey(!showAgentKey)}
                    >
                      {showAgentKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your private key is encrypted and stored securely. It is only used to sign trades.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Master Wallet Address</Label>
                  <Input
                    placeholder="0x..."
                    value={agentMasterAddress}
                    onChange={(e) => setAgentMasterAddress(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    The address of your funded Hyperliquid wallet
                  </p>
                </div>
                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={handleConnectAgentWallet}
                  disabled={isConnecting || !agentAddress || !agentPrivateKey || !agentMasterAddress}
                >
                  {isConnecting ? "Connecting..." : "Connect Agent Wallet"}
                </Button>
              </TabsContent>
              <TabsContent value="api" className="space-y-4 pt-4">
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <p className="text-sm font-medium">How API Wallets Work</p>
                  <p className="text-xs text-muted-foreground">
                    Connect your Hyperliquid wallet directly using its private key.
                    StackAlpha will trade directly on this wallet. No agent approval needed —
                    trading is enabled immediately.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Wallet Address</Label>
                  <Input
                    placeholder="0x..."
                    value={apiAddress}
                    onChange={(e) => setApiAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Private Key</Label>
                  <div className="relative">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      placeholder="Enter wallet private key"
                      value={apiPrivateKey}
                      onChange={(e) => setApiPrivateKey(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your private key is encrypted and stored securely. It is only used to sign trades.
                  </p>
                </div>
                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={handleConnectApiWallet}
                  disabled={isConnecting || !apiAddress || !apiPrivateKey}
                >
                  {isConnecting ? "Connecting..." : "Connect API Wallet"}
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Wallets */}
      {activeWallets.length === 0 ? (
        <div className="space-y-6">
          <WalletOnboardingFlow onConnectWallet={() => setShowConnectDialog(true)} />
          {disconnectedWallets.length > 0 && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setShowDisconnected(!showDisconnected)}
              >
                {showDisconnected ? "Hide" : "Show"} {disconnectedWallets.length} disconnected wallet{disconnectedWallets.length > 1 ? "s" : ""}
              </Button>
              {showDisconnected && (
                <div className="grid gap-4 md:grid-cols-2 mt-4 opacity-60">
                  {disconnectedWallets.map((wallet) => (
                    <WalletCard key={wallet.id} wallet={wallet} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {agentWallets.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Agent Wallets</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {agentWallets.map((wallet) => (
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

          {disconnectedWallets.length > 0 && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground mb-4"
                onClick={() => setShowDisconnected(!showDisconnected)}
              >
                {showDisconnected ? "Hide" : "Show"} {disconnectedWallets.length} disconnected wallet{disconnectedWallets.length > 1 ? "s" : ""}
              </Button>
              {showDisconnected && (
                <div className="grid gap-4 md:grid-cols-2 opacity-60">
                  {disconnectedWallets.map((wallet) => (
                    <WalletCard key={wallet.id} wallet={wallet} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Disconnect Wallet Confirmation */}
      <AlertDialog open={!!walletToDisconnect} onOpenChange={(open) => !open && setWalletToDisconnect(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect this wallet? You can reconnect it later, but any active trading will be stopped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => walletToDisconnect && handleDisconnectWallet(walletToDisconnect)}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
