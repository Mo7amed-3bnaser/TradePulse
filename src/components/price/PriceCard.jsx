import { memo } from 'react'
import { Star, TrendingUp, TrendingDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatPrice, formatPercentage, getPriceChangeColor, getPriceChangeBgColor } from '../../utils/formatters'
import useWatchlistStore from '../../store/useWatchlistStore'
import useLanguageStore from '../../store/useLanguageStore'
import { MotionDiv } from '../../utils/animations'
import { cardHover } from '../../utils/animations'

const PriceCard = ({ coin, onClick, index = 0 }) => {
    const { t } = useTranslation()
    const { language } = useLanguageStore()
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore()
    const inWatchlist = isInWatchlist(coin.id)

    const handleWatchlistToggle = (e) => {
        e.stopPropagation()
        if (inWatchlist) {
            removeFromWatchlist(coin.id)
        } else {
            addToWatchlist(coin)
        }
    }

    const priceChange = coin.price_change_percentage_24h || 0
    const isPositive = priceChange >= 0
    const isMetal = coin.is_metal || false

    return (
        <MotionDiv
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={cardHover.whileHover}
            whileTap={cardHover.whileTap}
            className={`group relative p-4 sm:p-5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border transition-all duration-300 cursor-pointer ${
                isMetal 
                    ? 'border-yellow-400 dark:border-yellow-600 hover:border-yellow-500 dark:hover:border-yellow-500'
                    : 'border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500'
            }`}
        >
            {/* Watchlist Button - LEFT in Arabic (RTL), RIGHT in English (LTR) */}
            <button
                onClick={handleWatchlistToggle}
                className="absolute top-2 ltr:right-4 rtl:left-4 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors z-10"
                aria-label={inWatchlist ? t('priceCard.removeFromWatchlist') : t('priceCard.addToWatchlist')}
            >
                <Star
                    className={`w-4 h-4 transition-all duration-200 ${inWatchlist
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                />
            </button>

            {/* Coin/Metal Header */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <img
                    src={coin.image}
                    alt={coin.name}
                    className={`w-9 h-9 sm:w-10 sm:h-10 ${isMetal ? 'object-contain' : 'rounded-full'}`}
                    loading="lazy"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {language === 'ar' ? coin.name : (coin.name_en || coin.name)}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 uppercase">
                        {coin.symbol}
                    </p>
                </div>
            </div>

            {/* Karat Badge - Below Header */}
            {coin.karat && (
                <div className="mb-3 inline-block px-2.5 py-1 rounded-md bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700">
                    <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">
                        {coin.karat}K
                    </span>
                </div>
            )}

            {/* Price - Main Price */}
            <div className="mb-2 sm:mb-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    {isMetal ? t('priceCard.pricePerGram') : t('priceCard.currentPrice')}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {formatPrice(coin.current_price, 'EGP', isMetal, language)}
                </p>
            </div>

            {/* Metal Prices - Different weights */}
            {isMetal && coin.price_per_gram && (
                <div className="mb-2 sm:mb-3 space-y-1 sm:space-y-1.5 p-2 sm:p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">{t('priceCard.gram')}</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {formatPrice(coin.price_per_gram, 'EGP', true, language)}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">{t('priceCard.tenGrams')}</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {formatPrice(coin.price_per_10g, 'EGP', true, language)}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">{t('priceCard.kilo')}</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {formatPrice(coin.price_per_kilo, 'EGP', true, language)}
                        </span>
                    </div>
                </div>
            )}

            {/* Price Change */}
            <div className="flex items-center justify-between">
                <div
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${getPriceChangeBgColor(
                        priceChange
                    )}`}
                >
                    {isPositive ? (
                        <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-danger" />
                    )}
                    <span className={`text-sm font-semibold ${getPriceChangeColor(priceChange)}`}>
                        {formatPercentage(priceChange)}
                    </span>
                </div>

                {/* Market Cap Rank */}
                {coin.market_cap_rank && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        #{coin.market_cap_rank}
                    </div>
                )}
            </div>

            {/* Sparkline (if available) */}
            {coin.sparkline_in_7d?.price && coin.sparkline_in_7d.price.length > 0 && !isMetal && (
                <div className="mt-3 h-12 opacity-50 group-hover:opacity-100 transition-opacity">
                    <MiniSparkline data={coin.sparkline_in_7d.price} isPositive={isPositive} />
                </div>
            )}
        </MotionDiv>
    )
}

// Mini sparkline component
const MiniSparkline = ({ data, isPositive }) => {
    if (!data || data.length === 0) return null

    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min

    const points = data
        .map((value, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 100 - ((value - min) / range) * 100
            return `${x},${y}`
        })
        .join(' ')

    return (
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <polyline
                points={points}
                fill="none"
                stroke={isPositive ? '#10b981' : '#ef4444'}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    )
}

export default memo(PriceCard)
