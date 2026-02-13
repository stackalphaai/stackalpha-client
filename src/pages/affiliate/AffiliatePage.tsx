import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Users,
  DollarSign,
  TrendingUp,
  Copy,
  Gift,
  CreditCard,
  Clock,
  CheckCircle,
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { affiliateApi } from "@/services/api"
import { showSuccessToast, showErrorToast } from "@/lib/api-error"
import type { Affiliate } from "@/types"

interface Referral {
  id: string
  referred_user_email: string
  referred_user_full_name: string | null
  referred_user_has_active_subscription: boolean
  is_converted: boolean
  converted_at: string | null
  created_at: string
}

interface Commission {
  id: string
  amount: number
  commission_rate: number
  original_amount: number
  status: string
  source: string
  is_paid: boolean
  paid_at: string | null
  created_at: string
}

interface Payout {
  id: string
  amount: number
  status: string
  transaction_hash: string | null
  created_at: string
}

export default function AffiliatePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [showPayoutDialog, setShowPayoutDialog] = useState(false)
  const [payoutAddress, setPayoutAddress] = useState("")
  const [payoutCurrency, setPayoutCurrency] = useState("USDT")
  const [payoutAmount, setPayoutAmount] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [isRequestingPayout, setIsRequestingPayout] = useState(false)

  const fetchAffiliateData = async () => {
    try {
      const [affRes, refRes, commRes, payRes] = await Promise.all([
        affiliateApi.getAffiliate().catch(() => ({ data: null })),
        affiliateApi.getReferrals().catch(() => ({ data: { items: [] } })),
        affiliateApi.getCommissions().catch(() => ({ data: { items: [] } })),
        affiliateApi.getPayouts().catch(() => ({ data: { items: [] } })),
      ])
      setAffiliate(affRes.data)
      setReferrals(refRes.data.items || refRes.data)
      setCommissions(commRes.data.items || commRes.data)
      setPayouts(payRes.data.items || payRes.data)
    } catch (error) {
      showErrorToast(error, "Failed to load affiliate data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAffiliateData()
  }, [])

  const handleJoinProgram = async () => {
    setIsJoining(true)
    try {
      await affiliateApi.becomeAffiliate(payoutAddress || undefined, payoutCurrency)
      showSuccessToast("Welcome to the affiliate program! Start sharing your link to earn.")
      setShowJoinDialog(false)
      fetchAffiliateData()
    } catch (error) {
      showErrorToast(error, "Failed to join program")
    } finally {
      setIsJoining(false)
    }
  }

  const handleRequestPayout = async () => {
    setIsRequestingPayout(true)
    try {
      const amount = payoutAmount ? parseFloat(payoutAmount) : undefined
      await affiliateApi.requestPayout(amount)
      showSuccessToast("Payout request submitted! You'll receive your funds within 24-48 hours.")
      setShowPayoutDialog(false)
      setPayoutAmount("")
      fetchAffiliateData()
    } catch (error) {
      showErrorToast(error, "Failed to request payout")
    } finally {
      setIsRequestingPayout(false)
    }
  }

  const copyReferralLink = () => {
    if (!affiliate) return
    const link = `${window.location.origin}/register?ref=${affiliate.referral_code}`
    navigator.clipboard.writeText(link)
    toast.success("Referral link copied!")
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!affiliate) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold">Affiliate Program</h1>
          <p className="text-muted-foreground">Earn commissions by referring new traders</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Become an Affiliate</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Earn commissions on every subscription from users you refer to StackAlpha
            </p>

            <div className="grid gap-4 md:grid-cols-4 mb-8">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">20%</p>
                <p className="text-sm text-muted-foreground">Initial Commission</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">5%</p>
                <p className="text-sm text-muted-foreground">Renewal Commission</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">$50</p>
                <p className="text-sm text-muted-foreground">Min. Payout</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">Lifetime</p>
                <p className="text-sm text-muted-foreground">Recurring</p>
              </div>
            </div>

            <Button variant="gradient" size="lg" onClick={() => setShowJoinDialog(true)}>
              Join Affiliate Program
            </Button>
          </CardContent>
        </Card>

        {/* Join Dialog */}
        <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join Affiliate Program</DialogTitle>
              <DialogDescription>
                Set up your payout preferences (optional, can be updated later)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Payout Currency</Label>
                <Select value={payoutCurrency} onValueChange={setPayoutCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payout Address (Optional)</Label>
                <Input
                  value={payoutAddress}
                  onChange={(e) => setPayoutAddress(e.target.value)}
                  placeholder="Enter your wallet address"
                />
                <p className="text-xs text-muted-foreground">
                  You can set this later in your affiliate settings
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                Cancel
              </Button>
              <Button variant="gradient" onClick={handleJoinProgram} disabled={isJoining}>
                {isJoining ? "Joining..." : "Join Program"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    )
  }

  const stats = [
    {
      title: "Total Referrals",
      value: affiliate.total_referrals,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Active Referrals",
      value: affiliate.active_referrals,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Earnings",
      value: `$${affiliate.total_earnings.toFixed(2)}`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending Earnings",
      value: `$${affiliate.pending_earnings.toFixed(2)}`,
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Affiliate Dashboard</h1>
          <p className="text-muted-foreground">Track your referrals and earnings</p>
        </div>
        <div className="text-right">
          <Button
            variant="gradient"
            onClick={() => setShowPayoutDialog(true)}
            disabled={affiliate.pending_earnings < 50}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Request Payout
          </Button>
          {!affiliate.payout_address && (
            <p className="text-xs text-destructive mt-1">
              Set a payout address first in the payout dialog
            </p>
          )}
          {affiliate.pending_earnings < 50 && affiliate.pending_earnings > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Minimum payout: $50.00
            </p>
          )}
        </div>
      </div>

      {/* Referral Link */}
      <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-1">Your Referral Link</h3>
              <p className="text-sm text-muted-foreground">
                Earn 20% on initial subscriptions and 5% on all renewals
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                value={`${window.location.origin}/register?ref=${affiliate.referral_code}`}
                readOnly
                className="bg-background"
              />
              <Button variant="outline" onClick={copyReferralLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress to Payout */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress to minimum payout ($50)</span>
            <span className="text-sm text-muted-foreground">
              ${affiliate.pending_earnings.toFixed(2)} / $50
            </span>
          </div>
          <Progress
            value={Math.min((affiliate.pending_earnings / 50) * 100, 100)}
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="referrals">
        <TabsList>
          <TabsTrigger value="referrals">Referrals ({referrals.length})</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {referrals.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No referrals yet. Share your link to start earning!
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y">
                    {referrals.map((referral) => (
                      <div key={referral.id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{referral.referred_user_full_name || referral.referred_user_email}</p>
                            {referral.referred_user_full_name && (
                              <p className="text-sm text-muted-foreground">{referral.referred_user_email}</p>
                            )}
                          </div>
                          <Badge variant={referral.referred_user_has_active_subscription ? "success" : "secondary"}>
                            {referral.referred_user_has_active_subscription ? "Subscribed" : "Free"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(referral.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Desktop Table */}
                  <div className="overflow-x-auto hidden md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referrals.map((referral) => (
                          <tr key={referral.id} className="border-b last:border-0">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{referral.referred_user_full_name || referral.referred_user_email}</p>
                                {referral.referred_user_full_name && (
                                  <p className="text-sm text-muted-foreground">{referral.referred_user_email}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(referral.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={referral.referred_user_has_active_subscription ? "success" : "secondary"}>
                                {referral.referred_user_has_active_subscription ? "Subscribed" : "Free"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {commissions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No commissions yet
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y">
                    {commissions.map((commission) => (
                      <div key={commission.id} className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{commission.source}</span>
                          <span className="font-medium text-green-500">+${commission.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Date(commission.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                          <Badge variant={commission.status === "paid" ? "success" : "warning"} className="text-xs">
                            {commission.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Desktop Table */}
                  <div className="overflow-x-auto hidden md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Source</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commissions.map((commission) => (
                          <tr key={commission.id} className="border-b last:border-0">
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(commission.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </td>
                            <td className="py-3 px-4">{commission.source}</td>
                            <td className="py-3 px-4 text-right font-medium text-green-500">
                              +${commission.amount.toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={commission.status === "paid" ? "success" : "warning"}>
                                {commission.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {payouts.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No payouts yet
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y">
                    {payouts.map((payout) => (
                      <div key={payout.id} className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">${payout.amount.toFixed(2)}</span>
                          <Badge
                            variant={
                              payout.status === "completed"
                                ? "success"
                                : payout.status === "pending"
                                ? "warning"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {payout.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {new Date(payout.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                          {payout.transaction_hash && (
                            <code>{payout.transaction_hash.slice(0, 12)}...</code>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Desktop Table */}
                  <div className="overflow-x-auto hidden md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Transaction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payouts.map((payout) => (
                          <tr key={payout.id} className="border-b last:border-0">
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(payout.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </td>
                            <td className="py-3 px-4 text-right font-medium">
                              ${payout.amount.toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  payout.status === "completed"
                                    ? "success"
                                    : payout.status === "pending"
                                    ? "warning"
                                    : "destructive"
                                }
                              >
                                {payout.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {payout.transaction_hash ? (
                                <code className="text-xs">{payout.transaction_hash.slice(0, 16)}...</code>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payout Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
            <DialogDescription>
              Available balance: ${affiliate.pending_earnings.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount (leave empty for full balance)</Label>
              <Input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder={affiliate.pending_earnings.toFixed(2)}
                min={50}
                max={affiliate.pending_earnings}
              />
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-sm">
              <p className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Payout will be sent to: {affiliate.payout_address || "Not set"}
              </p>
              <p className="flex items-center gap-2 mt-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Currency: {affiliate.payout_currency}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleRequestPayout}
              disabled={isRequestingPayout || !affiliate.payout_address}
            >
              {isRequestingPayout ? "Requesting..." : "Request Payout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
