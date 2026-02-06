import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  Bot,
  ChevronRight,
  Gift,
  Globe,
  LineChart,
  Lock,
  Rocket,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Zap,
  Check,
  Star,
  ArrowUpRight,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui"
import { TopGainers } from "@/components/features"
import { cn } from "@/lib/utils"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
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
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

export function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <img className="h-10 w-10" src="https://res.cloudinary.com/deioo5lrm/image/upload/v1769925235/stackalpha_qyuyms.png" alt="" />
              </div>
              <span className="text-xl font-bold gradient-text">StackAlpha</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Testimonials
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="gradient" size="sm" className="gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-full blur-3xl" />
        </div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                <Sparkles className="w-4 h-4" />
                AI-Powered Trading Intelligence
                <ChevronRight className="w-4 h-4" />
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              Trade Smarter with{" "}
              <span className="gradient-text">AI-Driven</span>
              <br />
              Trading Signals
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
            >
              Harness the power of multiple AI models analyzing Hyperliquid markets 24/7.
              Get consensus-based trading signals with automatic execution and real-time position management.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/register">
                <Button size="lg" variant="gradient" className="gap-2 text-lg px-8 py-6 btn-glow">
                  Start Trading Now <Rocket className="w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6">
                <Play className="w-5 h-5" /> Watch Demo
              </Button>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {[
                { value: "$2.4M+", label: "Trading Volume" },
                { value: "73%", label: "Win Rate" },
                { value: "5,000+", label: "Active Traders" },
                { value: "24/7", label: "AI Analysis" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Floating Dashboard Preview */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mt-20 relative"
          >
            <motion.div
              variants={floatVariants}
              animate="animate"
              className="relative mx-auto max-w-5xl"
            >
              <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-600/5" />
                <div className="bg-card/90 backdrop-blur-xl p-6">
                  {/* Mock Dashboard */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                      { label: "Portfolio Value", value: "$124,532.00", change: "+12.4%", positive: true },
                      { label: "Active Signals", value: "8", change: "+3 today", positive: true },
                      { label: "Win Rate", value: "73.2%", change: "+2.1%", positive: true },
                      { label: "Total P&L", value: "+$24,891", change: "This month", positive: true },
                    ].map((item, i) => (
                      <div key={i} className="bg-background/50 rounded-xl p-4 border border-border/50">
                        <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                        <div className="text-xl font-bold">{item.value}</div>
                        <div className={cn("text-xs", item.positive ? "text-green-500" : "text-red-500")}>
                          {item.change}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mock Chart */}
                  <div className="bg-background/50 rounded-xl p-4 border border-border/50 h-64 flex items-end gap-1">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-primary to-purple-400 rounded-t opacity-80"
                        style={{ height: `${30 + Math.random() * 60}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -left-4 lg:-left-16 top-1/4 bg-card border border-border/50 rounded-xl p-4 shadow-xl hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">BTC Long Signal</div>
                    <div className="text-xs text-green-500">+8.4% Profit</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -right-4 lg:-right-16 top-1/3 bg-card border border-border/50 rounded-xl p-4 shadow-xl hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">AI Consensus</div>
                    <div className="text-xs text-muted-foreground">3/3 Models Agree</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Live Market Data Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
              <TrendingUp className="w-4 h-4" />
              Live Market Data
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              Real-Time Market Movers from{" "}
              <span className="gradient-text">Hyperliquid</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Watch the markets move in real-time. Our AI analyzes these trends 24/7 to generate profitable signals.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <TopGainers limit={10} />
          </motion.div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 border-y border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-8">
            TRUSTED BY TRADERS WORLDWIDE
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60">
            {["Hyperliquid", "Ethereum", "DeFi Traders", "Crypto Whales", "Institutions"].map((name, i) => (
              <div key={i} className="text-xl font-semibold text-muted-foreground">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
              <Zap className="w-4 h-4" />
              Powerful Features
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Trade Like a Pro</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform combines cutting-edge technology with battle-tested trading strategies.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                title: "Multi-AI Consensus",
                description: "Multiple AI models analyze markets independently and vote on signals, ensuring higher accuracy and reduced false positives.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Zap,
                title: "Instant Execution",
                description: "Signals are automatically executed on your Hyperliquid account with precise entry, take-profit, and stop-loss orders.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: LineChart,
                title: "Real-Time Analytics",
                description: "Track your performance with detailed analytics, win rates, P&L charts, and comprehensive trade history.",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: Shield,
                title: "Risk Management",
                description: "Advanced position sizing and risk controls protect your capital. Set maximum exposure and leverage limits.",
                gradient: "from-orange-500 to-amber-500",
              },
              {
                icon: Globe,
                title: "24/7 Market Analysis",
                description: "Our AI never sleeps. Continuous market monitoring ensures you never miss profitable opportunities.",
                gradient: "from-red-500 to-rose-500",
              },
              {
                icon: Lock,
                title: "Bank-Grade Security",
                description: "Your API keys are encrypted with AES-256. We never have access to withdraw funds from your account.",
                gradient: "from-indigo-500 to-violet-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="group relative h-full bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                  <div className={cn(
                    "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4",
                    feature.gradient
                  )}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-card/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
              <Rocket className="w-4 h-4" />
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Get Started in{" "}
              <span className="gradient-text">3 Easy Steps</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start receiving AI-powered trading signals in minutes, not hours.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                description: "Sign up and complete your profile. Connect your Telegram for instant notifications.",
                icon: Users,
              },
              {
                step: "02",
                title: "Connect Wallet",
                description: "Securely link your Hyperliquid account using read-only or trading API keys.",
                icon: Wallet,
              },
              {
                step: "03",
                title: "Start Trading",
                description: "Receive AI signals and let our system execute trades automatically or manually.",
                icon: TrendingUp,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] border-t-2 border-dashed border-primary/30" />
                )}
                <div className="relative bg-card border border-border/50 rounded-2xl p-8 text-center hover:border-primary/50 transition-all duration-300">
                  <div className="text-6xl font-bold gradient-text opacity-20 absolute top-4 right-6">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
              <BarChart3 className="w-4 h-4" />
              Simple Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Choose Your{" "}
              <span className="gradient-text">Trading Plan</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you're ready. No hidden fees, cancel anytime.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto"
          >
            <div className="relative bg-card border border-primary rounded-2xl p-8 shadow-xl shadow-primary/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                  Full Access
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold mb-2">Pro Membership</h3>
                <p className="text-muted-foreground mb-6">Everything you need to trade like a pro</p>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl font-bold">$50</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">Cancel anytime. No hidden fees.</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  "Unlimited AI trading signals",
                  "Automatic trade execution",
                  "Advanced analytics & reporting",
                  "Real-time Telegram alerts",
                  "Custom risk management settings",
                  "Priority customer support",
                  "Multi-wallet support",
                  "24/7 market monitoring",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button
                  className="w-full btn-glow"
                  variant="gradient"
                  size="lg"
                >
                  Start Trading Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Join 5,000+ traders already using StackAlpha
              </p>
            </div>

            {/* Affiliate Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20 rounded-xl p-6 text-center"
            >
              <Gift className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Earn with Our Affiliate Program</h4>
              <p className="text-sm text-muted-foreground mb-1">
                <span className="text-primary font-semibold">20%</span> commission on initial referrals
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-semibold">5%</span> recurring on all renewals
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-card/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
              <Star className="w-4 h-4" />
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Loved by{" "}
              <span className="gradient-text">Traders Worldwide</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our users have to say about their experience with StackAlpha.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Alex Chen",
                role: "Full-time Trader",
                avatar: "AC",
                content: "StackAlpha's AI signals have completely transformed my trading. The consensus mechanism gives me confidence that I'm not just following random predictions.",
                rating: 5,
              },
              {
                name: "Sarah Johnson",
                role: "Crypto Enthusiast",
                avatar: "SJ",
                content: "I was skeptical at first, but the win rate speaks for itself. The auto-execution feature means I never miss a good trade even while sleeping.",
                rating: 5,
              },
              {
                name: "Michael Roberts",
                role: "Portfolio Manager",
                avatar: "MR",
                content: "The risk management tools are exceptional. I can set my parameters and trust the system to protect my capital while maximizing opportunities.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="bg-card border border-border/50 rounded-2xl p-6 h-full hover:border-primary/50 transition-all duration-300">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-medium">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-background" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Ready to{" "}
              <span className="gradient-text">Start Trading</span>
              {" "}with AI?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of traders who are already using StackAlpha to make smarter trading decisions.
              Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" variant="gradient" className="gap-2 text-lg px-8 py-6 btn-glow">
                  Create Free Account <ArrowUpRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">StackAlpha</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                AI-powered trading signals for Hyperliquid. Trade smarter, not harder.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><Link to="/register" className="hover:text-foreground transition-colors">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Risk Disclosure</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} StackAlpha. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Trading involves risk. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
