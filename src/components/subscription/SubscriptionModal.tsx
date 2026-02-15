import { useEffect, useState } from "react"
import { Check, Crown, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
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
import { subscriptionApi } from "@/services/api"
import { showErrorToast, showInfoToast } from "@/lib/api-error"
import { useSubscriptionModal } from "@/stores/subscription"

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

export function SubscriptionModal() {
  const { isOpen, close } = useSubscriptionModal()
  const [step, setStep] = useState<"pricing" | "payment">("pricing")
  const [currencies, setCurrencies] = useState<string[]>(ACCEPTED_CURRENCIES)
  const [selectedCurrency, setSelectedCurrency] = useState("USDC")
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch currencies when dialog opens
  useEffect(() => {
    if (!isOpen) {
      // Reset state when dialog closes
      setStep("pricing")
      setIsProcessing(false)
      return
    }

    const fetchCurrencies = async () => {
      try {
        const res = await subscriptionApi.getCurrencies()
        const apiCurrencies = res.data?.currencies || []
        const filtered = apiCurrencies.filter((c: string) =>
          ACCEPTED_CURRENCIES.includes(c.toUpperCase())
        )
        if (filtered.length > 0) setCurrencies(filtered)
      } catch {
        // Fall back to default currencies
      }
    }
    fetchCurrencies()
  }, [isOpen])

  const handleSubscribe = async () => {
    setIsProcessing(true)
    try {
      const response = await subscriptionApi.createSubscription("monthly", selectedCurrency)

      if (response.data.invoice_url) {
        showInfoToast("Redirecting to payment page...")
        window.location.href = response.data.invoice_url
        return
      }

      showErrorToast(null, "Payment link not available. Please try again.")
    } catch (error) {
      showErrorToast(error, "Failed to create subscription. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        {step === "pricing" ? (
          <>
            <DialogHeader className="text-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-2">
                <Crown className="h-7 w-7 text-primary" />
              </div>
              <DialogTitle className="text-xl">Upgrade to Pro</DialogTitle>
              <DialogDescription>
                Unlock the full power of AI-powered trading
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Price */}
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">${PLAN_PRICE}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Cancel anytime. No hidden fees.
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5">
                {PLAN_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <DialogFooter className="sm:flex-col gap-2">
              <Button
                variant="gradient"
                className="w-full btn-glow"
                size="lg"
                onClick={() => setStep("payment")}
              >
                Get Started
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Pay with crypto — USDC, USDT, ETH, BTC & more
              </p>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Complete Your Subscription
              </DialogTitle>
              <DialogDescription>
                Select your preferred payment currency
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Pro Membership</span>
                    <Badge variant="default" className="bg-primary text-xs">Monthly</Badge>
                  </div>
                  <span className="text-xl font-bold">${PLAN_PRICE}</span>
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
              <Button variant="outline" onClick={() => setStep("pricing")} disabled={isProcessing}>
                Back
              </Button>
              <Button
                variant="gradient"
                onClick={handleSubscribe}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue to Payment"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
