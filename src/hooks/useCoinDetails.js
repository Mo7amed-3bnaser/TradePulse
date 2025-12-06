import { useQuery } from '@tanstack/react-query'
import { fetchCoinDetails } from '../services/coinGeckoAPI'

/**
 * Custom hook to fetch detailed information about a specific coin
 * @param {string} coinId - CoinGecko coin ID
 * @returns {Object} Query result with detailed coin data
 */
const useCoinDetails = (coinId) => {
  return useQuery({
    queryKey: ['coinDetails', coinId],
    queryFn: () => fetchCoinDetails(coinId),
    enabled: !!coinId,
    staleTime: 60000, // 1 minute
    retry: 2,
    onError: (error) => {
      console.error(`Error fetching details for ${coinId}:`, error)
    },
  })
}

export default useCoinDetails
