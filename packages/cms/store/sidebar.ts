import create, { State } from 'zustand'
import { devtools } from 'zustand/middleware'

interface sidebarMethod extends State {
  sidebarState: boolean
  setSidebarState: (closeStatus: boolean) => void
  getSidebarState: () => boolean
}

export const useSidebarStore = create<sidebarMethod>(
  devtools((set, get) => ({
    sidebarState: true,
    setSidebarState: (closeStatus: boolean) =>
      set({ sidebarState: closeStatus }),

    getSidebarState: () => get().sidebarState
  }))
)
