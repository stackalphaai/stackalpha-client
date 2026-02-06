import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Flame,
  Wifi,
  WifiOff,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useTopGainers, type CoinData } from "@/hooks/useTopGainers"
import { cn } from "@/lib/utils"

function formatPrice(price: number): string {
  if (price >= 10000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 1) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  if (price >= 0.01) return price.toFixed(4)
  return price.toFixed(6)
}

function formatVolume(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
  return num.toFixed(0)
}

function CoinRow({
  coin,
  rank,
  priceFlash,
  showVolume = false,
}: {
  coin: CoinData
  rank: number
  priceFlash?: "up" | "down" | null
  showVolume?: boolean
}) {
  const isPositive = coin.day_change_pct >= 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      {/* Left: Rank + Symbol */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-medium text-muted-foreground w-5 text-right">
          {rank}
        </span>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
          {coin.symbol.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{coin.symbol}</div>
          {showVolume && (
            <div className="text-xs text-muted-foreground">
              Vol: ${formatVolume(coin.volume_24h)}
            </div>
          )}
        </div>
      </div>

      {/* Right: Price + Change */}
      <div className="flex items-center gap-4 shrink-0">
        <div
          className={cn(
            "text-sm font-medium text-right tabular-nums transition-colors duration-300",
            priceFlash === "up" && "text-green-500",
            priceFlash === "down" && "text-red-500"
          )}
        >
          ${formatPrice(coin.mid_price)}
        </div>
        <Badge
          variant={isPositive ? "long" : "short"}
          className="font-medium tabular-nums min-w-[72px] justify-center text-xs"
        >
          {isPositive ? "+" : ""}
          {coin.day_change_pct.toFixed(2)}%
        </Badge>
      </div>
    </motion.div>
  )
}

function CoinListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2.5 px-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-[72px] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface TopGainersProps {
  /** Number of items to show per tab */
  limit?: number
  /** Show as compact widget (no card wrapper) */
  compact?: boolean
  /** Custom class name */
  className?: string
}

export function TopGainers({ limit = 10, compact = false, className }: TopGainersProps) {
  const { gainers, losers, topVolume, totalCoins, isConnected, priceChanges } = useTopGainers()
  const [activeTab, setActiveTab] = useState("gainers")

  const isLoading = gainers.length === 0 && !isConnected

  const content = (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-3">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="gainers" className="gap-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5" />
              Gainers
            </TabsTrigger>
            <TabsTrigger value="losers" className="gap-1.5 text-xs">
              <TrendingDown className="h-3.5 w-3.5" />
              Losers
            </TabsTrigger>
            <TabsTrigger value="volume" className="gap-1.5 text-xs">
              <Flame className="h-3.5 w-3.5" />
              Hot
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {totalCoins > 0 && (
              <span className="text-xs text-muted-foreground">
                {totalCoins} coins
              </span>
            )}
            <div
              className={cn(
                "flex items-center gap-1 text-xs",
                isConnected ? "text-green-500" : "text-muted-foreground"
              )}
            >
              {isConnected ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">
                {isConnected ? "Live" : "Connecting..."}
              </span>
            </div>
          </div>
        </div>

        <TabsContent value="gainers" className="mt-0">
          {isLoading ? (
            <CoinListSkeleton count={limit} />
          ) : (
            <AnimatePresence mode="popLayout">
              {gainers.slice(0, limit).map((coin, i) => (
                <CoinRow
                  key={coin.symbol}
                  coin={coin}
                  rank={i + 1}
                  priceFlash={priceChanges[coin.symbol]}
                />
              ))}
            </AnimatePresence>
          )}
          {!isLoading && gainers.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No data available
            </div>
          )}
        </TabsContent>

        <TabsContent value="losers" className="mt-0">
          {isLoading ? (
            <CoinListSkeleton count={limit} />
          ) : (
            <AnimatePresence mode="popLayout">
              {losers.slice(0, limit).map((coin, i) => (
                <CoinRow
                  key={coin.symbol}
                  coin={coin}
                  rank={i + 1}
                  priceFlash={priceChanges[coin.symbol]}
                />
              ))}
            </AnimatePresence>
          )}
          {!isLoading && losers.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No data available
            </div>
          )}
        </TabsContent>

        <TabsContent value="volume" className="mt-0">
          {isLoading ? (
            <CoinListSkeleton count={limit} />
          ) : (
            <AnimatePresence mode="popLayout">
              {topVolume.slice(0, limit).map((coin, i) => (
                <CoinRow
                  key={coin.symbol}
                  coin={coin}
                  rank={i + 1}
                  priceFlash={priceChanges[coin.symbol]}
                  showVolume
                />
              ))}
            </AnimatePresence>
          )}
          {!isLoading && topVolume.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No data available
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  )

  if (compact) {
    return <div className={className}>{content}</div>
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Top Movers
          </CardTitle>
          <div className="relative flex h-2 w-2">
            {isConnected && (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </>
            )}
            {!isConnected && (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {content}
      </CardContent>
    </Card>
  )
}
