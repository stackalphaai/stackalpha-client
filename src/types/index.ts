export interface User {
  id: string
  email: string
  full_name: string | null
  is_active: boolean
  is_verified: boolean
  is_2fa_enabled: boolean
  has_active_subscription: boolean
  last_login: string | null
  login_count: number
  wallet_count: number
  trade_count: number
  is_affiliate: boolean
  referral_code: string | null
  created_at: string
  updated_at: string
}

export interface Wallet {
  id: string
  user_id: string
  address: string
  wallet_type: "master" | "api"
  status: "pending" | "active" | "disconnected" | "suspended"
  is_trading_enabled: boolean
  is_authorized: boolean
  balance_usd: number | null
  margin_used: number | null
  unrealized_pnl: number | null
  last_sync_at: string | null
  created_at: string
  updated_at: string
}

export interface Signal {
  id: string
  symbol: string
  direction: "long" | "short"
  status: "pending" | "active" | "executed" | "expired" | "cancelled"
  outcome: "pending" | "tp_hit" | "sl_hit" | "manual_close" | "expired"
  entry_price: number
  take_profit_price: number
  stop_loss_price: number
  suggested_leverage: number
  suggested_position_size_percent: number
  confidence_score: number
  consensus_votes: number
  total_votes: number
  market_price_at_creation: number
  risk_reward_ratio: number
  actual_exit_price: number | null
  actual_pnl_percent: number | null
  expires_at: string | null
  executed_at: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
}

export interface Trade {
  id: string
  user_id: string
  wallet_id: string
  signal_id: string | null
  symbol: string
  direction: "long" | "short"
  status: "pending" | "opening" | "open" | "closing" | "closed" | "failed" | "cancelled"
  entry_price: number | null
  exit_price: number | null
  take_profit_price: number | null
  stop_loss_price: number | null
  position_size: number
  position_size_usd: number
  leverage: number
  margin_used: number | null
  realized_pnl: number | null
  realized_pnl_percent: number | null
  unrealized_pnl: number | null
  fees_paid: number | null
  close_reason: string | null
  opened_at: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: "monthly" | "yearly"
  status: "pending" | "active" | "grace_period" | "expired" | "cancelled"
  price_usd: number
  price_crypto: number | null
  crypto_currency: string | null
  starts_at: string | null
  expires_at: string | null
  grace_period_ends_at: string | null
  auto_renew: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MarketData {
  symbol: string
  mark_price: number
  index_price: number
  funding_rate: number
  open_interest: number
  volume_24h: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percent_24h: number
}

export interface Affiliate {
  id: string
  user_id: string
  referral_code: string
  commission_rate: number
  total_referrals: number
  active_referrals: number
  total_earnings: number
  pending_earnings: number
  paid_earnings: number
  payout_address: string | null
  payout_currency: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface TelegramConnection {
  is_connected: boolean
  telegram_username: string | null
  verification_code: string | null
  deep_link: string | null
  bot_username: string | null
  notifications_enabled: boolean
  signal_notifications: boolean
  trade_notifications: boolean
  system_notifications: boolean
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface TradeAnalytics {
  period: string
  total_trades: number
  winning_trades: number
  losing_trades: number
  win_rate: number
  total_pnl: number
  average_pnl: number
  best_trade: number
  worst_trade: number
  average_duration_seconds: number | null
}

export interface DailyPnL {
  date: string
  pnl: number
  trade_count: number
}

export type Theme = "light" | "dark" | "system"

// Risk Management Types
export interface RiskSettings {
  // Position Sizing
  position_sizing_method: "fixed_amount" | "fixed_percent" | "kelly" | "risk_parity"
  max_position_size_usd: number
  max_position_size_percent: number

  // Portfolio Limits
  max_portfolio_heat: number
  max_open_positions: number
  max_leverage: number

  // Drawdown Limits
  max_daily_loss_usd: number
  max_daily_loss_percent: number
  max_weekly_loss_percent: number
  max_monthly_loss_percent: number

  // Risk-Reward
  min_risk_reward_ratio: number

  // Diversification
  max_correlated_positions: number
  max_single_asset_exposure_percent: number

  // Circuit Breakers
  max_consecutive_losses: number
  trading_paused: boolean

  // Auto-Trading Features
  enable_trailing_stop: boolean
  trailing_stop_percent: number
  enable_scale_out: boolean
  enable_pyramiding: boolean
  min_signal_confidence: number
}

export interface PortfolioMetrics {
  total_equity: number
  total_margin_used: number
  total_unrealized_pnl: number
  total_realized_pnl_today: number
  open_positions_count: number
  portfolio_heat: number
  margin_utilization: number
  daily_pnl: number
  weekly_pnl: number
  monthly_pnl: number
  max_drawdown: number
  consecutive_losses: number
}

export interface CircuitBreakerStatus {
  status: "active" | "paused" | "killed"
  system_health: "healthy" | "degraded" | "critical" | "offline"
  trading_allowed: boolean
  paused_reason: string | null
  paused_at: string | null
  paused_by: string | null
  auto_resume_at: string | null
  open_positions_count: number
}
