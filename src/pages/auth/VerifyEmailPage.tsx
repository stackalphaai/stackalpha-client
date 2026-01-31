import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { authApi } from "@/services/api"

type VerificationState = "loading" | "success" | "error"

export default function VerifyEmailPage() {
  const [state, setState] = useState<VerificationState>("loading")
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setState("error")
        return
      }

      try {
        await authApi.verifyEmail(token)
        setState("success")
      } catch {
        setState("error")
      }
    }

    verifyEmail()
  }, [token])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Mobile Logo */}
      <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <span className="font-bold text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          StackAlpha
        </span>
      </div>

      <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur">
        <CardContent className="pt-6 text-center">
          {state === "loading" && (
            <>
              <div className="mb-4 flex justify-center">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Verifying your email...</h2>
              <p className="text-muted-foreground">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {state === "success" && (
            <>
              <div className="mb-4 flex justify-center">
                <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Email Verified!</h2>
              <p className="text-muted-foreground mb-6">
                Your email has been successfully verified. You can now login to your account.
              </p>
              <Link to="/login">
                <Button variant="gradient" className="w-full">
                  Continue to Login
                </Button>
              </Link>
            </>
          )}

          {state === "error" && (
            <>
              <div className="mb-4 flex justify-center">
                <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-destructive">Verification Failed</h2>
              <p className="text-muted-foreground mb-6">
                This verification link is invalid or has expired. Please try logging in to receive a new verification email.
              </p>
              <Link to="/login">
                <Button variant="gradient" className="w-full">
                  Go to Login
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
