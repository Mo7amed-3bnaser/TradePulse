import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Star } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useTranslation } from 'react-i18next'
import useCoinPrices from '../hooks/useCoinPrices'
import useWatchlistStore from '../store/useWatchlistStore'
import useLanguageStore from '../store/useLanguageStore'
import { formatPrice, formatPercentage, getPriceChangeColor } from '../utils/formatters'
import Loader from '../components/common/Loader'
import ErrorBanner from '../components/common/ErrorBanner'

const CoinDetails = () => {
    const { t } = useTranslation()
    const { language } = useLanguageStore()
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: coins, isLoading, isError, error } = useCoinPrices(100)
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore()

    // Find the coin from our list
    const coin = coins?.find(c => c.id === id)
    const inWatchlist = coin ? isInWatchlist(coin.id) : false

    const handleWatchlistToggle = () => {
        if (inWatchlist) {
            removeFromWatchlist(coin.id)
        } else {
            addToWatchlist(coin)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] p-8">
                <div className="container mx-auto">
                    <button
                        onClick={() => navigate('/')}
                        className="mb-4 flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        {t('coinDetails.backToHome')}
                    </button>
                    <ErrorBanner error={error?.message || t('errors.failedToLoadData')} />
                </div>
            </div>
        )
    }

    if (!coin) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] p-8">
                <div className="container mx-auto">
                    <button
                        onClick={() => navigate('/')}
                        className="mb-4 flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        {t('coinDetails.backToHome')}
                    </button>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                        <p className="text-red-600 dark:text-red-400 text-lg">
                            {t('coinDetails.coinNotFound')}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const isMetal = coin.is_metal || false
    const priceChange = coin.price_change_percentage_24h || 0
    const isPositive = priceChange >= 0

    // Generate sample chart data from sparkline
    const chartData = coin.sparkline_in_7d?.price?.length > 0
        ? coin.sparkline_in_7d.price
            .filter(price => price != null && !isNaN(price))
            .map((price, index) => ({
                time: index,
                price: Number(price),
            }))
        : Array.from({ length: 7 }, (_, i) => ({
            time: i,
            price: Number(coin.current_price) * (1 + (Math.random() - 0.5) * 0.05),
        }))

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] py-8">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {t('coinDetails.backToHome')}
                </button>

                {/* Header Card */}
                <div className="bg-white/80 dark:bg-[#161b22] backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-6 border border-slate-200 dark:border-[#30363d]">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <img
                                src={coin.image}
                                alt={coin.name}
                                className={`w-16 h-16 md:w-20 md:h-20 ${isMetal ? 'object-contain' : 'rounded-full'}`}
                            />
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                                        {language === 'ar' ? coin.name : (coin.name_en || coin.name)}
                                    </h1>
                                    {coin.karat && (
                                        <span className="px-3 py-1 rounded-md bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 text-sm font-bold text-yellow-700 dark:text-yellow-400">
                                            {coin.karat}K
                                        </span>
                                    )}
                                </div>
                                <p className="text-lg text-slate-500 dark:text-slate-400 uppercase mt-1">
                                    {coin.symbol}
                                </p>
                            </div>
                        </div>

                        {/* Watchlist Button */}
                        <button
                            onClick={handleWatchlistToggle}
                            className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-700/50 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors flex items-center gap-2"
                        >
                            <Star
                                className={`w-5 h-5 ${inWatchlist
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-slate-400 dark:text-slate-500'
                                    }`}
                            />
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                                {inWatchlist ? t('priceCard.removeFromWatchlist') : t('priceCard.addToWatchlist')}
                            </span>
                        </button>
                    </div>

                    {/* Price Info */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                {isMetal ? t('priceCard.pricePerGram') : t('priceCard.currentPrice')}
                            </p>
                            <p className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                                {formatPrice(coin.current_price, 'EGP', isMetal, language)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('coinDetails.change24h')}</p>
                            <div className="flex items-center gap-2">
                                {isPositive ? (
                                    <TrendingUp className={`w-6 h-6 ${getPriceChangeColor(priceChange)}`} />
                                ) : (
                                    <TrendingDown className={`w-6 h-6 ${getPriceChangeColor(priceChange)}`} />
                                )}
                                <span className={`text-2xl font-bold ${getPriceChangeColor(priceChange)}`}>
                                    {formatPercentage(priceChange)}
                                </span>
                            </div>
                        </div>

                        {coin.market_cap_rank && (
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('coinDetails.rank')}</p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    #{coin.market_cap_rank}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white/80 dark:bg-[#161b22] backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-6 border border-slate-200 dark:border-[#30363d]">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                        {t('coinDetails.chart7days')}
                    </h2>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke={isPositive ? "#10b981" : "#ef4444"}
                                    strokeWidth={2}
                                    fill="url(#colorPrice)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-slate-500 dark:text-slate-400">
                            {t('coinDetails.noChartData')}
                        </div>
                    )}
                </div>

                {/* Metal Specific Details */}
                {isMetal && (
                    <div className="bg-white/80 dark:bg-[#161b22] backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-[#30363d]">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            {t('coinDetails.pricesByWeight')}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('priceCard.gram').replace(':', '')}</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                    {formatPrice(coin.price_per_gram, 'EGP', true, language)}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('priceCard.tenGrams').replace(':', '')}</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                    {formatPrice(coin.price_per_10g, 'EGP', true, language)}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('coinDetails.ounce')}</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                    {formatPrice(coin.price_per_ounce, 'EGP', true, language)}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('priceCard.kilo').replace(':', '')}</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                    {formatPrice(coin.price_per_kilo, 'EGP', true, language)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CoinDetails
