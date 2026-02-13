import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { MainLayout } from "@/components/layout/MainLayout"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { Toaster } from "@/components/ui/sonner"
import { useThemeStore, applyTheme } from "@/stores/theme"
import { useAuthStore } from "@/stores/auth"

// Home page (landing)
import { HomePage } from "@/pages/HomePage"

// Auth pages
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from "@/pages/auth"

// Dashboard
import { DashboardPage } from "@/pages/dashboard"

// Trading
import { SignalsPage, TradesPage, MarketsPage } from "@/pages/trading"

// Wallet
import { WalletsPage } from "@/pages/wallet"

// Subscription
import { SubscriptionPage, SubscriptionSuccessPage, SubscriptionCancelPage } from "@/pages/subscription"

// Analytics
import { AnalyticsPage } from "@/pages/analytics"

// Affiliate
import { AffiliatePage } from "@/pages/affiliate"

// Notifications
import { NotificationsPage } from "@/pages/notifications"

// Settings
import { SettingsPage, RiskManagementPage } from "@/pages/settings"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (accessToken) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function App() {
  const { theme } = useThemeStore()
  const { setLoading } = useAuthStore()

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    // Check if we have stored tokens on mount
    const checkInitialAuth = () => {
      setLoading(false)
    }
    checkInitialAuth()
  }, [setLoading])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Home/Landing page - always accessible */}
          <Route path="/" element={<HomePage />} />

          {/* Auth routes */}
          <Route
            element={
              <PublicRoute>
                <AuthLayout />
              </PublicRoute>
            }
          >
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Route>

          {/* Private routes */}
          <Route
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/signals" element={<SignalsPage />} />
            <Route path="/trades" element={<TradesPage />} />
            <Route path="/markets" element={<MarketsPage />} />
            <Route path="/wallets" element={<WalletsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
            <Route path="/subscription/cancel" element={<SubscriptionCancelPage />} />
            <Route path="/affiliate" element={<AffiliatePage />} />
            <Route path="/risk-management" element={<RiskManagementPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-muted-foreground mb-4">Page not found</p>
                <a href="/dashboard" className="text-primary hover:underline">
                  Go to Dashboard
                </a>
              </div>
            }
          />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
