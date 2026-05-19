import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
  icon: LucideIcon
  delay?: number
  subtitle?: string
}

export function StatCard({ title, value, change, trend, icon: Icon, delay = 0, subtitle }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="group"
    >
      <Card className="relative overflow-hidden border-white/5 bg-black/40 backdrop-blur-3xl transition-all duration-300 hover:border-primary/30">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1 mb-1">
                {title}
              </p>
              <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
              {subtitle && (
                <p className="text-[10px] font-bold text-zinc-600 mt-1 uppercase tracking-tighter">
                  {subtitle}
                </p>
              )}
              {change && (
                <div className="flex items-center mt-2">
                  <div className={cn(
                    "flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                    trend === "up" ? "bg-green-500/10 text-green-400" : 
                    trend === "down" ? "bg-red-500/10 text-red-400" : "bg-zinc-500/10 text-zinc-400"
                  )}>
                    {change}
                  </div>
                </div>
              )}
            </div>
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <Icon className="h-7 w-7 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
