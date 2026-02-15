import { create } from "zustand"
import { useAuthStore } from "./auth"

interface SubscriptionModalState {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useSubscriptionModal = create<SubscriptionModalState>((set) => ({
  isOpen: false,
  open: () => {
    // Don't open if user is already subscribed
    const user = useAuthStore.getState().user
    if (user?.has_active_subscription || user?.is_subscribed) return
    set({ isOpen: true })
  },
  close: () => set({ isOpen: false }),
}))
