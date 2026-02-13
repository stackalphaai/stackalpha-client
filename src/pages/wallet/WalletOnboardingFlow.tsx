import { motion } from "framer-motion"
import {
  Wallet,
  Bot,
  Globe,
  Shield,
  Zap,
  Sparkles,
  Plus,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

const floatVariants = {
  animate: {
    y: [-6, 6, -6],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

const steps = [
  {
    num: 1,
    title: "Create Your Hyperliquid Account",
    description:
      "Head to app.hyperliquid.xyz and create your account. You'll need a funded wallet with USDC on Arbitrum to get started.",
    icon: Globe,
  },
  {
    num: 2,
    title: "Choose Your Wallet Type",
    description:
      "Connect an existing Master Wallet using your Hyperliquid address, or let StackAlpha generate a managed API Wallet for fully automated trading.",
    icon: Wallet,
  },
  {
    num: 3,
    title: "Authorize & Verify",
    description:
      "Sign a message to authorize StackAlpha to read your balances and place trades on your behalf. We can never withdraw your funds.",
    icon: Shield,
  },
  {
    num: 4,
    title: "Start Trading with AI",
    description:
      "Enable auto-trading and let our AI-powered signals execute trades in real-time. Monitor everything from your dashboard.",
    icon: Zap,
  },
]

const walletTypes = [
  {
    type: "Master Wallet",
    icon: Wallet,
    badge: "Full Custody",
    points: [
      "Your own Hyperliquid wallet",
      "You hold your private keys",
      "Connect by pasting your address",
    ],
    bestFor: "Experienced traders",
  },
  {
    type: "API Wallet",
    icon: Bot,
    badge: "Automated",
    points: [
      "Generated & managed by StackAlpha",
      "No manual key management needed",
      "Optimized for automated strategies",
    ],
    bestFor: "Hands-off trading",
  },
]

interface WalletOnboardingFlowProps {
  onConnectWallet: () => void
}

export function WalletOnboardingFlow({ onConnectWallet }: WalletOnboardingFlowProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative space-y-10">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-flex"
          >
            <Badge variant="outline" className="gap-1.5 px-3 py-1 border-primary/30 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Get Started
            </Badge>
          </motion.div>
          <h2 className="text-3xl font-bold gradient-text">Connect Your Wallet</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Link your Hyperliquid wallet to unlock AI-powered trading signals and automated
            execution on the fastest perpetuals DEX.
          </p>
        </motion.div>

        {/* Wallet Type Comparison */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Animated connector between cards (desktop only) */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 items-center">
              <div className="relative w-16 h-[2px]">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40" />
                <motion.div
                  animate={{ x: [0, 56, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/60"
                />
              </div>
            </div>

            {walletTypes.map((wt, i) => (
              <motion.div
                key={wt.type}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="glass-dark rounded-2xl p-6 relative overflow-hidden group"
              >
                {/* Card glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 via-transparent to-purple-600/5" />

                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <motion.div
                      variants={floatVariants}
                      animate="animate"
                      custom={i}
                      className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/25"
                    >
                      <wt.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <Badge variant="outline" className="border-primary/30 text-xs">
                      {wt.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">{wt.type}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Best for: {wt.bestFor}
                    </p>
                  </div>

                  <ul className="space-y-2.5">
                    {wt.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Step-by-Step Flow */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-center text-lg font-semibold text-muted-foreground mb-6">
            How it works
          </h3>

          <div className="max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.num}>
                {/* Step Node */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.01, x: 4 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-5 bg-card/60 border border-border/50 rounded-xl p-5 hover:border-primary/40 transition-all duration-300 group"
                >
                  {/* Step Number Circle */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/30">
                      {step.num}
                    </div>
                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-20" style={{ animationDuration: "3s" }} />
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold group-hover:text-primary transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Step Icon */}
                  <div className="hidden sm:flex h-10 w-10 rounded-xl bg-primary/10 items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                </motion.div>

                {/* Connector Line with Data Packet */}
                {index < steps.length - 1 && (
                  <div className="flex justify-start ml-[2.15rem] py-1">
                    <div className="relative w-0.5 h-8">
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-primary/10 rounded-full" />
                      <motion.div
                        animate={{ y: [0, 24], opacity: [0, 1, 1, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.5,
                        }}
                        className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-md shadow-primary/60"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={itemVariants} className="text-center space-y-4 pt-4">
          <Button
            variant="gradient"
            size="lg"
            className="btn-glow gap-2 px-8"
            onClick={onConnectWallet}
          >
            <Plus className="h-5 w-5" />
            Connect Your First Wallet
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground">
            No private keys required for Master Wallets. Your funds stay in your control.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
