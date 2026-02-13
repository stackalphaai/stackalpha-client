import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Bell,
  BellRing,
  Send,
  Zap,
  TrendingUp,
  Shield,
  CheckCircle,
  AlertCircle,
  Settings,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { telegramApi } from "@/services/api"
import { showSuccessToast, showErrorToast } from "@/lib/api-error"
import type { TelegramConnection } from "@/types"

const notificationTypes = [
  {
    id: "signal_notifications",
    title: "Trading Signals",
    description: "Get notified when new AI-generated trading signals are available",
    icon: Zap,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "trade_notifications",
    title: "Trade Updates",
    description: "Receive updates on trade executions, closings, and P&L changes",
    icon: TrendingUp,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: "system_notifications",
    title: "System Alerts",
    description: "Important system updates, maintenance notices, and security alerts",
    icon: Shield,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
]

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [telegram, setTelegram] = useState<TelegramConnection | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTelegram = async () => {
      try {
        const response = await telegramApi.getStatus()
        setTelegram(response.data)
      } catch {
        // Not connected
      } finally {
        setIsLoading(false)
      }
    }

    fetchTelegram()
  }, [])

  const handleToggle = async (key: string, value: boolean) => {
    try {
      await telegramApi.updateSettings({ [key]: value })
      setTelegram((prev) => (prev ? { ...prev, [key]: value } : null))
      showSuccessToast("Notification preference updated")
    } catch (error) {
      showErrorToast(error, "Failed to update preference")
    }
  }

  const isConnected = telegram?.is_connected

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Manage how you receive alerts and updates</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Connection Status */}
      {isLoading ? (
        <Card>
          <CardContent className="flex justify-center py-8">
            <Spinner />
          </CardContent>
        </Card>
      ) : isConnected ? (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">Telegram Connected</p>
                  <Badge variant="success">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Notifications are sent to @{telegram?.telegram_username}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Connect Telegram</h3>
                  <p className="text-sm text-muted-foreground">
                    Get real-time trading notifications directly in Telegram
                  </p>
                </div>
              </div>
              <Button variant="gradient" onClick={() => navigate("/settings")}>
                <Send className="h-4 w-4 mr-2" />
                Setup Telegram
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose which notifications you want to receive via Telegram
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map((type, index) => (
            <div key={type.id}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${type.bgColor} flex items-center justify-center`}>
                    <type.icon className={`h-5 w-5 ${type.color}`} />
                  </div>
                  <div>
                    <p className="font-medium">{type.title}</p>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </div>
                <Switch
                  checked={(telegram as unknown as Record<string, boolean>)?.[type.id] ?? true}
                  onCheckedChange={(checked) => handleToggle(type.id, checked)}
                  disabled={!isConnected}
                />
              </div>
            </div>
          ))}

          {!isConnected && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 mt-4">
              <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Connect Telegram to enable notification preferences
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How Notifications Work */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-1">1. Connect Telegram</h4>
              <p className="text-sm text-muted-foreground">
                Link your Telegram account in Settings
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-1">2. Choose Preferences</h4>
              <p className="text-sm text-muted-foreground">
                Select which notifications you want to receive
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <BellRing className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-1">3. Stay Informed</h4>
              <p className="text-sm text-muted-foreground">
                Get instant alerts for signals, trades, and updates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
