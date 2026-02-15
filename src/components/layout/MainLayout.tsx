import { useState, useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { subscriptionApi } from "@/services/api"

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expiryWarning, setExpiryWarning] = useState<string | null>(null)
  const [dismissedWarning, setDismissedWarning] = useState(false)
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user?.has_active_subscription && !user?.is_subscribed) return

    const checkExpiry = async () => {
      try {
        const res = await subscriptionApi.getCurrentSubscription()
        if (res.data?.expires_at) {
          const expiresAt = new Date(res.data.expires_at)
          const now = new Date()
          const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          if (daysLeft <= 7 && daysLeft > 0) {
            setExpiryWarning(
              `Your subscription expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"} (${expiresAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`
            )
          }
        }
      } catch {
        // silently fail
      }
    }

    checkExpiry()
  }, [user?.has_active_subscription])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="md:pl-[280px] transition-all duration-300">
        <Header onToggleMobileSidebar={() => setMobileOpen(true)} />
        {expiryWarning && !dismissedWarning && (
          <div className="mx-4 md:mx-6 mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span className="text-amber-600 dark:text-amber-400">{expiryWarning}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="gradient" size="sm" onClick={() => navigate("/subscription")}>
                Renew
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDismissedWarning(true)}>
                Dismiss
              </Button>
            </div>
          </div>
        )}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  )
}
