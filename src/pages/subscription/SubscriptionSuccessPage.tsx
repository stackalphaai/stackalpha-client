import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle, Crown, ArrowRight } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { subscriptionApi } from "@/services/api"
import { refreshUser } from "@/stores/auth"

export default function SubscriptionSuccessPage() {
  const navigate = useNavigate()
  const [isVerifying, setIsVerifying] = useState(true)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const verifySubscription = async () => {
      // Poll for subscription status for up to 30 seconds
      let attempts = 0
      const maxAttempts = 10

      const checkStatus = async () => {
        try {
          const response = await subscriptionApi.getCurrentSubscription()
          if (response.data?.status === "active") {
            setIsActive(true)
            setIsVerifying(false)
            await refreshUser()
            return true
          }
        } catch {
          // Subscription not found yet, continue polling
        }
        return false
      }

      while (attempts < maxAttempts) {
        const found = await checkStatus()
        if (found) break
        attempts++
        await new Promise((resolve) => setTimeout(resolve, 3000))
      }

      setIsVerifying(false)
    }

    verifySubscription()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-primary/20">
          <CardContent className="p-8 text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto"
            >
              <CheckCircle className="h-10 w-10 text-green-500" />
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                {isVerifying ? "Verifying Payment..." : isActive ? "Payment Successful!" : "Payment Processing"}
              </h1>
              <p className="text-muted-foreground">
                {isVerifying
                  ? "Please wait while we confirm your payment..."
                  : isActive
                  ? "Your Pro membership is now active. Welcome to StackAlpha!"
                  : "Your payment is being processed. This may take a few minutes."}
              </p>
            </div>

            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-lg bg-primary/10 border border-primary/20"
              >
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Crown className="h-5 w-5" />
                  <span className="font-semibold">Pro Member</span>
                </div>
              </motion.div>
            )}

            <div className="pt-4 space-y-3">
              <Button
                variant="gradient"
                className="w-full"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {!isActive && !isVerifying && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/subscription")}
                >
                  Check Subscription Status
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
