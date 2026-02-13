import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, TrendingUp, TrendingDown, Activity } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TopGainers } from "@/components/features/TopGainers"
import { tradingApi } from "@/services/api"
import type { MarketData } from "@/types"

export default function MarketsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [markets, setMarkets] = useState<MarketData[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await tradingApi.getMarkets()
        setMarkets(response.data)
      } catch (error) {
        console.error("Failed to fetch markets:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMarkets()

    // Refresh every 30 seconds
    const interval = setInterval(fetchMarkets, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredMarkets = markets.filter((market) =>
    market.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`
    return num.toFixed(decimals)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Card>
          <CardContent className="p-0">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Markets</h1>
          <p className="text-muted-foreground">Live market data from Hyperliquid</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Markets</p>
              <p className="text-2xl font-bold">{markets.length}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gainers (24h)</p>
              <p className="text-2xl font-bold text-green-500">
                {markets.filter((m) => m.price_change_percent_24h > 0).length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Losers (24h)</p>
              <p className="text-2xl font-bold text-red-500">
                {markets.filter((m) => m.price_change_percent_24h < 0).length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Movers - Real-time via WebSocket */}
      <TopGainers limit={10} />

      {/* Markets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Markets</CardTitle>
          <CardDescription>Real-time prices and 24h statistics</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="md:hidden divide-y">
            {filteredMarkets.map((market) => (
              <div key={market.symbol} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {market.symbol.slice(0, 2)}
                    </div>
                    <span className="font-medium">{market.symbol}</span>
                  </div>
                  <Badge
                    variant={market.price_change_percent_24h >= 0 ? "long" : "short"}
                    className="font-medium"
                  >
                    {market.price_change_percent_24h >= 0 ? "+" : ""}
                    {market.price_change_percent_24h.toFixed(2)}%
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Mark Price</p>
                    <p className="font-medium">${market.mark_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Volume 24h</p>
                    <p className="font-medium">${formatNumber(market.volume_24h)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">24h High</p>
                    <p className="font-medium">${market.high_24h.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">24h Low</p>
                    <p className="font-medium">${market.low_24h.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop Table */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Symbol</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Mark Price</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">24h Change</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">24h High</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">24h Low</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">24h Volume</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Funding Rate</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Open Interest</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarkets.map((market, index) => (
                  <motion.tr
                    key={market.symbol}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {market.symbol.slice(0, 2)}
                        </div>
                        <span className="font-medium">{market.symbol}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      ${market.mark_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge
                        variant={market.price_change_percent_24h >= 0 ? "long" : "short"}
                        className="font-medium"
                      >
                        {market.price_change_percent_24h >= 0 ? "+" : ""}
                        {market.price_change_percent_24h.toFixed(2)}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground hidden sm:table-cell">
                      ${market.high_24h.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground hidden sm:table-cell">
                      ${market.low_24h.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground hidden md:table-cell">
                      ${formatNumber(market.volume_24h)}
                    </td>
                    <td className="py-3 px-4 text-right hidden lg:table-cell">
                      <span
                        className={
                          market.funding_rate >= 0 ? "text-green-500" : "text-red-500"
                        }
                      >
                        {(market.funding_rate * 100).toFixed(4)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground hidden lg:table-cell">
                      ${formatNumber(market.open_interest)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMarkets.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No markets found matching "{searchQuery}"
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
