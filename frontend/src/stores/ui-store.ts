import { create } from 'zustand'

interface UiState {
  sidebarOpen: boolean
  assistantOpen: boolean
  toolsOpen: boolean
  searchOpen: boolean
  infra: { key: string; resource?: string } | null
  setSidebarOpen: (open: boolean) => void
  toggleAssistant: () => void
  setAssistantOpen: (open: boolean) => void
  toggleTools: () => void
  setSearchOpen: (open: boolean) => void
  openInfra: (key: string, resource?: string) => void
  closeInfra: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  assistantOpen: false,
  toolsOpen: false,
  searchOpen: false,
  infra: null,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleAssistant: () => set((s) => ({ assistantOpen: !s.assistantOpen })),
  setAssistantOpen: (assistantOpen) => set({ assistantOpen }),
  toggleTools: () => set((s) => ({ toolsOpen: !s.toolsOpen })),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  openInfra: (key, resource) => set({ infra: { key, resource } }),
  closeInfra: () => set({ infra: null }),
}))
