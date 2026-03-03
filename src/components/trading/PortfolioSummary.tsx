import { Wifi, WifiOff } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { TradesSummary } from "@/types"

interface PortfolioSummaryProps {
  summary: TradesSummary
  isConnected: boolean
}

export function PortfolioSummary({ summary, isConnected }: PortfolioSummaryProps) {
  const pnl = summary.total_unrealized_pnl
  const pnlColor = pnl >= 0 ? "text-green-500" : "text-red-500"

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="flex items-center justify-between gap-4 py-3 px-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Open Positions</p>
            <p className="text-lg font-semibold">{summary.total_open}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Unrealized P&L</p>
            <p className={`text-lg font-semibold ${pnlColor}`}>
              {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Margin Used</p>
            <p className="text-lg font-semibold">${summary.total_margin_used.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <Wifi className="h-3 w-3" />
              <span>Live</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              <WifiOff className="h-3 w-3" />
              <span>Connecting...</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
