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
    <div className="min-h-screen bg-background overflow-x-hidden mesh-gradient">
      {/* Aurora Glows */}
      <div className="aurora-glow w-[600px] h-[600px] top-[-10%] left-[-10%]" />
      <div className="aurora-glow w-[500px] h-[500px] bottom-[-10%] right-[-10%] opacity-30" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-fuchsia-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                <img className="h-10 w-10" src="https://res.cloudinary.com/deioo5lrm/image/upload/v1769925235/stackalpha_qyuyms.png" alt="" />
              </div>
              <span className="text-xl font-bold gradient-text">StackAlpha</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {["Features", "How It Works", "Pricing", "Testimonials"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm font-medium text-muted-foreground hover:text-white transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="gradient" size="sm" className="gap-2 btn-glow">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-8">
              <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass-glossy text-sm font-medium text-white border-white/20">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                AI-Powered Trading Intelligence
                <ChevronRight className="w-4 h-4 opacity-50" />
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.1]"
            >
              Trade Smarter with{" "}
              <br />
              <span className="gradient-text drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]">AI-Driven</span>
              {" "}Signals
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-2xl text-zinc-400 max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              Harness the power of multiple AI models analyzing Hyperliquid markets 24/7.
              Get consensus-based trading signals with automatic execution.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
              <Link to="/register">
                <Button size="xl" variant="gradient" className="gap-3 text-xl px-12 py-8 btn-glow rounded-2xl">
                  Start Trading Now <Rocket className="w-6 h-6" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="xl" variant="outline" className="gap-3 text-xl px-12 py-8 glass-dark border-white/10 hover:bg-white/10 text-white rounded-2xl">
                  How It Works <ArrowRight className="w-6 h-6" />
                </Button>
              </a>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
            >
              {[
                { value: "3+", label: "AI Models" },
                { value: "150+", label: "Markets Tracked" },
                { value: "24/7", label: "AI Analysis" },
                { value: "<1s", label: "Signal Latency" },
              ].map((stat, index) => (
                <div key={index} className="relative group">
                  <div className="absolute inset-0 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
                  <div className="relative">
                    <div className="text-4xl sm:text-5xl font-black gradient-text mb-2">{stat.value}</div>
                    <div className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Floating Dashboard Preview */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mt-32 relative"
          >
            <motion.div
              variants={floatVariants}
              animate="animate"
              className="relative mx-auto max-w-5xl group"
            >
              <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(139,92,246,0.15)] bg-black/40 backdrop-blur-3xl p-2">
                <div className="bg-zinc-900/50 rounded-[2rem] p-8 border border-white/5">
                  {/* Mock Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                      { label: "Portfolio Value", value: "$124,532.00", change: "+12.4%", positive: true },
                      { label: "Active Signals", value: "8", change: "+3 today", positive: true },
                      { label: "Win Rate", value: "73.2%", change: "+2.1%", positive: true },
                      { label: "Total P&L", value: "+$24,891", change: "This month", positive: true },
                    ].map((item, i) => (
                      <div key={i} className="glass-dark rounded-2xl p-6 border border-white/5 group/card hover:border-primary/50 transition-colors">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{item.label}</div>
                        <div className="text-2xl font-black text-white mb-1">{item.value}</div>
                        <div className={cn("text-xs font-bold px-2 py-1 rounded-full w-fit",
                          item.positive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                          {item.change}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mock Chart */}
                  <div className="glass-dark rounded-[2rem] p-8 border border-white/5 h-80 flex items-end gap-2 relative overflow-hidden group/chart">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover/chart:opacity-100 transition-opacity" />
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-primary/40 to-fuchsia-500/60 rounded-full transition-all duration-500 hover:opacity-100 opacity-60 hover:scale-y-110"
                        style={{ height: `${20 + Math.random() * 70}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Glossy Cards */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -left-4 lg:-left-20 top-1/4 glass-glossy border-white/20 rounded-2xl p-5 shadow-2xl hidden md:block backdrop-blur-3xl animate-float"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">BTC Long Signal</div>
                    <div className="text-xs font-black text-green-400">+8.4% PROFIT</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -right-4 lg:-right-20 top-1/3 glass-glossy border-white/20 rounded-2xl p-5 shadow-2xl hidden md:block backdrop-blur-3xl animate-float [animation-delay:1.5s]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">AI Consensus</div>
                    <div className="text-xs font-black text-primary uppercase tracking-widest">3/3 Models Agree</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark border-white/10 text-sm font-bold text-primary mb-6">
              <Zap className="w-4 h-4" />
              POWERFUL FEATURES
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
              Everything You Need to{" "}
              <br />
              <span className="gradient-text">Trade Like a Pro</span>
            </h2>
          </motion.div>

          <div className="bento-grid">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-2 bento-item bg-gradient-to-br from-purple-900/40 to-black border-primary/20"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 border border-primary/30">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">Multi-AI Consensus</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  Multiple AI models analyze markets independently and vote on signals, ensuring higher accuracy and reduced false positives.
                </p>
              </div>
              <div className="mt-8 flex gap-4">
                {["GPT-4", "Claude 3", "Llama 3"].map((model) => (
                  <span key={model} className="px-4 py-2 rounded-full glass-dark border-white/10 text-xs font-bold text-white">
                    {model}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bento-item border-blue-500/20"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Instant Execution</h3>
              <p className="text-zinc-400">
                Signals are automatically executed on your Hyperliquid account with millisecond latency.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bento-item border-green-500/20"
            >
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6 border border-green-500/30">
                <LineChart className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Real-Time Analytics</h3>
              <p className="text-zinc-400">
                Track win rates, P&L, and comprehensive trade history with interactive charts.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-2 bento-item border-fuchsia-500/20 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-[80px] -z-10" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/20 flex items-center justify-center mb-6 border border-fuchsia-500/30">
                  <Shield className="w-8 h-8 text-fuchsia-400" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">Advanced Risk Management</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  Sophisticated position sizing and risk controls protect your capital. Set maximum exposure, leverage limits, and drawdown protections.
                </p>
              </div>
            </motion.div>
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
