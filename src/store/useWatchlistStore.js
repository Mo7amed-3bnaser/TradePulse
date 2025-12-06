import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useWatchlistStore = create(
  persist(
    (set, get) => ({
      watchlist: [],
      
      addToWatchlist: (coin) => set((state) => {
        // Check if already in watchlist
        if (state.watchlist.find(item => item.id === coin.id)) {
          return state
        }
        return { watchlist: [...state.watchlist, coin] }
      }),
      
      removeFromWatchlist: (coinId) => set((state) => ({
        watchlist: state.watchlist.filter(item => item.id !== coinId)
      })),
      
      isInWatchlist: (coinId) => {
        return get().watchlist.some(item => item.id === coinId)
      },
      
      clearWatchlist: () => set({ watchlist: [] }),
    }),
    {
      name: 'watchlist-storage',
    }
  )
)

export default useWatchlistStore
