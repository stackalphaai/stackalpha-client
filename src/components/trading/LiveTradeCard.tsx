import {
  TrendingUp,
  TrendingDown,
  XCircle,
  Target,
  ShieldAlert,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { LiveTradeData } from "@/types"

interface LiveTradeCardProps {
  trade: LiveTradeData
  priceChange?: "up" | "down" | null
  onClose: (trade: LiveTradeData) => void
}

export function LiveTradeCard({ trade, priceChange, onClose }: LiveTradeCardProps) {
  const isLong = trade.direction === "long"
  const pnl = trade.unrealized_pnl
  const pnlPct = trade.unrealized_pnl_percent
  const pnlColor = pnl >= 0 ? "text-green-500" : "text-red-500"
  const pnlBg = pnl >= 0 ? "bg-green-500/10" : "bg-red-500/10"

  // Calculate TP/SL progress (how far between SL and TP the current price is)
  let progressPct = 50
  if (trade.entry_price && trade.current_price && trade.stop_loss_price && trade.take_profit_price) {
    const sl = trade.stop_loss_price
    const tp = trade.take_profit_price
    const range = Math.abs(tp - sl)
    if (range > 0) {
      if (isLong) {
        progressPct = ((trade.current_price - sl) / range) * 100
      } else {
        progressPct = ((sl - trade.current_price) / range) * 100
      }
      progressPct = Math.max(0, Math.min(100, progressPct))
    }
  }

  // Progress bar color: green if closer to TP, red if closer to SL
  const progressColor = progressPct > 50 ? "bg-green-500" : progressPct < 30 ? "bg-red-500" : "bg-yellow-500"

  // Flash animation class
  const flashClass = priceChange === "up"
    ? "ring-1 ring-green-500/50"
    : priceChange === "down"
      ? "ring-1 ring-red-500/50"
      : ""

  return (
    <Card className={`transition-all duration-300 ${flashClass}`}>
      <CardContent className="p-4">
        {/* Header: Symbol + Direction + Exchange */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                isLong ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
              }`}
            >
              {isLong ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
            <div>
              <p className="font-medium">{trade.symbol}</p>
              <div className="flex items-center gap-1">
                <Badge variant={isLong ? "long" : "short"} className="text-xs">
                  {trade.direction.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {trade.exchange === "binance" ? "Binance" : "HL"}
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 cursor-default">
                      {trade.leverage}x
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {trade.leverage}x leverage — both profit and loss are multiplied by {trade.leverage}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Live PnL */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`text-right px-2 py-1 rounded-md cursor-default ${pnlBg}`}>
                <p className={`text-sm font-bold ${pnlColor}`}>
                  {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                </p>
                <p className={`text-xs ${pnlColor}`}>
                  {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent>Unrealized P&L — estimated profit/loss if closed at current price</TooltipContent>
          </Tooltip>
        </div>

        {/* Price Grid */}
        <div className="grid grid-cols-3 gap-2 text-sm mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Entry</p>
            <p className="font-medium">${trade.entry_price?.toLocaleString() || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current</p>
            <p className={`font-medium transition-colors duration-300 ${
              priceChange === "up" ? "text-green-500" : priceChange === "down" ? "text-red-500" : ""
            }`}>
              ${trade.current_price?.toLocaleString() || "-"}
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-default">
                <p className="text-xs text-muted-foreground">Size</p>
                <p className="font-medium">${trade.position_size_usd.toLocaleString()}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>Total capital (margin) deployed in this position</TooltipContent>
          </Tooltip>
        </div>

        {/* TP/SL Progress Bar */}
        {trade.take_profit_price && trade.stop_loss_price && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <div className="flex items-center gap-1">
                <ShieldAlert className="h-3 w-3 text-red-400" />
                <span>SL: ${trade.stop_loss_price.toLocaleString()}</span>
                {trade.sl_distance_pct !== null && (
                  <span className="text-red-400">({trade.sl_distance_pct > 0 ? "" : ""}{trade.sl_distance_pct}%)</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-green-400" />
                <span>TP: ${trade.take_profit_price.toLocaleString()}</span>
                {trade.tp_distance_pct !== null && (
                  <span className="text-green-400">({trade.tp_distance_pct > 0 ? "+" : ""}{trade.tp_distance_pct}%)</span>
                )}
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden cursor-default">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Price progress between stop loss (left) and take profit (right) — {progressPct.toFixed(0)}% of the way to TP
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Close Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onClose(trade)}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Close Trade
        </Button>
      </CardContent>
    </Card>
  )
}
