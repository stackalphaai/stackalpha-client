import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check, Crown, Zap, Shield, Clock, X, Gift } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { subscriptionApi } from "@/services/api"
import { showSuccessToast, showErrorToast, showInfoToast } from "@/lib/api-error"
import type { Subscription } from "@/types"

const PLAN_PRICE = 50
const PLAN_FEATURES = [
  "Unlimited AI Trading Signals",
  "Automatic Trade Execution",
  "Real-time Market Analysis",
  "Advanced Analytics & Reporting",
  "Custom Risk Management",
  "Multi-wallet Support",
  "Telegram Notifications",
  "24/7 Priority Support",
]

const ACCEPTED_CURRENCIES = ["USDC", "USDT", "ETH", "BTC", "SOL", "BNB", "XRP", "LTC"]

export default function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [currencies, setCurrencies] = useState<string[]>(ACCEPTED_CURRENCIES)
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USDC")
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, currRes] = await Promise.all([
          subscriptionApi.getCurrentSubscription().catch(() => ({ data: null })),
          subscriptionApi.getCurrencies().catch(() => ({ data: { currencies: [] } })),
        ])
        setCurrentSubscription(subRes.data)

        // Filter API currencies to only include accepted ones
        const apiCurrencies = currRes.data?.currencies || []
        const filteredCurrencies = apiCurrencies.filter((c: string) =>
          ACCEPTED_CURRENCIES.includes(c.toUpperCase())
        )
        setCurrencies(filteredCurrencies.length > 0 ? filteredCurrencies : ACCEPTED_CURRENCIES)
      } catch (error) {
        console.error("Failed to fetch subscription data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubscribe = async () => {
    setIsProcessing(true)
    try {
      const response = await subscriptionApi.createSubscription("monthly", selectedCurrency)

      // Redirect to NOWPayments invoice page
      if (response.data.invoice_url) {
        showInfoToast("Redirecting to payment page...")
        // Use window.location.href for same-tab redirect to payment
        window.location.href = response.data.invoice_url
        return
      }

      showErrorToast(null, "Payment link not available. Please try again.")
      setShowPaymentDialog(false)
    } catch (error) {
      showErrorToast(error, "Failed to create subscription. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = async () => {
    if (!currentSubscription) return

    setIsProcessing(true)
    try {
      await subscriptionApi.cancelSubscription(currentSubscription.id)
      showSuccessToast("Subscription cancelled. You'll have access until the end of your billing period.")
      setShowCancelDialog(false)

      // Refresh subscription status
      const subRes = await subscriptionApi.getCurrentSubscription().catch(() => ({ data: null }))
      setCurrentSubscription(subRes.data)
    } catch (error) {
      showErrorToast(error, "Failed to cancel subscription")
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success"
      case "pending":
        return "warning"
      case "grace_period":
        return "warning"
      case "expired":
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 max-w-lg mx-auto" />
      </div>
    )
  }

  const isActive = currentSubscription?.status === "active"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">Manage your StackAlpha subscription</p>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && currentSubscription.status !== "expired" && (
        <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Crown className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Pro Membership</h3>
                    <Badge variant={getStatusColor(currentSubscription.status) as "success" | "warning" | "destructive" | "secondary"}>
                      {currentSubscription.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentSubscription.expires_at
                      ? `Expires: ${new Date(currentSubscription.expires_at).toLocaleDateString()}`
                      : "Pending payment"}
                  </p>
                </div>
              </div>
              {currentSubscription.status === "active" && (
                <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
                  Cancel Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-lg mx-auto"
      >
        <Card className="relative overflow-hidden border-primary shadow-lg shadow-primary/10">
          <div className="absolute top-4 right-4">
            <Badge variant="default" className="bg-primary">
              Full Access
            </Badge>
          </div>
          <CardHeader className="text-center pb-2">
            <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Crown className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Pro Membership</CardTitle>
            <CardDescription>
              Everything you need to trade like a pro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold">${PLAN_PRICE}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Cancel anytime. No hidden fees.
              </p>
            </div>

            <ul className="space-y-3">
              {PLAN_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {isActive ? (
              <Button variant="outline" className="w-full" disabled>
                <Check className="h-4 w-4 mr-2" />
                Current Plan
              </Button>
            ) : (
              <Button
                variant="gradient"
                className="w-full btn-glow"
                size="lg"
                onClick={() => setShowPaymentDialog(true)}
              >
                {currentSubscription ? "Renew Subscription" : "Get Started"}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Affiliate Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-lg mx-auto"
      >
        <Card className="bg-gradient-to-r from-primary/5 to-purple-600/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Earn with Referrals</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Share StackAlpha and earn commissions on every referral.
                </p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-primary font-bold text-lg">20%</span>
                    <span className="text-muted-foreground ml-1">initial</span>
                  </div>
                  <div>
                    <span className="text-primary font-bold text-lg">5%</span>
                    <span className="text-muted-foreground ml-1">renewals</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features Section */}
      <Card>
        <CardHeader>
          <CardTitle>What&apos;s Included</CardTitle>
          <CardDescription>Everything you need to trade smarter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">AI-Powered Signals</h4>
                <p className="text-sm text-muted-foreground">
                  Get real-time trading signals generated by our advanced AI algorithms
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Risk Management</h4>
                <p className="text-sm text-muted-foreground">
                  Built-in position sizing and stop-loss recommendations
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">24/7 Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Continuous market monitoring and opportunity detection
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
            <DialogDescription>
              Select your preferred payment currency
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="font-medium">Pro Membership</span>
                <span className="text-xl font-bold">${PLAN_PRICE}/month</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Currency</Label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                You&apos;ll be redirected to complete the payment
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleSubscribe}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Continue to Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-3">
                <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">You&apos;ll lose access to:</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>AI-powered trading signals</li>
                    <li>Auto-trading features</li>
                    <li>Premium analytics</li>
                    <li>Priority support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              {isProcessing ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
