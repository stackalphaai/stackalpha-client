import { NavLink, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  CreditCard,
  Settings,
  Users,
  BarChart3,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Zap,
  History,
  Shield,
  X,
  ArrowLeftRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuthStore } from "@/stores/auth"
import { useState, useEffect } from "react"

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  children?: { label: string; href: string }[]
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  {
    icon: Zap,
    label: "Signals",
    href: "/signals",
    children: [
      { label: "All Signals", href: "/signals" },
      { label: "Binance", href: "/signals/exchange/binance" },
      { label: "Hyperliquid", href: "/signals/exchange/hyperliquid" },
    ],
  },
  { icon: History, label: "Trades", href: "/trades" },
  { icon: TrendingUp, label: "Markets", href: "/markets" },
  { icon: Wallet, label: "Wallets", href: "/wallets" },
  { icon: ArrowLeftRight, label: "Exchanges", href: "/exchanges" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Shield, label: "Risk Management", href: "/risk-management" },
]

const secondaryNavItems = [
  { icon: CreditCard, label: "Subscription", href: "/subscription" },
  { icon: Users, label: "Affiliate", href: "/affiliate" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const location = useLocation()
  const { user, clearAuth } = useAuthStore()

  // Auto-expand parent if a child route is active
  useEffect(() => {
    for (const item of mainNavItems) {
      if (item.children) {
        const isChildActive = item.children.some((child) => location.pathname === child.href)
        const isParentPath = location.pathname.startsWith(item.href + "/")
        if ((isChildActive || isParentPath) && !expandedItems.includes(item.href)) {
          setExpandedItems((prev) => [...prev, item.href])
        }
      }
    }
  }, [location.pathname])

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const handleLogout = () => {
    clearAuth()
    window.location.href = "/login"
  }

  const handleNavClick = () => {
    // Close mobile sidebar on navigation
    if (onMobileClose) onMobileClose()
  }

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    )
  }

  const renderNavItems = (items: NavItem[], isMain: boolean) =>
    items.map((item) => {
      const isActive = location.pathname === item.href
      const hasChildren = item.children && item.children.length > 0
      const isExpanded = expandedItems.includes(item.href)
      const isChildActive = hasChildren && item.children!.some((child) => location.pathname === child.href)
      const isHighlighted = isActive || isChildActive

      // Items with children: render as expandable button
      if (hasChildren && (!collapsed || mobileOpen)) {
        return (
          <div key={item.href}>
            <button
              onClick={() => toggleExpand(item.href)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 w-full",
                isHighlighted
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
              <ChevronDown
                className={cn(
                  "ml-auto h-4 w-4 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-3">
                    {item.children!.map((child) => {
                      const isChildItemActive = location.pathname === child.href
                      return (
                        <NavLink
                          key={child.href}
                          to={child.href}
                          onClick={handleNavClick}
                          className={cn(
                            "flex items-center rounded-md px-3 py-2 text-sm transition-all duration-200",
                            isChildItemActive
                              ? "text-primary font-medium bg-primary/10"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          )}
                        >
                          {child.label}
                        </NavLink>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      }

      // Regular nav item (no children, or collapsed)
      const NavItemEl = (
        <NavLink
          key={item.href}
          to={hasChildren ? item.children![0].href : item.href}
          onClick={handleNavClick}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
            isHighlighted
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed && !mobileOpen && "mx-auto")} />
          {(!collapsed || mobileOpen) && <span>{item.label}</span>}
          {isHighlighted && (!collapsed || mobileOpen) && isMain && (
            <motion.div
              layoutId="activeIndicator"
              className="ml-auto h-2 w-2 rounded-full bg-white"
            />
          )}
        </NavLink>
      )

      if (collapsed && !mobileOpen) {
        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>{NavItemEl}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        )
      }

      return NavItemEl
    })

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <AnimatePresence mode="wait">
          {(!collapsed || mobileOpen) && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <img className="h-5 w-5" src="https://res.cloudinary.com/deioo5lrm/image/upload/v1769925235/stackalpha_qyuyms.png" alt="" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                StackAlpha
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && !mobileOpen && (
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto">
            <Zap className="h-5 w-5 text-white" />
          </div>
        )}
        {/* Mobile close button */}
        {mobileOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMobileClose}
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {renderNavItems(mainNavItems, true)}
        </nav>

        <Separator className="my-4" />

        <nav className="space-y-1">
          {renderNavItems(secondaryNavItems, false)}
        </nav>
      </ScrollArea>

      {/* Footer — User info + Logout */}
      <div className="border-t p-3 space-y-2">
        {collapsed && !mobileOpen ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {getInitials(user?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium">{user?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full text-muted-foreground hover:text-destructive"
                  onClick={() => setShowLogoutDialog(true)}
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 px-2 py-1.5">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {getInitials(user?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium truncate">{user?.full_name || "User"}</p>
                  {user?.has_active_subscription && (
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">Pro</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </>
        )}
      </div>

      {/* Collapse Toggle - only on desktop */}
      {!mobileOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-md hidden md:flex"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      )}
    </>
  )

  return (
    <TooltipProvider delayDuration={0}>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        className="fixed left-0 top-0 z-40 h-screen border-r bg-card/50 backdrop-blur-xl flex-col hidden md:flex"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={onMobileClose}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-screen w-[280px] border-r bg-card flex flex-col md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}
