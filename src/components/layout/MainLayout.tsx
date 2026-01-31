import { Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-[280px] transition-all duration-300">
        <Header />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  )
}
