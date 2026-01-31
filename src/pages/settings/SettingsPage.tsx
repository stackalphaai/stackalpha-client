import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  User,
  Lock,
  Shield,
  Bell,
  Send,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Copy,
  Smartphone,
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { authApi, userApi, telegramApi } from "@/services/api"
import { useAuthStore } from "@/stores/auth"
import { showSuccessToast, showErrorToast } from "@/lib/api-error"
import type { TelegramConnection } from "@/types"

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
})

const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain number"),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const [telegram, setTelegram] = useState<TelegramConnection | null>(null)
  const [isLoadingTelegram, setIsLoadingTelegram] = useState(true)
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [totpSecret, setTotpSecret] = useState("")
  const [totpQR, setTotpQR] = useState("")
  const [totpCode, setTotpCode] = useState("")
  const [isVerifying2FA, setIsVerifying2FA] = useState(false)
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false)
  const [disable2FAPassword, setDisable2FAPassword] = useState("")
  const [disable2FACode, setDisable2FACode] = useState("")
  const [isDisabling2FA, setIsDisabling2FA] = useState(false)

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || "",
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  // Reset profile form when user data becomes available
  useEffect(() => {
    if (user) {
      resetProfile({
        full_name: user.full_name || "",
        email: user.email || "",
      })
    }
  }, [user, resetProfile])

  useEffect(() => {
    const fetchTelegram = async () => {
      try {
        const response = await telegramApi.getStatus()
        setTelegram(response.data)
      } catch (error) {
        console.error("Failed to fetch telegram status:", error)
      } finally {
        setIsLoadingTelegram(false)
      }
    }

    fetchTelegram()
  }, [])

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      const response = await userApi.updateProfile(data)
      setUser(response.data)
      showSuccessToast("Profile updated successfully")
    } catch (error) {
      showErrorToast(error, "Failed to update profile")
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await authApi.changePassword(data.current_password, data.new_password)
      showSuccessToast("Password changed successfully")
      resetPassword()
    } catch (error) {
      showErrorToast(error, "Failed to change password")
    }
  }

  const handleSetup2FA = async () => {
    try {
      const response = await authApi.setup2FA()
      setTotpSecret(response.data.secret)
      setTotpQR(response.data.qr_code)
      setShow2FADialog(true)
    } catch (error) {
      showErrorToast(error, "Failed to setup 2FA")
    }
  }

  const handleVerify2FA = async () => {
    setIsVerifying2FA(true)
    try {
      await authApi.verify2FA(totpCode)
      showSuccessToast("2FA enabled successfully! Your account is now more secure.")
      setShow2FADialog(false)
      setTotpCode("")

      // Refresh user data
      const response = await userApi.getProfile()
      setUser(response.data)
    } catch (error) {
      showErrorToast(error, "Invalid 2FA code. Please try again.")
    } finally {
      setIsVerifying2FA(false)
    }
  }

  const handleDisable2FA = async () => {
    setIsDisabling2FA(true)
    try {
      await authApi.disable2FA(disable2FACode, disable2FAPassword)
      showSuccessToast("2FA disabled successfully")
      setShowDisable2FADialog(false)
      setDisable2FAPassword("")
      setDisable2FACode("")

      // Refresh user data
      const response = await userApi.getProfile()
      setUser(response.data)
    } catch (error) {
      showErrorToast(error, "Failed to disable 2FA. Check your password and code.")
    } finally {
      setIsDisabling2FA(false)
    }
  }

  const handleConnectTelegram = async () => {
    try {
      const response = await telegramApi.connect()
      setTelegram(response.data)
      showSuccessToast("Verification code generated! Send it to our Telegram bot.")
    } catch (error) {
      showErrorToast(error, "Failed to generate verification code")
    }
  }

  const handleUpdateTelegramSettings = async (settings: Partial<TelegramConnection>) => {
    try {
      await telegramApi.updateSettings(settings)
      setTelegram((prev) => (prev ? { ...prev, ...settings } : null))
      showSuccessToast("Notification settings updated")
    } catch (error) {
      showErrorToast(error, "Failed to update settings")
    }
  }

  const handleDisconnectTelegram = async () => {
    if (!confirm("Are you sure you want to disconnect Telegram?")) return

    try {
      await telegramApi.disconnect()
      setTelegram(null)
      showSuccessToast("Telegram disconnected")
    } catch (error) {
      showErrorToast(error, "Failed to disconnect Telegram")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="telegram">
            <Send className="h-4 w-4 mr-2" />
            Telegram
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    {...registerProfile("full_name")}
                    error={!!profileErrors.full_name}
                  />
                  {profileErrors.full_name && (
                    <p className="text-sm text-destructive">{profileErrors.full_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...registerProfile("email")}
                    error={!!profileErrors.email}
                  />
                  {profileErrors.email && (
                    <p className="text-sm text-destructive">{profileErrors.email.message}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {user?.is_verified ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Email Verified
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Email Not Verified
                    </Badge>
                  )}
                </div>

                <Button type="submit" disabled={isProfileSubmitting}>
                  {isProfileSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password regularly for security</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input
                    id="current_password"
                    type={showPassword.current ? "text" : "password"}
                    {...registerPassword("current_password")}
                    icon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => ({ ...prev, current: !prev.current }))
                        }
                      >
                        {showPassword.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                    error={!!passwordErrors.current_password}
                  />
                  {passwordErrors.current_password && (
                    <p className="text-sm text-destructive">
                      {passwordErrors.current_password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    type={showPassword.new ? "text" : "password"}
                    {...registerPassword("new_password")}
                    icon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => ({ ...prev, new: !prev.new }))
                        }
                      >
                        {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    error={!!passwordErrors.new_password}
                  />
                  {passwordErrors.new_password && (
                    <p className="text-sm text-destructive">{passwordErrors.new_password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    type={showPassword.confirm ? "text" : "password"}
                    {...registerPassword("confirm_password")}
                    icon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))
                        }
                      >
                        {showPassword.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                    error={!!passwordErrors.confirm_password}
                  />
                  {passwordErrors.confirm_password && (
                    <p className="text-sm text-destructive">
                      {passwordErrors.confirm_password.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={isPasswordSubmitting}>
                  {isPasswordSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* 2FA */}
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Authenticator App</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.is_2fa_enabled ? "Enabled" : "Not enabled"}
                    </p>
                  </div>
                </div>
                {user?.is_2fa_enabled ? (
                  <Button variant="outline" onClick={() => setShowDisable2FADialog(true)}>
                    Disable
                  </Button>
                ) : (
                  <Button variant="gradient" onClick={handleSetup2FA}>
                    Enable
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Signal Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new trading signals are available
                  </p>
                </div>
                <Switch
                  checked={telegram?.signal_notifications ?? true}
                  onCheckedChange={(checked) =>
                    handleUpdateTelegramSettings({ signal_notifications: checked })
                  }
                  disabled={!telegram?.is_connected}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Trade Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified about trade executions and status changes
                  </p>
                </div>
                <Switch
                  checked={telegram?.trade_notifications ?? true}
                  onCheckedChange={(checked) =>
                    handleUpdateTelegramSettings({ trade_notifications: checked })
                  }
                  disabled={!telegram?.is_connected}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">System Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Important system updates and announcements
                  </p>
                </div>
                <Switch
                  checked={telegram?.system_notifications ?? true}
                  onCheckedChange={(checked) =>
                    handleUpdateTelegramSettings({ system_notifications: checked })
                  }
                  disabled={!telegram?.is_connected}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Telegram Tab */}
        <TabsContent value="telegram" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Telegram Integration</CardTitle>
              <CardDescription>
                Connect Telegram to receive real-time notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTelegram ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : telegram?.is_connected ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Connected</p>
                        <p className="text-sm text-muted-foreground">
                          @{telegram.telegram_username}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleDisconnectTelegram}>
                      Disconnect
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await telegramApi.sendTest()
                        toast.success("Test message sent!")
                      } catch {
                        toast.error("Failed to send test message")
                      }
                    }}
                  >
                    Send Test Message
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {telegram?.verification_code ? (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-2">
                        Send this code to our Telegram bot:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-lg font-mono bg-background px-3 py-1 rounded">
                          {telegram.verification_code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(telegram.verification_code || "")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Bot: @stackalpha_bot
                      </p>
                    </div>
                  ) : (
                    <Button variant="gradient" onClick={handleConnectTelegram}>
                      <Send className="h-4 w-4 mr-2" />
                      Connect Telegram
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {totpQR && (
              <div className="flex justify-center">
                <img src={totpQR} alt="2FA QR Code" className="h-48 w-48" />
              </div>
            )}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Or enter this code manually:</p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-sm bg-muted px-2 py-1 rounded">{totpSecret}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(totpSecret)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Enter 6-digit code</Label>
              <Input
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShow2FADialog(false)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleVerify2FA}
              disabled={totpCode.length !== 6 || isVerifying2FA}
            >
              {isVerifying2FA ? "Verifying..." : "Verify & Enable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisable2FADialog} onOpenChange={setShowDisable2FADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password and 2FA code to disable
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={disable2FAPassword}
                onChange={(e) => setDisable2FAPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>2FA Code</Label>
              <Input
                value={disable2FACode}
                onChange={(e) => setDisable2FACode(e.target.value)}
                placeholder="000000"
                maxLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisable2FADialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable2FA}
              disabled={!disable2FAPassword || disable2FACode.length !== 6 || isDisabling2FA}
            >
              {isDisabling2FA ? "Disabling..." : "Disable 2FA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
