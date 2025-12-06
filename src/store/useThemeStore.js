import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark'
        // Update document class
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('dark', 'light')
          document.documentElement.classList.add(newTheme)
        }
        return { theme: newTheme }
      }),
      setTheme: (theme) => set(() => {
        // Update document class
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('dark', 'light')
          document.documentElement.classList.add(theme)
        }
        return { theme }
      }),
    }),
    {
      name: 'theme-storage',
    }
  )
)

// Initialize theme on load
if (typeof document !== 'undefined') {
  const stored = localStorage.getItem('theme-storage')
  if (stored) {
    const { state } = JSON.parse(stored)
    document.documentElement.classList.add(state.theme)
  } else {
    document.documentElement.classList.add('dark')
  }
}

export default useThemeStore
