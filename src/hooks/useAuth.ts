import { useCallback, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore, refreshUser } from "@/stores/auth"
import { userApi } from "@/services/api"

const REFRESH_COOLDOWN_MS = 30_000 // Don't refresh more than once per 30s

export function useAuth(requireAuth = true) {
  const navigate = useNavigate()
  const { user, accessToken, isLoading, setUser, setLoading, clearAuth } = useAuthStore()
  const lastRefresh = useRef(0)

  useEffect(() => {
    const checkAuth = async () => {
      if (!accessToken) {
        setLoading(false)
        if (requireAuth) {
          navigate("/login")
        }
        return
      }

      if (!user) {
        try {
          const response = await userApi.getProfile()
          setUser(response.data)
          lastRefresh.current = Date.now()
        } catch {
          clearAuth()
          if (requireAuth) {
            navigate("/login")
          }
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [accessToken, user, requireAuth, navigate, setUser, setLoading, clearAuth])

  // Silently refresh user data when the tab regains focus
  useEffect(() => {
    if (!accessToken) return

    const handleFocus = () => {
      if (Date.now() - lastRefresh.current < REFRESH_COOLDOWN_MS) return
      lastRefresh.current = Date.now()
      refreshUser()
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [accessToken])

  const refresh = useCallback(() => refreshUser(), [])

  return { user, isLoading, isAuthenticated: !!accessToken && !!user, refreshUser: refresh }
}
