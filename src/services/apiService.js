import axios from "axios";

/**
 * Fetch historical price data from CoinGecko API
 * @param {string} coinId - The coin ID (e.g., 'bitcoin', 'ethereum')
 * @param {number} days - Number of days (1, 7, 30, 90, 365, 'max')
 * @returns {Promise<Array>} Array of [timestamp, price] pairs
 */
export const fetchHistoricalPrices = async (coinId, days) => {
  try {
    // Get API key from environment variable
    const EXCHANGE_API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;

    // Map internal IDs to CoinGecko IDs
    const coinGeckoIds = {
      "gold-24k": "gold",
      "gold-21k": "gold",
      "gold-18k": "gold",
      silver: "silver",
      platinum: "platinum",
      bitcoin: "bitcoin",
      ethereum: "ethereum",
      tether: "tether",
    };

    const geckoId = coinGeckoIds[coinId] || coinId;

    // For metals, we use a different approach since CoinGecko doesn't have direct metal prices
    if (
      ["gold-24k", "gold-21k", "gold-18k", "silver", "platinum"].includes(
        coinId
      )
    ) {
      // Fetch gold price in USD from CoinGecko
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${geckoId}/market_chart`,
        {
          params: {
            vs_currency: "usd",
            days,
            interval: days === 1 ? "hourly" : "daily",
          },
        }
      );

      // Get EGP exchange rate
      const exchangeUrl = EXCHANGE_API_KEY
        ? `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/USD`
        : "https://api.exchangerate-api.com/v4/latest/USD";

      const exchangeResponse = await axios
        .get(exchangeUrl)
        .catch(() => ({ data: { rates: { EGP: 47.7 } } }));

      const usdToEgp = exchangeResponse.data.rates.EGP;

      // Convert prices to EGP and adjust for karat
      return response.data.prices.map(([timestamp, pricePerOunce]) => {
        let pricePerGram = (pricePerOunce * usdToEgp) / 31.1035;

        // Adjust for karat
        if (coinId === "gold-21k") {
          pricePerGram *= 21 / 24;
        } else if (coinId === "gold-18k") {
          pricePerGram *= 18 / 24;
        }

        return [timestamp, pricePerGram];
      });
    }

    // For cryptocurrencies
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${geckoId}/market_chart`,
      {
        params: {
          vs_currency: "egp",
          days,
          interval: days === 1 ? "hourly" : "daily",
        },
      }
    );

    return response.data.prices;
  } catch (error) {
    console.error("Error fetching historical prices:", error);
    return [];
  }
};

/**
 * Simple translation dictionary for news
 */
const newsTranslations = {
  // Common crypto/finance terms
  Bitcoin: "بيتكوين",
  Ethereum: "إيثريوم",
  Gold: "الذهب",
  Silver: "الفضة",
  Platinum: "البلاتينوم",
  Price: "السعر",
  Market: "السوق",
  Trading: "التداول",
  Investors: "المستثمرون",
  Cryptocurrency: "العملات الرقمية",
  Crypto: "الكريبتو",
};

/**
 * Translate news title/description to Arabic (simple keyword replacement)
 * @param {string} text - Text to translate
 * @param {string} lang - Target language
 * @returns {string} Translated or original text
 */
const translateNews = (text, lang) => {
  if (lang !== "ar") return text;

  let translated = text;
  Object.entries(newsTranslations).forEach(([en, ar]) => {
    translated = translated.replace(new RegExp(en, "gi"), ar);
  });

  return translated;
};

/**
 * Fetch latest news about cryptocurrencies and precious metals
 * @param {string} category - Category filter ('crypto', 'gold', 'all')
 * @param {number} limit - Number of articles to fetch
 * @param {string} lang - Language code ('en' or 'ar')
 * @returns {Promise<Array>} Array of news articles
 */
export const fetchCryptoNews = async (
  category = "all",
  limit = 20,
  lang = "en"
) => {
  try {
    // Use CoinDesk RSS feed via RSS2JSON (free, no key needed)
    const response = await axios.get("https://api.rss2json.com/v1/api.json", {
      params: {
        rss_url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
        api_key: "public",
        count: limit,
      },
    });

    if (response.data.status === "ok" && response.data.items) {
      return response.data.items.map((article, index) => ({
        id: `news-${index}-${Date.now()}`,
        title: translateNews(article.title, lang),
        description:
          translateNews(
            article.description?.replace(/<[^>]*>/g, "").substring(0, 150) +
              "...",
            lang
          ) || translateNews(article.title, lang),
        source: "CoinDesk",
        time: new Date(article.pubDate).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        url: article.link,
        image:
          article.thumbnail ||
          article.enclosure?.link ||
          "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop",
        category: "crypto",
        sentiment: "neutral",
      }));
    }

    return generateFallbackNews(lang);
  } catch (error) {
    console.error("Error fetching news:", error);
    // Return fallback static news if API fails
    return generateFallbackNews(lang);
  }
};

/**
 * Generate fallback news when API is unavailable
 * @param {string} lang - Language code
 * @returns {Array} Array of static news articles
 */
const generateFallbackNews = (lang = "en") => {
  const newsAr = [
    {
      id: "fallback-1",
      title: "أسعار الذهب تبقى قوية وسط حالة عدم اليقين الاقتصادي",
      description:
        "المعادن الثمينة تستمر في جذب المستثمرين كملاذ آمن خلال ظروف السوق المتقلبة.",
      source: "TradePulse",
      time: new Date().toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      url: "#",
      image:
        "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=200&fit=crop",
      category: "gold",
      sentiment: "positive",
    },
    {
      id: "fallback-2",
      title: "البيتكوين يواصل إظهار المرونة",
      description:
        "العملة الرقمية الرائدة تحافظ على مكانتها مع نمو التبني المؤسسي.",
      source: "TradePulse",
      time: new Date().toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      url: "#",
      image:
        "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=200&fit=crop",
      category: "crypto",
      sentiment: "positive",
    },
    {
      id: "fallback-3",
      title: "ترقية الإيثريوم تعزز كفاءة الشبكة",
      description:
        "آخر التحديثات تجلب سرعات معاملات محسّنة ورسوم مخفضة لشبكة الإيثريوم.",
      source: "TradePulse",
      time: new Date().toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      url: "#",
      image:
        "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=200&fit=crop",
      category: "crypto",
      sentiment: "positive",
    },
    {
      id: "fallback-4",
      title: "الفضة تشهد طلباً متزايداً من القطاع الصناعي",
      description:
        "استخدامات الفضة في التكنولوجيا الخضراء والألواح الشمسية يدفع الأسعار للأعلى.",
      source: "TradePulse",
      time: new Date().toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      url: "#",
      image:
        "https://images.unsplash.com/photo-1610375461369-d613b564f4c4?w=400&h=200&fit=crop",
      category: "gold",
      sentiment: "positive",
    },
  ];

  const newsEn = [
    {
      id: "fallback-1",
      title: "Gold Prices Remain Strong Amid Economic Uncertainty",
      description:
        "Precious metals continue to attract investors as a safe haven during volatile market conditions.",
      source: "TradePulse",
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      url: "#",
      image:
        "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=200&fit=crop",
      category: "gold",
      sentiment: "positive",
    },
    {
      id: "fallback-2",
      title: "Bitcoin Continues to Show Resilience",
      description:
        "The leading cryptocurrency maintains its position as institutional adoption grows.",
      source: "TradePulse",
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      url: "#",
      image:
        "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=200&fit=crop",
      category: "crypto",
      sentiment: "positive",
    },
    {
      id: "fallback-3",
      title: "Ethereum Upgrade Enhances Network Efficiency",
      description:
        "Latest updates bring improved transaction speeds and reduced fees to the Ethereum network.",
      source: "TradePulse",
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      url: "#",
      image:
        "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=200&fit=crop",
      category: "crypto",
      sentiment: "positive",
    },
  ];

  return lang === "ar" ? newsAr : newsEn;
};

/**
 * Get price alert notification
 * @param {Object} alert - Alert object with coin, type, and target price
 * @param {number} currentPrice - Current price of the coin
 * @returns {boolean} Whether alert should be triggered
 */
export const checkPriceAlert = (alert, currentPrice) => {
  if (!alert.active) return false;

  if (alert.type === "above") {
    return currentPrice >= alert.targetPrice;
  } else if (alert.type === "below") {
    return currentPrice <= alert.targetPrice;
  }

  return false;
};

/**
 * Request browser notification permission
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

/**
 * Show browser notification
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 */
export const showNotification = (title, options = {}) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    });
  }
};

export default {
  fetchHistoricalPrices,
  fetchCryptoNews,
  checkPriceAlert,
  requestNotificationPermission,
  showNotification,
};
