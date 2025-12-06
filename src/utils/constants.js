// API URLs
export const COINGECKO_API_URL = import.meta.env.VITE_COINGECKO_API_URL || 'https://api.coingecko.com/api/v3'
export const BINANCE_WS_URL = import.meta.env.VITE_BINANCE_WS_URL || 'wss://stream.binance.com:9443/ws'

// Refresh intervals (in milliseconds)
export const PRICE_REFRESH_INTERVAL = 30000 // 30 seconds
export const CHART_REFRESH_INTERVAL = 60000 // 1 minute

// Pagination
export const COINS_PER_PAGE = 50
export const DEFAULT_PAGE = 1

// Chart time ranges
export const CHART_RANGES = {
  '24H': 1,
  '7D': 7,
  '30D': 30,
  '90D': 90,
  '1Y': 365,
}

// Asset types
export const ASSET_TYPES = {
  ALL: 'all',
  CRYPTO: 'crypto',
  STOCKS: 'stocks',
  TRENDING: 'trending',
  WATCHLIST: 'watchlist',
}

// Filter tabs
export const FILTER_TABS = [
  { id: ASSET_TYPES.ALL, label: 'All Assets', icon: 'LayoutGrid' },
  { id: ASSET_TYPES.CRYPTO, label: 'Crypto', icon: 'Bitcoin' },
  { id: ASSET_TYPES.TRENDING, label: 'Trending', icon: 'TrendingUp' },
  { id: ASSET_TYPES.WATCHLIST, label: 'Watchlist', icon: 'Star' },
]

// Theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
}

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'theme-storage',
  WATCHLIST: 'watchlist-storage',
}

// Error messages
export const ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to fetch data. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  COIN_NOT_FOUND: 'Coin not found.',
  SEARCH_FAILED: 'Search failed. Please try again.',
}

// Success messages
export const SUCCESS_MESSAGES = {
  ADDED_TO_WATCHLIST: 'Added to watchlist',
  REMOVED_FROM_WATCHLIST: 'Removed from watchlist',
}
