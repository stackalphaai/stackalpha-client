import { motion } from "framer-motion"
import { Sparkles, TrendingUp, ArrowRight, BrainCircuit } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AIBriefingCardProps {
  userName?: string
  performanceSummary: string
  marketSentiment: string
  recommendation: string
  onAction?: () => void
  actionLabel?: string
}

export function AIBriefingCard({
  userName,
  performanceSummary,
  marketSentiment,
  recommendation,
  onAction,
  actionLabel = "View Recommendations"
}: AIBriefingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-black/40 to-black/60 backdrop-blur-3xl group">
        {/* Animated Background Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -z-10 group-hover:bg-primary/20 transition-colors duration-500" />
        
        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  <BrainCircuit className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    Good Morning, <span className="gradient-text">{userName || "Trader"}</span>
                  </h2>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">AI Daily Briefing</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Performance
                  </p>
                  <p className="text-sm font-bold text-zinc-300 leading-relaxed">
                    {performanceSummary}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Market Outlook
                  </p>
                  <p className="text-sm font-bold text-zinc-300 leading-relaxed">
                    {marketSentiment}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-xs font-black text-zinc-400 italic">
                  " {recommendation} "
                </p>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Button
                variant="gradient"
                size="lg"
                className="btn-glow h-16 px-8 rounded-2xl group/btn"
                onClick={onAction}
              >
                <span className="flex items-center gap-3">
                  {actionLabel}
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
      </Card>
    </motion.div>
  )
}
