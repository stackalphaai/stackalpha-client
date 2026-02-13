import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Clock,
  XCircle,
  Crown,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { tradingApi } from "@/services/api"
import { useAuthStore } from "@/stores/auth"
import { showSuccessToast, showErrorToast } from "@/lib/api-error"
import type { Trade } from "@/types"

export default function TradesPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [trades, setTrades] = useState<Trade[]>([])
  const [openTrades, setOpenTrades] = useState<Trade[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const [tradesRes, openRes] = await Promise.all([
          tradingApi.getTrades({ status: statusFilter === "all" ? undefined : statusFilter }),
          tradingApi.getOpenTrades(),
        ])
        setTrades(tradesRes.data.items || tradesRes.data)
        setOpenTrades(openRes.data)
      } catch (error) {
        showErrorToast(error, "Failed to load trades")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrades()
  }, [statusFilter])

  const filteredTrades = trades.filter((trade) =>
    trade.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCloseTrade = async () => {
    if (!selectedTrade) return

    setIsClosing(true)
    try {
      await tradingApi.closeTrade(selectedTrade.id, "Manual close")
      showSuccessToast(`${selectedTrade.symbol} position closed successfully`)
      setShowCloseDialog(false)

      // Refresh trades
      const [tradesRes, openRes] = await Promise.all([
        tradingApi.getTrades({ status: statusFilter === "all" ? undefined : statusFilter }),
        tradingApi.getOpenTrades(),
      ])
      setTrades(tradesRes.data.items || tradesRes.data)
      setOpenTrades(openRes.data)
    } catch (error) {
      showErrorToast(error, "Failed to close trade")
    } finally {
      setIsClosing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "success"
      case "opening":
      case "closing":
        return "warning"
      case "closed":
        return "secondary"
      case "failed":
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const TradeCard = ({ trade }: { trade: Trade }) => (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => navigate(`/trades/${trade.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                trade.direction === "long"
                  ? "bg-green-500/20 text-green-500"
                  : "bg-red-500/20 text-red-500"
              }`}
            >
              {trade.direction === "long" ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="font-medium">{trade.symbol}</p>
              <Badge variant={trade.direction === "long" ? "long" : "short"} className="text-xs">
                {trade.direction.toUpperCase()}
              </Badge>
            </div>
          </div>
          <Badge variant={getStatusColor(trade.status) as "success" | "warning" | "secondary" | "destructive"}>
            {trade.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Entry</p>
            <p className="font-medium">
              ${trade.entry_price?.toLocaleString() || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Size</p>
            <p className="font-medium">${trade.position_size_usd.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Leverage</p>
            <p className="font-medium">{trade.leverage}x</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {trade.status === "closed" ? "P&L" : "Unrealized P&L"}
            </p>
            <p
              className={`font-medium ${
                (trade.status === "closed" ? trade.realized_pnl : trade.unrealized_pnl) || 0 >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {((trade.status === "closed" ? trade.realized_pnl : trade.unrealized_pnl) || 0) >= 0 ? "+" : ""}
              ${((trade.status === "closed" ? trade.realized_pnl : trade.unrealized_pnl) || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {trade.status === "open" && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedTrade(trade)
              setShowCloseDialog(true)
            }}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Close Trade
          </Button>
        )}

        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(trade.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
          </div>
          {trade.closed_at && (
            <span>Closed: {new Date(trade.closed_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Upgrade Banner */}
      {!user?.has_active_subscription && (
        <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-primary/20">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Upgrade to Pro for auto-trading</p>
                <p className="text-xs text-muted-foreground">Execute signals automatically with AI-powered trading</p>
              </div>
            </div>
            <Button variant="gradient" size="sm" onClick={() => navigate("/subscription")}>
              Upgrade
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Trades</h1>
            <Badge variant="default" className="bg-primary text-xs">
              <Crown className="h-3 w-3 mr-1" />
              PRO
            </Badge>
          </div>
          <p className="text-muted-foreground">Manage your trading positions</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Trades</TabsTrigger>
          <TabsTrigger value="open">
            Open ({openTrades.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {filteredTrades.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No trades found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTrades.map((trade, index) => (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TradeCard trade={trade} />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="open" className="mt-4">
          {openTrades.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No open trades</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {openTrades.map((trade, index) => (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TradeCard trade={trade} />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Close Trade Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Trade</DialogTitle>
            <DialogDescription>
              Are you sure you want to close this {selectedTrade?.symbol} {selectedTrade?.direction} position?
            </DialogDescription>
          </DialogHeader>
          {selectedTrade && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Position Size</p>
                  <p className="font-medium">${selectedTrade.position_size_usd.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unrealized P&L</p>
                  <p
                    className={`font-medium ${
                      (selectedTrade.unrealized_pnl || 0) >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {(selectedTrade.unrealized_pnl || 0) >= 0 ? "+" : ""}
                    ${(selectedTrade.unrealized_pnl || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCloseTrade}
              disabled={isClosing}
            >
              {isClosing ? "Closing..." : "Close Trade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
