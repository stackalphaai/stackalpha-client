import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth"
import { getErrorMessage } from "@/lib/api-error"

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api"

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
      _skipErrorToast?: boolean
    }

    // Handle 401 - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = useAuthStore.getState().refreshToken
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, {
            refresh_token: refreshToken,
          })

          const { access_token, refresh_token } = response.data
          useAuthStore.getState().setTokens({
            access_token,
            refresh_token,
            token_type: "bearer",
            expires_in: 900,
          })

          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        } catch {
          useAuthStore.getState().clearAuth()
          toast.error("Session expired. Please log in again.")
          window.location.href = "/login"
        }
      } else {
        useAuthStore.getState().clearAuth()
        window.location.href = "/login"
      }
    }

    // Show global error toast for server errors (5xx) and network errors
    // Skip for 401 (handled above) and 4xx (should be handled locally)
    if (!originalRequest._skipErrorToast) {
      const status = error.response?.status

      // Only show global toast for server errors and network issues
      if (!status || status >= 500 || error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
        toast.error(getErrorMessage(error), {
          duration: 5000,
          id: `api-error-${error.code || status}`, // Prevent duplicate toasts
        })
      }
    }

    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; full_name?: string; referral_code?: string }) =>
    api.post("/v1/auth/register", data),

  login: (data: { email: string; password: string; totp_code?: string }) =>
    api.post("/v1/auth/login", data),

  refresh: (refreshToken: string) =>
    api.post("/v1/auth/refresh", { refresh_token: refreshToken }),

  verifyEmail: (token: string) =>
    api.post("/v1/auth/verify-email", { token }),

  forgotPassword: (email: string) =>
    api.post("/v1/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post("/v1/auth/reset-password", { token, new_password: newPassword }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post("/v1/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    }),

  setup2FA: () => api.post("/v1/auth/2fa/setup"),

  verify2FA: (code: string) =>
    api.post("/v1/auth/2fa/verify", { totp_code: code }),

  disable2FA: (code: string, password: string) =>
    api.post("/v1/auth/2fa/disable", { totp_code: code, password }),
}

// User API
export const userApi = {
  getProfile: () => api.get("/v1/users/me"),
  updateProfile: (data: { full_name?: string; email?: string }) =>
    api.patch("/v1/users/me", data),
  getStats: () => api.get("/v1/users/me/stats"),
}

// Wallet API
export const walletApi = {
  getWallets: () => api.get("/v1/wallets"),
  connectWallet: (address: string) =>
    api.post("/v1/wallets/connect", { address }),
  authorizeWallet: (walletId: string, signature: string, message: string) =>
    api.post(`/v1/wallets/${walletId}/authorize`, { signature, message }),
  getAuthMessage: (walletId: string) =>
    api.get(`/v1/wallets/${walletId}/auth-message`),
  generateApiWallet: () => api.post("/v1/wallets/generate-api-wallet"),
  getBalance: (walletId: string) =>
    api.get(`/v1/wallets/${walletId}/balance`),
  getPositions: (walletId: string) =>
    api.get(`/v1/wallets/${walletId}/positions`),
  syncWallet: (walletId: string) =>
    api.post(`/v1/wallets/${walletId}/sync`),
  toggleTrading: (walletId: string, enabled: boolean) =>
    api.patch(`/v1/wallets/${walletId}/trading`, { enabled }),
  disconnectWallet: (walletId: string) =>
    api.delete(`/v1/wallets/${walletId}`),
}

// Trading API
export const tradingApi = {
  getSignals: (params?: { page?: number; symbol?: string; status?: string }) =>
    api.get("/v1/trading/signals", { params }),
  getActiveSignals: () => api.get("/v1/trading/signals/active"),
  getSignal: (id: string) => api.get(`/v1/trading/signals/${id}`),
  executeSignal: (
    signalId: string,
    walletId: string,
    positionSizePercent?: number,
    leverage?: number
  ) =>
    api.post(`/v1/trading/signals/${signalId}/execute`, {
      signal_id: signalId,
      wallet_id: walletId,
      position_size_percent: positionSizePercent,
      leverage,
    }),

  getTrades: (params?: { page?: number; symbol?: string; status?: string }) =>
    api.get("/v1/trading/trades", { params }),
  getOpenTrades: () => api.get("/v1/trading/trades/open"),
  getTrade: (id: string) => api.get(`/v1/trading/trades/${id}`),
  createTrade: (data: {
    wallet_id: string
    symbol: string
    direction: "long" | "short"
    position_size_usd: number
    leverage: number
    take_profit_price?: number
    stop_loss_price?: number
  }) => api.post("/v1/trading/trades", data),
  closeTrade: (id: string, reason?: string) =>
    api.post(`/v1/trading/trades/${id}/close`, { reason }),

  getMarkets: () => api.get("/v1/trading/markets"),
  getMarket: (symbol: string) => api.get(`/v1/trading/markets/${symbol}`),
  getSignalStats: () => api.get("/v1/trading/signal-stats"),
}

// Subscription API
export const subscriptionApi = {
  getPlans: () => api.get("/v1/subscriptions/plans"),
  getSubscriptions: () => api.get("/v1/subscriptions"),
  getCurrentSubscription: () => api.get("/v1/subscriptions/current"),
  createSubscription: (plan: "monthly" | "yearly", payCurrency: string) =>
    api.post("/v1/subscriptions", { plan, pay_currency: payCurrency }),
  cancelSubscription: (id: string, reason?: string) =>
    api.post(`/v1/subscriptions/${id}/cancel`, { reason }),
  getPayments: (subscriptionId: string) =>
    api.get(`/v1/subscriptions/${subscriptionId}/payments`),
  getCurrencies: () => api.get("/v1/subscriptions/currencies"),
}

// Telegram API
export const telegramApi = {
  getStatus: () => api.get("/v1/telegram/status"),
  connect: () => api.post("/v1/telegram/connect"),
  updateSettings: (settings: {
    signal_notifications?: boolean
    trade_notifications?: boolean
    system_notifications?: boolean
  }) => api.patch("/v1/telegram/settings", settings),
  disconnect: () => api.post("/v1/telegram/disconnect"),
  sendTest: () => api.post("/v1/telegram/test"),
}

// Affiliate API
export const affiliateApi = {
  getAffiliate: () => api.get("/v1/affiliate"),
  becomeAffiliate: (payoutAddress?: string, payoutCurrency?: string) =>
    api.post("/v1/affiliate", { payout_address: payoutAddress, payout_currency: payoutCurrency }),
  getDashboard: () => api.get("/v1/affiliate/dashboard"),
  updateAffiliate: (data: { payout_address?: string; payout_currency?: string }) =>
    api.patch("/v1/affiliate", data),
  getStats: () => api.get("/v1/affiliate/stats"),
  getReferrals: (page?: number) =>
    api.get("/v1/affiliate/referrals", { params: { page } }),
  getCommissions: (page?: number) =>
    api.get("/v1/affiliate/commissions", { params: { page } }),
  getPayouts: (page?: number) =>
    api.get("/v1/affiliate/payouts", { params: { page } }),
  requestPayout: (amount?: number) =>
    api.post("/v1/affiliate/payout", { amount }),
}

// Analytics API
export const analyticsApi = {
  getTradeAnalytics: (period?: string) =>
    api.get("/v1/analytics/trades", { params: { period } }),
  getSignalAnalytics: (period?: string) =>
    api.get("/v1/analytics/signals", { params: { period } }),
  getPerformanceBySymbol: () => api.get("/v1/analytics/performance-by-symbol"),
  getDailyPnL: (days?: number) =>
    api.get("/v1/analytics/daily-pnl", { params: { days } }),
}

// Risk Management API
export const riskApi = {
  getSettings: () => api.get("/v1/risk/settings"),
  updateSettings: (data: Partial<import("@/types").RiskSettings>) =>
    api.patch("/v1/risk/settings", data),
  getPortfolioMetrics: () => api.get("/v1/risk/portfolio-metrics"),
  calculatePositionSize: (data: {
    symbol: string
    entry_price: number
    stop_loss_price: number
    signal_confidence?: number
  }) => api.post("/v1/risk/calculate-position-size", data),

  // Circuit Breaker
  getCircuitBreakerStatus: () => api.get("/v1/risk/circuit-breaker/status"),
  pauseTrading: (data: { reason: string; duration_seconds?: number }) =>
    api.post("/v1/risk/circuit-breaker/pause", data),
  resumeTrading: () => api.post("/v1/risk/circuit-breaker/resume"),
  activateKillSwitch: (closePositions: boolean = true) =>
    api.post("/v1/risk/circuit-breaker/kill-switch", null, {
      params: { close_positions: closePositions },
    }),
  deactivateKillSwitch: () => api.post("/v1/risk/circuit-breaker/deactivate-kill-switch"),
}
