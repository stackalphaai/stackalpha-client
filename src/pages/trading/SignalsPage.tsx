import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Clock,
  Target,
  ShieldAlert,
  Crown,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/stores/auth"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { tradingApi } from "@/services/api"
import type { Signal } from "@/types"

export default function SignalsPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [signals, setSignals] = useState<Signal[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const params: { status?: string } = {}
        if (statusFilter !== "all") {
          params.status = statusFilter
        }
        const response = await tradingApi.getSignals(params)
        setSignals(response.data.items || response.data)
      } catch (error) {
        console.error("Failed to fetch signals:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSignals()
  }, [statusFilter])

  const filteredSignals = signals.filter((signal) =>
    signal.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success"
      case "executed":
        return "info"
      case "expired":
        return "warning"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "tp_hit":
        return "text-green-500"
      case "sl_hit":
        return "text-red-500"
      case "manual_close":
        return "text-yellow-500"
      default:
        return "text-muted-foreground"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
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
                <p className="font-medium text-sm">Upgrade to Pro for unlimited signals</p>
                <p className="text-xs text-muted-foreground">Get real-time AI-powered trading opportunities</p>
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
            <h1 className="text-2xl font-bold">Trading Signals</h1>
            <Badge variant="default" className="bg-primary text-xs">
              <Crown className="h-3 w-3 mr-1" />
              PRO
            </Badge>
          </div>
          <p className="text-muted-foreground">AI-generated trading opportunities</p>
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="executed">Executed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Signals Grid */}
      {filteredSignals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No signals found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSignals.map((signal, index) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/signals/${signal.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          signal.direction === "long"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {signal.direction === "long" ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{signal.symbol}</CardTitle>
                        <Badge variant={signal.direction === "long" ? "long" : "short"}>
                          {signal.direction.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(signal.status) as "success" | "info" | "warning" | "destructive" | "secondary"}>
                      {signal.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Entry Price</p>
                      <p className="font-medium">${signal.entry_price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Confidence</p>
                      <p className="font-medium text-primary">{signal.confidence_score}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-green-500">
                      <Target className="h-4 w-4" />
                      <span>${signal.take_profit_price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-500">
                      <ShieldAlert className="h-4 w-4" />
                      <span>${signal.stop_loss_price.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(signal.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <span>
                      R:R {signal.risk_reward_ratio.toFixed(2)}
                    </span>
                  </div>

                  {signal.outcome !== "pending" && (
                    <div className={`text-sm font-medium ${getOutcomeColor(signal.outcome)}`}>
                      Outcome: {signal.outcome.replace("_", " ").toUpperCase()}
                      {signal.actual_pnl_percent !== null && (
                        <span className="ml-2">
                          ({signal.actual_pnl_percent >= 0 ? "+" : ""}
                          {signal.actual_pnl_percent.toFixed(2)}%)
                        </span>
                      )}
                    </div>
                  )}

                  {signal.status === "active" && (
                    <Button
                      variant="gradient"
                      className="w-full"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/signals/${signal.id}`)
                      }}
                    >
                      Execute Signal
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
