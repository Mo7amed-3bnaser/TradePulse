import { useQuery } from '@tanstack/react-query'
import { fetchCoinChart } from '../services/coinGeckoAPI'
import { CHART_REFRESH_INTERVAL } from '../utils/constants'

/**
 * Custom hook to fetch historical chart data for a coin
 * @param {string} coinId - CoinGecko coin ID
 * @param {number} days - Number of days for historical data
 * @returns {Object} Query result with chart data
 */
const useCoinChart = (coinId, days = 7) => {
  return useQuery({
    queryKey: ['coinChart', coinId, days],
    queryFn: () => fetchCoinChart(coinId, days),
    enabled: !!coinId, // Only fetch if coinId is provided
    refetchInterval: CHART_REFRESH_INTERVAL,
    staleTime: 50000,
    retry: 2,
    onError: (error) => {
      console.error(`Error fetching chart for ${coinId}:`, error)
    },
  })
}

export default useCoinChart
