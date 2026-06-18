import { create } from 'zustand'

type Tab = 'home' | 'log' | 'todo' | 'me'

interface UIState {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
