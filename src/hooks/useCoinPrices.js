import { useQuery } from "@tanstack/react-query";
import { fetchTopCoins } from "../services/coinGeckoAPI";
import { fetchRealMetalsPrices } from "../services/metalsAPI";
import { PRICE_REFRESH_INTERVAL } from "../utils/constants";

/**
 * Custom hook to fetch and cache cryptocurrency prices + precious metals
 * @param {number} limit - Number of coins to fetch
 * @returns {Object} Query result with data, loading, and error states
 */
const useCoinPrices = (limit = 50) => {
  return useQuery({
    queryKey: ["coinPrices", limit],
    queryFn: async () => {
      try {
        // Fetch both cryptocurrencies and real precious metals
        const [coins, metals] = await Promise.all([
          fetchTopCoins(limit).catch(() => []),
          fetchRealMetalsPrices().catch(() => []),
        ]);

        // Always return metals first, then coins
        const combined = [...metals, ...coins];

        // If no data at all, throw error
        if (combined.length === 0) {
          throw new Error(
            "فشل تحميل البيانات. يرجى التحقق من الاتصال بالإنترنت."
          );
        }

        return combined;
      } catch (error) {
        console.error("Error in queryFn:", error);
        throw error;
      }
    },
    refetchInterval: PRICE_REFRESH_INTERVAL,
    staleTime: 20000,
    gcTime: 300000, // Updated from cacheTime
    retry: 3, // Retry 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export default useCoinPrices;
