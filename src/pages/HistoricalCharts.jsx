import { TrendingUp, Calendar, BarChart3, ArrowLeft, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import useCoinPrices from '../hooks/useCoinPrices'
import useLanguageStore from '../store/useLanguageStore'
import { fetchHistoricalPrices } from '../services/apiService'

const HistoricalCharts = () => {
    const { t } = useTranslation()
    const { language } = useLanguageStore()
    const { data: coins } = useCoinPrices(100)
    
    const [selectedCoin, setSelectedCoin] = useState('gold-21k')
    const [timeRange, setTimeRange] = useState('7')
    const [chartType, setChartType] = useState('area')
    const [compareMode, setCompareMode] = useState(false)
    const [compareCoin, setCompareCoin] = useState('gold-24k')
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)

    const availableCoins = coins?.filter(c => c.is_metal || ['bitcoin', 'ethereum', 'tether'].includes(c.id)) || []
    
    // Fetch real historical data
    useEffect(() => {
        const loadHistoricalData = async () => {
            setLoading(true)
            try {
                const prices = await fetchHistoricalPrices(selectedCoin, timeRange)
                
                if (prices && prices.length > 0) {
                    const formattedData = prices.map(([timestamp, price]) => {
                        const date = new Date(timestamp)
                        return {
                            date: date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                ...(timeRange === '1' ? { hour: '2-digit' } : {})
                            }),
                            timestamp,
                            [selectedCoin]: Math.round(price * 100) / 100
                        }
                    })
                    
                    if (compareMode) {
                        const comparePrices = await fetchHistoricalPrices(compareCoin, timeRange)
                        const mergedData = formattedData.map((item, index) => {
                            if (comparePrices[index]) {
                                return {
                                    ...item,
                                    [compareCoin]: Math.round(comparePrices[index][1] * 100) / 100
                                }
                            }
                            return item
                        })
                        setData(mergedData)
                    } else {
                        setData(formattedData)
                    }
                } else {
                    // Fallback to mock data if API fails
                    const mockData = generateMockData(selectedCoin)
                    setData(mockData)
                }
            } catch (error) {
                console.error('Error loading historical data:', error)
                // Fallback to mock data
                const mockData = generateMockData(selectedCoin)
                setData(mockData)
            } finally {
                setLoading(false)
            }
        }
        
        loadHistoricalData()
    }, [selectedCoin, timeRange, compareMode, compareCoin, language])
    
    // Fallback mock data generator
    const generateMockData = (coinId) => {
        const coin = coins?.find(c => c.id === coinId)
        if (!coin) return []
        
        const basePrice = coin.current_price
        const points = timeRange === '1' ? 24 : parseInt(timeRange)
        const data = []
        
        for (let i = points; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
            const randomChange = (Math.random() - 0.5) * 0.1
            const price = basePrice * (1 + randomChange)
            
            data.push({
                date: date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' }),
                timestamp: date.getTime(),
                [coinId]: Math.round(price * 100) / 100
            })
        }
        return data
    }

    const selectedCoinData = coins?.find(c => c.id === selectedCoin)
    const compareCoinData = coins?.find(c => c.id === compareCoin)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] py-8">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 text-slate-700 dark:text-slate-300 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('coinDetails.backToHome')}</span>
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                            {t('charts.title')}
                        </h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                        {t('charts.subtitle')}
                    </p>
                </div>

                {/* Controls */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Coin Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {t('charts.selectCoin')}
                            </label>
                            <select
                                value={selectedCoin}
                                onChange={(e) => setSelectedCoin(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                            >
                                {availableCoins.map(coin => (
                                    <option key={coin.id} value={coin.id}>
                                        {language === 'ar' ? coin.name : (coin.name_en || coin.name)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Time Range */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {t('charts.timeRange')}
                            </label>
                            <div className="flex gap-2">
                                {['7', '30', '90', '365'].map(range => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        disabled={loading}
                                        className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 ${
                                            timeRange === range
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                        {t(`charts.${range === '7' ? '7d' : range === '30' ? '1m' : range === '90' ? '3m' : '1y'}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chart Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {t('charts.chartType')}
                            </label>
                            <div className="flex gap-2">
                                {['area', 'line'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setChartType(type)}
                                        className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                                            chartType === type
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                        {t(`charts.${type}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Compare Mode */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {t('charts.compare')}
                            </label>
                            <button
                                onClick={() => setCompareMode(!compareMode)}
                                className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                    compareMode
                                        ? 'bg-green-500 text-white'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                            >
                                {compareMode ? t('charts.comparing') : t('charts.compareMode')}
                            </button>
                        </div>
                    </div>

                    {/* Compare Coin Selection */}
                    {compareMode && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {t('charts.compareWith')}
                            </label>
                            <select
                                value={compareCoin}
                                onChange={(e) => setCompareCoin(e.target.value)}
                                className="w-full md:w-1/2 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                            >
                                {availableCoins.filter(c => c.id !== selectedCoin).map(coin => (
                                    <option key={coin.id} value={coin.id}>
                                        {language === 'ar' ? coin.name : (coin.name_en || coin.name)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Price Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Selected Coin Info */}
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-4 mb-4">
                            <img src={selectedCoinData?.image} alt="" className="w-12 h-12 rounded-full" />
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {language === 'ar' ? selectedCoinData?.name : (selectedCoinData?.name_en || selectedCoinData?.name)}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedCoinData?.symbol}</p>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            {selectedCoinData?.current_price?.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })} {language === 'ar' ? 'ج.م' : 'EGP'}
                        </p>
                        <p className={`text-sm mt-2 ${selectedCoinData?.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedCoinData?.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(selectedCoinData?.price_change_percentage_24h || 0).toFixed(2)}% (24h)
                        </p>
                    </div>

                    {/* Compare Coin Info */}
                    {compareMode && (
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-4 mb-4">
                                <img src={compareCoinData?.image} alt="" className="w-12 h-12 rounded-full" />
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {language === 'ar' ? compareCoinData?.name : (compareCoinData?.name_en || compareCoinData?.name)}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{compareCoinData?.symbol}</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {compareCoinData?.current_price?.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })} {language === 'ar' ? 'ج.م' : 'EGP'}
                            </p>
                            <p className={`text-sm mt-2 ${compareCoinData?.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {compareCoinData?.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(compareCoinData?.price_change_percentage_24h || 0).toFixed(2)}% (24h)
                            </p>
                        </div>
                    )}
                </div>

                {/* Chart */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {t('charts.priceHistory')}
                        </h2>
                        {loading && (
                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span className="text-sm">{t('loader.loading')}</span>
                            </div>
                        )}
                    </div>
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                            {chartType === 'area' ? (
                                <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                    {compareMode && (
                                        <linearGradient id="colorCompare" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    )}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="date" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Legend />
                                <Area 
                                    type="monotone" 
                                    dataKey={selectedCoin} 
                                    stroke="#8b5cf6" 
                                    strokeWidth={2}
                                    fill="url(#colorPrice)" 
                                    name={language === 'ar' ? selectedCoinData?.name : (selectedCoinData?.name_en || selectedCoinData?.name)}
                                />
                                {compareMode && (
                                    <Area 
                                        type="monotone" 
                                        dataKey={compareCoin} 
                                        stroke="#3b82f6" 
                                        strokeWidth={2}
                                        fill="url(#colorCompare)"
                                        name={language === 'ar' ? compareCoinData?.name : (compareCoinData?.name_en || compareCoinData?.name)}
                                    />
                                )}
                            </AreaChart>
                        ) : (
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="date" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey={selectedCoin} 
                                    stroke="#8b5cf6" 
                                    strokeWidth={3}
                                    dot={false}
                                    name={language === 'ar' ? selectedCoinData?.name : (selectedCoinData?.name_en || selectedCoinData?.name)}
                                />
                                {compareMode && (
                                    <Line 
                                        type="monotone" 
                                        dataKey={compareCoin} 
                                        stroke="#3b82f6" 
                                        strokeWidth={3}
                                        dot={false}
                                        name={language === 'ar' ? compareCoinData?.name : (compareCoinData?.name_en || compareCoinData?.name)}
                                    />
                                )}
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-96">
                            <p className="text-slate-600 dark:text-slate-400">{t('charts.noData')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HistoricalCharts
