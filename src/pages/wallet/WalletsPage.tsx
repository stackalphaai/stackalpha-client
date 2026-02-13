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
  Download,
  AlertTriangle,
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

interface GeneratedWallet {
  address: string
  private_key: string
}

export default function WalletsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [wallets, setWallets] = useState<WalletType[]>([])
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [syncingWalletId, setSyncingWalletId] = useState<string | null>(null)
  const [generatedWallet, setGeneratedWallet] = useState<GeneratedWallet | null>(null)
  const [showKeyRevealed, setShowKeyRevealed] = useState(false)
  const [keySavedConfirmed, setKeySavedConfirmed] = useState(false)
  const [showDisconnected, setShowDisconnected] = useState(false)
  const [walletToDisconnect, setWalletToDisconnect] = useState<string | null>(null)
  const [showCloseKeyWarning, setShowCloseKeyWarning] = useState(false)

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
      const response = await walletApi.generateApiWallet()
      setGeneratedWallet(response.data)
      setShowConnectDialog(false)
      setShowKeyRevealed(false)
      setKeySavedConfirmed(false)
      fetchWallets()
    } catch (error) {
      showErrorToast(error, "Failed to generate API wallet")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadKey = () => {
    if (!generatedWallet) return
    const content = [
      "============================================================",
      "  StackAlpha API Wallet - KEEP THIS FILE SECURE",
      "============================================================",
      "",
      `Wallet Address: ${generatedWallet.address}`,
      `Private Key:    ${generatedWallet.private_key}`,
      "",
      "",
      "------------------------------------------------------------",
      "  IMPORTANT SECURITY NOTES",
      "------------------------------------------------------------",
      "",
      "- This private key gives FULL access to this wallet.",
      "- Never share this key with anyone.",
      "- Store this file in a secure location (password manager,",
      "  encrypted drive, or written down offline).",
      "- Delete this file after saving the key somewhere secure.",
      "- StackAlpha CANNOT withdraw or transfer your funds.",
      "  The key is only used to place and close trades on",
      "  Hyperliquid on your behalf.",
      "",
      "",
      "------------------------------------------------------------",
      "  HOW TO FUND YOUR WALLET",
      "------------------------------------------------------------",
      "",
      "1. Copy your Wallet Address above.",
      "2. From any exchange or wallet, send USDC on the Arbitrum",
      "   network to your wallet address.",
      "3. Once funded, StackAlpha will automatically execute",
      "   AI-powered trades for you.",
      "",
      "",
      "------------------------------------------------------------",
      "  HOW TO IMPORT YOUR WALLET INTO A WALLET APP",
      "  (for backup & direct access to your funds)",
      "------------------------------------------------------------",
      "",
      "You can import this private key into any Ethereum-compatible",
      "wallet app to directly access and manage your funds.",
      "",
      "",
      "MetaMask (Browser Extension / Mobile App):",
      "",
      "  1. Open MetaMask and click your account icon (top-right).",
      "  2. Select 'Add account or hardware wallet'.",
      "  3. Choose 'Import account'.",
      "  4. Select 'Private Key' as the type.",
      "  5. Paste your Private Key from above and click 'Import'.",
      "  6. Switch the network to 'Arbitrum One' to see your USDC.",
      "",
      "",
      "Trust Wallet (Mobile App):",
      "",
      "  1. Open Trust Wallet and tap the Settings icon.",
      "  2. Go to 'Wallets' and tap the '+' button.",
      "  3. Select 'I already have a wallet'.",
      "  4. Choose 'Ethereum' (or Multi-Coin).",
      "  5. Select 'Private Key' tab and paste your key.",
      "  6. Tap 'Import' and switch to the Arbitrum network",
      "     to view your assets.",
      "",
      "",
      "Phantom (Browser Extension / Mobile App):",
      "",
      "  1. Open Phantom and click the menu (top-left hamburger).",
      "  2. Go to 'Settings' > 'Manage Accounts'.",
      "  3. Tap 'Add / Connect Wallet'.",
      "  4. Select 'Import Private Key'.",
      "  5. Choose 'Ethereum' as the network.",
      "  6. Paste your Private Key and tap 'Import'.",
      "",
      "",
      "Rabby Wallet (Browser Extension):",
      "",
      "  1. Open Rabby and click 'Add Address'.",
      "  2. Select 'Import Private Key'.",
      "  3. Paste your key and click 'Confirm'.",
      "  4. Your Arbitrum assets will appear automatically.",
      "",
      "",
      "============================================================",
      `  Generated: ${new Date().toISOString()}`,
      "  By: StackAlpha (stackalpha.xyz)",
      "============================================================",
    ].join("\n")

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `stackalpha-wallet-${generatedWallet.address.slice(0, 8)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Wallet key file downloaded")
  }

  const handleCloseSecretDialog = () => {
    if (!keySavedConfirmed) {
      setShowCloseKeyWarning(true)
      return
    }
    setGeneratedWallet(null)
    setShowKeyRevealed(false)
    setKeySavedConfirmed(false)
  }

  const handleForceCloseSecretDialog = () => {
    setShowCloseKeyWarning(false)
    setGeneratedWallet(null)
    setShowKeyRevealed(false)
    setKeySavedConfirmed(false)
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
  const masterWallets = visibleWallets.filter((w) => w.wallet_type === "master")
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

      {/* Generated Wallet Secret Key Dialog */}
      <Dialog open={!!generatedWallet} onOpenChange={(open) => { if (!open) handleCloseSecretDialog() }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <DialogTitle>Wallet Generated Successfully</DialogTitle>
                <DialogDescription>
                  Save your private key now — it will not be shown again
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5">
            {/* Critical Warning */}
            <div className="flex gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-destructive">This is the only time your private key will be displayed.</p>
                <p className="text-muted-foreground mt-1">
                  If you lose it, you will lose access to any funds in this wallet.
                  StackAlpha cannot recover it for you.
                </p>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Wallet Address</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2.5 rounded-lg bg-muted font-mono text-sm break-all">
                  {generatedWallet?.address}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => {
                    if (generatedWallet) {
                      navigator.clipboard.writeText(generatedWallet.address)
                      toast.success("Address copied")
                    }
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Private Key */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Private Key (Secret)</Label>
              <div className="relative">
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2.5 rounded-lg bg-muted font-mono text-sm break-all select-all">
                    {showKeyRevealed
                      ? generatedWallet?.private_key
                      : "\u2022".repeat(48)}
                  </code>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowKeyRevealed(!showKeyRevealed)}
                    >
                      {showKeyRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (generatedWallet) {
                          navigator.clipboard.writeText(generatedWallet.private_key)
                          toast.success("Private key copied to clipboard")
                        }
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleDownloadKey}
            >
              <Download className="h-4 w-4" />
              Download Key File
            </Button>

            {/* Security Info */}
            <div className="space-y-3 p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Security & Custody Information</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Your funds, your control.</strong> StackAlpha cannot withdraw or transfer your funds. The private key is only used to place and close trades on Hyperliquid.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Backup &amp; recovery.</strong> You can import this private key into MetaMask or any Ethereum-compatible wallet at any time to access your funds directly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Fund your wallet.</strong> Send USDC on the Arbitrum network to the wallet address above to start trading.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 mt-0.5 shrink-0" />
                  <span><strong>Never share your private key</strong> with anyone. Anyone who has it can access your wallet funds.</span>
                </li>
              </ul>
            </div>

            {/* Next Steps */}
            <div className="space-y-2 p-4 rounded-lg border border-primary/20 bg-primary/5">
              <span className="text-sm font-semibold">Next Steps</span>
              <ol className="space-y-1.5 text-sm text-muted-foreground list-decimal list-inside">
                <li>Save your private key in a secure location (password manager recommended)</li>
                <li>Send USDC on Arbitrum to your new wallet address</li>
                <li>Once funded, StackAlpha will automatically execute AI-powered trades for you</li>
              </ol>
            </div>

            {/* Confirmation + Close */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keySavedConfirmed}
                  onChange={(e) => setKeySavedConfirmed(e.target.checked)}
                  className="rounded border-muted-foreground/30"
                />
                <span className="text-sm">I have saved my private key in a secure location</span>
              </label>
              <Button
                variant="gradient"
                className="w-full"
                disabled={!keySavedConfirmed}
                onClick={handleCloseSecretDialog}
              >
                I've Saved My Key — Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Close Secret Key Warning */}
      <AlertDialog open={showCloseKeyWarning} onOpenChange={setShowCloseKeyWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You will NOT be able to see this private key again. Make sure you have saved it securely before closing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleForceCloseSecretDialog}
            >
              Close Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
