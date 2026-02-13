import { useState } from "react"
import { Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="md:pl-[280px] transition-all duration-300">
        <Header onToggleMobileSidebar={() => setMobileOpen(true)} />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  )
}
