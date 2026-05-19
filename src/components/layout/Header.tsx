import { useState } from "react"
import { motion } from "framer-motion"
import { Moon, Sun, Monitor, Bell, User, LogOut, Settings, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useThemeStore, applyTheme } from "@/stores/theme"
import { useAuthStore } from "@/stores/auth"
import type { Theme } from "@/types"
import { cn } from "@/lib/utils"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

interface HeaderProps {
  onToggleMobileSidebar?: () => void
}

export function Header({ onToggleMobileSidebar }: HeaderProps) {
  const { theme, setTheme } = useThemeStore()
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  const handleLogout = () => {
    clearAuth()
    navigate("/login")
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-3xl px-6 md:px-8">
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-zinc-400 hover:text-white"
            onClick={onToggleMobileSidebar}
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-2">
              Welcome, <span className="gradient-text">{user?.full_name?.split(" ")[0] || "Trader"}</span>
              <motion.span
                animate={{ rotate: [0, 20, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block"
              >
                👋
              </motion.span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Market Intelligence Dashboard</p>
          </div>
          {(user?.has_active_subscription || user?.is_subscribed) && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] px-2 py-0 font-black tracking-widest uppercase ml-2">Pro</Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <div className="glass-dark rounded-full p-1 border-white/5 hidden sm:flex">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-full", theme === "light" && "bg-white/10 text-white")}
              onClick={() => handleThemeChange("light")}
            >
              <Sun className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-full", theme === "dark" && "bg-white/10 text-white")}
              onClick={() => handleThemeChange("dark")}
            >
              <Moon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-full", theme === "system" && "bg-white/10 text-white")}
              onClick={() => handleThemeChange("system")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            onClick={() => navigate("/notifications")}
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full" aria-label="User menu">
                <Avatar>
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {getInitials(user?.full_name || null)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.full_name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setShowLogoutDialog(true)}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

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
    </>
  )
}
