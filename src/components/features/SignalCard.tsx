import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Target, ShieldAlert, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Signal } from "@/types"

interface SignalCardProps {
  signal: Signal
  onClick?: () => void
  onExecute?: () => void
  delay?: number
}

export function SignalCard({ signal, onClick, onExecute, delay = 0 }: SignalCardProps) {
  const isLong = signal.direction === "long"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card
        className="cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  isLong ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                }`}
              >
                {isLong ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">{signal.symbol}</CardTitle>
                <Badge variant={isLong ? "long" : "short"}>
                  {signal.direction.toUpperCase()}
                </Badge>
              </div>
            </div>
            <Badge
              variant={
                signal.status === "active"
                  ? "success"
                  : signal.status === "executed"
                  ? "info"
                  : "secondary"
              }
            >
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
              <span>{new Date(signal.created_at).toLocaleDateString()}</span>
            </div>
            <span>R:R {signal.risk_reward_ratio.toFixed(2)}</span>
          </div>

          {signal.status === "active" && onExecute && (
            <Button
              variant="gradient"
              className="w-full"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onExecute()
              }}
            >
              Execute Signal
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
