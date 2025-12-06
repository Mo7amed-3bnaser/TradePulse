import axios from "axios";

/**
 * Fetch real-time gold, silver, and platinum prices using CoinGecko API
 * @returns {Promise<Array>} Array of precious metals data in EGP
 */
export const fetchRealMetalsPrices = async () => {
  try {
    // Get EGP exchange rate first
    const exchangeResponse = await axios
      .get("https://api.exchangerate-api.com/v4/latest/USD")
      .catch(() => null);

    let usdToEgp = exchangeResponse?.data?.rates?.EGP || 47.7;

    // Fetch metals prices from GoldPrice.org (Free API, no key needed, real-time data)
    const metalsResponse = await axios
      .get("https://data-asg.goldprice.org/dbXRates/USD")
      .catch(() => null);

    const metalData = metalsResponse?.data?.items?.[0];

    // Extract prices (GoldPrice.org returns price per troy ounce in USD)
    let goldPricePerOunce = metalData?.xauPrice || 2650;
    let silverPricePerOunce = metalData?.xagPrice || 31;
    let platinumPricePerOunce = 980; // GoldPrice.org doesn't provide platinum, use fallback

    // Get 24h change percentages
    const goldChange = metalData?.pcXau || 0;
    const silverChange = metalData?.pcXag || 0;
    const platinumChange = 0;

    // Calculate per gram prices in EGP (1 troy ounce = 31.1035 grams)
    const gold24kPerGram = (goldPricePerOunce * usdToEgp) / 31.1035;
    const gold21kPerGram = gold24kPerGram * (21 / 24); // 21K is 87.5% pure
    const gold18kPerGram = gold24kPerGram * (18 / 24); // 18K is 75% pure
    const silverPricePerGram = (silverPricePerOunce * usdToEgp) / 31.1035;
    const platinumPricePerGram = (platinumPricePerOunce * usdToEgp) / 31.1035;

    const metals = [
      // Gold 24 Karat (Pure Gold)
      {
        id: "gold-24k",
        symbol: "XAU 24K",
        name: "ذهب عيار 24",
        name_en: "Gold 24 Karat",
        image: "https://cdn-icons-png.flaticon.com/512/2829/2829738.png",
        current_price: Math.round(gold24kPerGram * 100) / 100,
        price_per_gram: Math.round(gold24kPerGram * 100) / 100,
        price_per_10g: Math.round(gold24kPerGram * 10 * 100) / 100,
        price_per_ounce: Math.round(goldPricePerOunce * usdToEgp * 100) / 100,
        price_per_kilo: Math.round(gold24kPerGram * 1000 * 100) / 100,
        market_cap: 0,
        price_change_percentage_24h: Math.round(goldChange * 100) / 100,
        sparkline_in_7d: { price: [] },
        market_cap_rank: null,
        is_metal: true,
        karat: 24,
      },
      // Gold 21 Karat (Most common in Egypt)
      {
        id: "gold-21k",
        symbol: "XAU 21K",
        name: "ذهب عيار 21",
        name_en: "Gold 21 Karat",
        image: "https://cdn-icons-png.flaticon.com/512/2491/2491186.png",
        current_price: Math.round(gold21kPerGram * 100) / 100,
        price_per_gram: Math.round(gold21kPerGram * 100) / 100,
        price_per_10g: Math.round(gold21kPerGram * 10 * 100) / 100,
        price_per_ounce: Math.round(gold21kPerGram * 31.1035 * 100) / 100,
        price_per_kilo: Math.round(gold21kPerGram * 1000 * 100) / 100,
        market_cap: 0,
        price_change_percentage_24h: Math.round(goldChange * 100) / 100,
        sparkline_in_7d: { price: [] },
        market_cap_rank: null,
        is_metal: true,
        karat: 21,
      },
      // Gold 18 Karat
      {
        id: "gold-18k",
        symbol: "XAU 18K",
        name: "ذهب عيار 18",
        name_en: "Gold 18 Karat",
        image: "https://cdn-icons-png.flaticon.com/512/3143/3143981.png",
        current_price: Math.round(gold18kPerGram * 100) / 100,
        price_per_gram: Math.round(gold18kPerGram * 100) / 100,
        price_per_10g: Math.round(gold18kPerGram * 10 * 100) / 100,
        price_per_ounce: Math.round(gold18kPerGram * 31.1035 * 100) / 100,
        price_per_kilo: Math.round(gold18kPerGram * 1000 * 100) / 100,
        market_cap: 0,
        price_change_percentage_24h: Math.round(goldChange * 100) / 100,
        sparkline_in_7d: { price: [] },
        market_cap_rank: null,
        is_metal: true,
        karat: 18,
      },
      // Silver
      {
        id: "silver",
        symbol: "XAG",
        name: "فضة",
        name_en: "Silver",
        image: "https://cdn-icons-png.flaticon.com/512/2087/2087635.png",
        current_price: Math.round(silverPricePerGram * 100) / 100,
        price_per_gram: Math.round(silverPricePerGram * 100) / 100,
        price_per_10g: Math.round(silverPricePerGram * 10 * 100) / 100,
        price_per_ounce: Math.round(silverPricePerOunce * usdToEgp * 100) / 100,
        price_per_kilo: Math.round(silverPricePerGram * 1000 * 100) / 100,
        market_cap: 0,
        price_change_percentage_24h: Math.round(silverChange * 100) / 100,
        sparkline_in_7d: { price: [] },
        market_cap_rank: null,
        is_metal: true,
      },
      // Platinum
      {
        id: "platinum",
        symbol: "XPT",
        name: "بلاتين",
        name_en: "Platinum",
        image: "https://cdn-icons-png.flaticon.com/512/2087/2087746.png",
        current_price: Math.round(platinumPricePerGram * 100) / 100,
        price_per_gram: Math.round(platinumPricePerGram * 100) / 100,
        price_per_10g: Math.round(platinumPricePerGram * 10 * 100) / 100,
        price_per_ounce:
          Math.round(platinumPricePerOunce * usdToEgp * 100) / 100,
        price_per_kilo: Math.round(platinumPricePerGram * 1000 * 100) / 100,
        market_cap: 0,
        price_change_percentage_24h: Math.round(platinumChange * 100) / 100,
        sparkline_in_7d: { price: [] },
        market_cap_rank: null,
        is_metal: true,
      },
    ];

    return metals;
  } catch (error) {
    console.error("Error fetching metals prices:", error);
    return [];
  }
};

export default { fetchRealMetalsPrices };
