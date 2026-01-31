import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores/auth"
import { userApi } from "@/services/api"

export function useAuth(requireAuth = true) {
  const navigate = useNavigate()
  const { user, accessToken, isLoading, setUser, setLoading, clearAuth } = useAuthStore()

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

  return { user, isLoading, isAuthenticated: !!accessToken && !!user }
}
