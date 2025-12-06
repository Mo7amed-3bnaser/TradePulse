/**
 * Format price with appropriate decimal places and currency symbol
 * @param {number} price - Price value
 * @param {string} currency - Currency symbol (default: 'EGP')
 * @param {boolean} isMetal - Is this a precious metal price
 * @param {string} language - Language code ('en' or 'ar')
 * @returns {string} Formatted price string
 */
export const formatPrice = (
  price,
  currency = "EGP",
  isMetal = false,
  language = "en"
) => {
  if (price === null || price === undefined) return "N/A";

  const locale = language === "ar" ? "ar-EG" : "en-US";
  const currencySymbol = language === "ar" ? "ج.م" : "EGP";

  // For precious metals in EGP, format differently
  if (isMetal && currency === "EGP") {
    return `${price.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currencySymbol}`;
  }

  // For very small prices (< 0.01), show more decimals
  if (price < 0.01) {
    return `${price.toFixed(6)} ${currencySymbol}`;
  }

  // For prices < 1, show 4 decimals
  if (price < 1) {
    return `${price.toFixed(4)} ${currencySymbol}`;
  }

  // For prices >= 1, show 2 decimals with thousand separators
  return `${price.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currencySymbol}`;
};

/**
 * Format percentage with sign and color indication
 * @param {number} percentage - Percentage value
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (percentage) => {
  if (percentage === null || percentage === undefined) return "N/A";

  const sign = percentage >= 0 ? "+" : "";
  return `${sign}${percentage.toFixed(2)}%`;
};

/**
 * Format market cap with abbreviations (K, M, B, T)
 * @param {number} value - Market cap value
 * @returns {string} Formatted market cap string
 */
export const formatMarketCap = (value) => {
  if (value === null || value === undefined) return "N/A";

  const trillion = 1_000_000_000_000;
  const billion = 1_000_000_000;
  const million = 1_000_000;
  const thousand = 1_000;

  if (value >= trillion) {
    return `$${(value / trillion).toFixed(2)}T`;
  } else if (value >= billion) {
    return `$${(value / billion).toFixed(2)}B`;
  } else if (value >= million) {
    return `$${(value / million).toFixed(2)}M`;
  } else if (value >= thousand) {
    return `$${(value / thousand).toFixed(2)}K`;
  }

  return `$${value.toFixed(2)}`;
};

/**
 * Format volume with abbreviations
 * @param {number} volume - Volume value
 * @returns {string} Formatted volume string
 */
export const formatVolume = (value) => {
  return formatMarketCap(value); // Same formatting as market cap
};

/**
 * Format timestamp to readable date/time
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @param {boolean} includeTime - Whether to include time (default: false)
 * @returns {string} Formatted date string
 */
export const formatTime = (timestamp, includeTime = false) => {
  if (!timestamp) return "N/A";

  const date = new Date(timestamp);

  if (includeTime) {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Get color class based on price change
 * @param {number} change - Price change percentage
 * @returns {string} Tailwind color class
 */
export const getPriceChangeColor = (change) => {
  if (change > 0) return "text-success";
  if (change < 0) return "text-danger";
  return "text-gray-500";
};

/**
 * Get background color class based on price change
 * @param {number} change - Price change percentage
 * @returns {string} Tailwind background color class
 */
export const getPriceChangeBgColor = (change) => {
  if (change > 0) return "bg-success/10";
  if (change < 0) return "bg-danger/10";
  return "bg-gray-500/10";
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Debounce function for search inputs
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
