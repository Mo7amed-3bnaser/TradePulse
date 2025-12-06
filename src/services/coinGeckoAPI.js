import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_COINGECKO_API_URL || "https://api.coingecko.com/api/v3";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

/**
 * Fetch top cryptocurrencies by market cap
 * @param {number} limit - Number of coins to fetch (default: 100)
 * @returns {Promise<Array>} Array of coin data in EGP
 */
export const fetchTopCoins = async (limit = 100) => {
  try {
    // Fetch in USD first
    const response = await api.get("/coins/markets", {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: limit,
        page: 1,
        sparkline: true,
        price_change_percentage: "24h",
      },
    });

    // Get USD to EGP exchange rate
    let usdToEgp = 50; // Default fallback
    try {
      const exchangeResponse = await api.get("/simple/price", {
        params: {
          ids: "usd",
          vs_currencies: "egp",
        },
      });
      usdToEgp = exchangeResponse.data.usd?.egp || 50;
    } catch (e) {
      console.warn("Using fallback EGP rate:", e.message);
    }

    // Convert all prices to EGP
    const coinsInEgp = response.data.map((coin) => ({
      ...coin,
      current_price: coin.current_price * usdToEgp,
      market_cap: coin.market_cap * usdToEgp,
      total_volume: coin.total_volume * usdToEgp,
    }));

    return coinsInEgp;
  } catch (error) {
    console.error("Error fetching top coins:", error);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
};

/**
 * Fetch gold and silver prices in EGP
 * @returns {Promise<Array>} Array of precious metals data
 */
export const fetchPreciousMetals = async () => {
  try {
    // Get USD to EGP exchange rate first
    const exchangeResponse = await api.get("/simple/price", {
      params: {
        ids: "usd",
        vs_currencies: "egp",
      },
    });

    const usdToEgp = exchangeResponse.data.usd?.egp || 50; // fallback

    // Fetch gold, silver, and other precious metals in USD
    const metals = ["tether-gold", "pax-gold"];
    const promises = metals.map((metal) =>
      api.get(`/simple/price`, {
        params: {
          ids: metal,
          vs_currencies: "usd",
          include_24hr_change: true,
          include_market_cap: true,
        },
      })
    );

    const responses = await Promise.all(promises);

    // Transform data to match coin format
    const metalsData = responses
      .map((response, index) => {
        const metalId = metals[index];
        const data = response.data[metalId];

        if (!data || !data.usd) return null;

        // Calculate prices for different weights in EGP
        const pricePerOunceUsd = data.usd;
        const pricePerOunce = pricePerOunceUsd * usdToEgp;
        const pricePerGram = pricePerOunce / 31.1035; // 1 oz = 31.1035 grams

        return {
          id: metalId,
          symbol: metalId === "tether-gold" ? "XAUT" : "PAXG",
          name:
            metalId === "tether-gold" ? "ذهب (Tether Gold)" : "ذهب (PAX Gold)",
          name_en: metalId === "tether-gold" ? "Tether Gold" : "PAX Gold",
          image:
            metalId === "tether-gold"
              ? "https://assets.coingecko.com/coins/images/10481/large/Tether_Gold.png"
              : "https://assets.coingecko.com/coins/images/9519/large/paxgold.png",
          current_price: pricePerOunce,
          price_per_gram: pricePerGram,
          price_per_10g: pricePerGram * 10,
          price_per_ounce: pricePerOunce,
          price_per_kilo: pricePerGram * 1000,
          market_cap: (data.usd_market_cap || 0) * usdToEgp,
          price_change_percentage_24h: data.usd_24h_change || 0,
          sparkline_in_7d: { price: [] },
          market_cap_rank: null,
          is_metal: true,
        };
      })
      .filter(Boolean);

    return metalsData;
  } catch (error) {
    console.error("Error fetching precious metals:", error);
    return []; // Return empty array on error
  }
};

/**
 * Fetch detailed information about a specific coin
 * @param {string} coinId - CoinGecko coin ID
 * @returns {Promise<Object>} Detailed coin data
 */
export const fetchCoinDetails = async (coinId) => {
  try {
    const response = await api.get(`/coins/${coinId}`, {
      params: {
        localization: false,
        tickers: false,
        community_data: false,
        developer_data: false,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching coin details for ${coinId}:`, error);
    throw error;
  }
};

/**
 * Search for coins by query
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching coins
 */
export const searchCoins = async (query) => {
  try {
    const response = await api.get("/search", {
      params: { query },
    });
    return response.data.coins;
  } catch (error) {
    console.error("Error searching coins:", error);
    throw error;
  }
};

/**
 * Fetch trending coins
 * @returns {Promise<Array>} Array of trending coins
 */
export const fetchTrending = async () => {
  try {
    const response = await api.get("/search/trending");
    return response.data.coins;
  } catch (error) {
    console.error("Error fetching trending coins:", error);
    throw error;
  }
};

/**
 * Fetch historical market data for a coin
 * @param {string} coinId - CoinGecko coin ID
 * @param {number} days - Number of days (1, 7, 30, 90, 365)
 * @returns {Promise<Object>} Historical price data
 */
export const fetchCoinChart = async (coinId, days = 7) => {
  try {
    const response = await api.get(`/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: "usd",
        days,
        interval: days === 1 ? "hourly" : "daily",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching chart data for ${coinId}:`, error);
    throw error;
  }
};

/**
 * Fetch global cryptocurrency market data
 * @returns {Promise<Object>} Global market data
 */
export const fetchGlobalData = async () => {
  try {
    const response = await api.get("/global");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching global data:", error);
    throw error;
  }
};

export default api;
