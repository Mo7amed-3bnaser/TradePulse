import { Bell, BellRing, Newspaper, Plus, Trash2, TrendingUp, TrendingDown, X, ArrowLeft, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import useCoinPrices from '../hooks/useCoinPrices'
import useLanguageStore from '../store/useLanguageStore'
import { fetchCryptoNews, requestNotificationPermission, showNotification, checkPriceAlert } from '../services/apiService'

const NewsAlerts = () => {
    const { t } = useTranslation()
    const { language } = useLanguageStore()
    const { data: coins } = useCoinPrices(100)
    
    const [activeTab, setActiveTab] = useState('news')
    const [showCreateAlert, setShowCreateAlert] = useState(false)
    const [newsCategory, setNewsCategory] = useState('all')
    const [newsItems, setNewsItems] = useState([])
    const [loadingNews, setLoadingNews] = useState(false)
    const [notificationPermission, setNotificationPermission] = useState('default')
    const [alerts, setAlerts] = useState([
        {
            id: 1,
            coinId: 'gold-24k',
            coinName: language === 'ar' ? 'ذهب عيار 24' : 'Gold 24K',
            type: 'above',
            targetPrice: 4500,
            currentPrice: 4320,
            active: true
        },
        {
            id: 2,
            coinId: 'bitcoin',
            coinName: 'Bitcoin',
            type: 'below',
            targetPrice: 90000,
            currentPrice: 96500,
            active: true
        }
    ])
    
    const [newAlert, setNewAlert] = useState({
        coinId: '',
        type: 'above',
        targetPrice: ''
    })

    // Request notification permission on mount
    useEffect(() => {
        const checkPermission = async () => {
            const permission = await requestNotificationPermission()
            setNotificationPermission(permission)
        }
        checkPermission()
    }, [])

    // Load news from API
    useEffect(() => {
        loadNews()
    }, [newsCategory, language])

    // Check alerts periodically
    useEffect(() => {
        if (!coins || alerts.length === 0) return

        const checkAlerts = () => {
            alerts.forEach(alert => {
                if (!alert.active) return

                const coin = coins.find(c => c.id === alert.coinId)
                if (!coin) return

                const triggered = checkPriceAlert(alert, coin.current_price)
                
                if (triggered) {
                    // Update alert status
                    setAlerts(prev => prev.map(a => 
                        a.id === alert.id ? { ...a, active: false } : a
                    ))

                    // Show notification
                    const title = language === 'ar' 
                        ? `تنبيه سعر: ${alert.coinName}`
                        : `Price Alert: ${alert.coinName}`
                    
                    const body = language === 'ar'
                        ? `السعر ${alert.type === 'above' ? 'تجاوز' : 'انخفض عن'} ${alert.targetPrice.toLocaleString()} EGP`
                        : `Price ${alert.type === 'above' ? 'went above' : 'went below'} ${alert.targetPrice.toLocaleString()} EGP`

                    showNotification(title, {
                        body,
                        icon: '/logo.png',
                        badge: '/logo.png',
                        tag: `alert-${alert.id}`,
                    })
                }
            })
        }

        // Check immediately and then every 30 seconds
        checkAlerts()
        const interval = setInterval(checkAlerts, 30000)

        return () => clearInterval(interval)
    }, [coins, alerts, language])

    const loadNews = async () => {
        setLoadingNews(true)
        try {
            const category = newsCategory === 'all' ? 'crypto' : newsCategory
            const news = await fetchCryptoNews(category, 20, language)
            setNewsItems(news)
        } catch (error) {
            console.error('Failed to load news:', error)
            // Keep existing news or show empty state
        } finally {
            setLoadingNews(false)
        }
    }

    const requestNotifications = async () => {
        const permission = await requestNotificationPermission()
        setNotificationPermission(permission)
        
        if (permission === 'granted') {
            showNotification(
                language === 'ar' ? 'تم تفعيل التنبيهات' : 'Notifications Enabled',
                {
                    body: language === 'ar' 
                        ? 'سنرسل لك تنبيهات عند تحقق شروط الأسعار'
                        : 'We will notify you when price conditions are met',
                    icon: '/logo.png'
                }
            )
        }
    }

    const availableCoins = coins?.filter(c => c.is_metal || ['bitcoin', 'ethereum', 'tether'].includes(c.id)) || []

    const handleCreateAlert = () => {
        if (!newAlert.coinId || !newAlert.targetPrice) return
        
        const coin = coins?.find(c => c.id === newAlert.coinId)
        if (!coin) return

        const alert = {
            id: Date.now(),
            coinId: newAlert.coinId,
            coinName: language === 'ar' ? coin.name : (coin.name_en || coin.name),
            type: newAlert.type,
            targetPrice: parseFloat(newAlert.targetPrice),
            currentPrice: coin.current_price,
            active: true
        }

        setAlerts([...alerts, alert])
        setNewAlert({ coinId: '', type: 'above', targetPrice: '' })
        setShowCreateAlert(false)
    }

    const handleDeleteAlert = (id) => {
        setAlerts(alerts.filter(a => a.id !== id))
    }

    const toggleAlert = (id) => {
        setAlerts(alerts.map(a => a.id === id ? {...a, active: !a.active} : a))
    }

    const getSentimentColor = (sentiment) => {
        switch(sentiment) {
            case 'positive': return 'text-green-600 dark:text-green-400'
            case 'negative': return 'text-red-600 dark:text-red-400'
            default: return 'text-slate-600 dark:text-slate-400'
        }
    }

    const getSentimentBadge = (sentiment) => {
        switch(sentiment) {
            case 'positive': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            case 'negative': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
        }
    }

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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <BellRing className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                            {t('news.title')}
                        </h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                        {t('news.subtitle')}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('news')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                            activeTab === 'news'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                        }`}
                    >
                        <Newspaper className="w-5 h-5" />
                        {t('news.newsTab')}
                    </button>
                    <button
                        onClick={() => setActiveTab('alerts')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                            activeTab === 'alerts'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                        }`}
                    >
                        <Bell className="w-5 h-5" />
                        {t('news.alertsTab')}
                        {alerts.filter(a => a.active).length > 0 && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                                {alerts.filter(a => a.active).length}
                            </span>
                        )}
                    </button>
                </div>

                {/* News Tab */}
                {activeTab === 'news' && (
                    <div>
                        {/* News Filters */}
                        <div className="flex items-center gap-3 mb-6 flex-wrap">
                            <button
                                onClick={() => setNewsCategory('all')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                    newsCategory === 'all'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                                }`}
                            >
                                {t('news.all') || 'All'}
                            </button>
                            <button
                                onClick={() => setNewsCategory('crypto')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                    newsCategory === 'crypto'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                                }`}
                            >
                                {t('news.crypto') || 'Crypto'}
                            </button>
                            <button
                                onClick={() => setNewsCategory('metals')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                    newsCategory === 'metals'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                                }`}
                            >
                                {t('news.metals') || 'Metals'}
                            </button>
                            <button
                                onClick={loadNews}
                                disabled={loadingNews}
                                className="px-4 py-2 rounded-lg font-semibold bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-slate-700 transition-all flex items-center gap-2 ltr:ml-auto rtl:mr-auto"
                            >
                                <RefreshCw className={`w-4 h-4 ${loadingNews ? 'animate-spin' : ''}`} />
                                {t('news.refresh') || 'Refresh'}
                            </button>
                        </div>

                        {/* Loading State */}
                        {loadingNews && (
                            <div className="flex items-center justify-center py-20">
                                <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
                            </div>
                        )}

                        {/* News Grid */}
                        {!loadingNews && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {newsItems.map(news => (
                                    <a 
                                        key={news.id}
                                        href={news.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all"
                                    >
                                        <img 
                                            src={news.image} 
                                            alt="" 
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="p-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSentimentBadge(news.sentiment)}`}>
                                                    {t(`news.${news.sentiment}`)}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {news.time}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                                                {news.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                                                {news.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                                    {news.source}
                                                </span>
                                                {news.sentiment === 'positive' ? (
                                                    <TrendingUp className={`w-5 h-5 ${getSentimentColor(news.sentiment)}`} />
                                                ) : news.sentiment === 'negative' ? (
                                                    <TrendingDown className={`w-5 h-5 ${getSentimentColor(news.sentiment)}`} />
                                                ) : null}
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Alerts Tab */}
                {activeTab === 'alerts' && (
                    <div>
                        {/* Notification Permission Banner */}
                        {notificationPermission !== 'granted' && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-300 dark:border-purple-700 rounded-xl">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <BellRing className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {t('news.enableNotifications') || 'Enable Push Notifications'}
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {t('news.notificationDesc') || 'Get instant alerts when price conditions are met'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={requestNotifications}
                                        className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all whitespace-nowrap"
                                    >
                                        {t('news.enable') || 'Enable'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Create Alert Button */}
                        <button
                            onClick={() => setShowCreateAlert(true)}
                            className="mb-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            {t('news.createAlert')}
                        </button>

                        {/* Create Alert Modal */}
                        {showCreateAlert && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {t('news.newAlert')}
                                        </h2>
                                        <button
                                            onClick={() => setShowCreateAlert(false)}
                                            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Coin Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                {t('news.selectCoin')}
                                            </label>
                                            <select
                                                value={newAlert.coinId}
                                                onChange={(e) => setNewAlert({...newAlert, coinId: e.target.value})}
                                                className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="">{t('news.chooseCoin')}</option>
                                                {availableCoins.map(coin => (
                                                    <option key={coin.id} value={coin.id}>
                                                        {language === 'ar' ? coin.name : (coin.name_en || coin.name)} - {coin.current_price.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Alert Type */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                {t('news.alertType')}
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setNewAlert({...newAlert, type: 'above'})}
                                                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                                                        newAlert.type === 'above'
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                    }`}
                                                >
                                                    {t('news.above')}
                                                </button>
                                                <button
                                                    onClick={() => setNewAlert({...newAlert, type: 'below'})}
                                                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                                                        newAlert.type === 'below'
                                                            ? 'bg-red-500 text-white'
                                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                    }`}
                                                >
                                                    {t('news.below')}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Target Price */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                {t('news.targetPrice')}
                                            </label>
                                            <input
                                                type="number"
                                                value={newAlert.targetPrice}
                                                onChange={(e) => setNewAlert({...newAlert, targetPrice: e.target.value})}
                                                placeholder={t('news.enterPrice')}
                                                className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>

                                        {/* Create Button */}
                                        <button
                                            onClick={handleCreateAlert}
                                            disabled={!newAlert.coinId || !newAlert.targetPrice}
                                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {t('news.createAlertBtn')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Alerts List */}
                        <div className="space-y-4">
                            {alerts.length === 0 ? (
                                <div className="text-center py-12 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <Bell className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                    <p className="text-slate-600 dark:text-slate-400">
                                        {t('news.noAlerts')}
                                    </p>
                                </div>
                            ) : (
                                alerts.map(alert => {
                                    const coin = coins?.find(c => c.id === alert.coinId)
                                    const isTriggered = alert.type === 'above' 
                                        ? (coin?.current_price || 0) >= alert.targetPrice
                                        : (coin?.current_price || 0) <= alert.targetPrice

                                    return (
                                        <div 
                                            key={alert.id}
                                            className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border transition-all ${
                                                isTriggered && alert.active
                                                    ? 'border-green-500 shadow-lg shadow-green-500/20'
                                                    : 'border-slate-200 dark:border-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <img 
                                                        src={coin?.image} 
                                                        alt="" 
                                                        className="w-12 h-12 rounded-full"
                                                    />
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                            {alert.coinName}
                                                        </h3>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                                            {t(`news.alert${alert.type === 'above' ? 'Above' : 'Below'}`)} {alert.targetPrice.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {isTriggered && alert.active && (
                                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                            {t('news.triggered')}
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => toggleAlert(alert.id)}
                                                        className={`p-2 rounded-lg transition-all ${
                                                            alert.active
                                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                                        }`}
                                                    >
                                                        <Bell className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAlert(alert.id)}
                                                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Current Price */}
                                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                                        {t('news.currentPrice')}
                                                    </span>
                                                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                                                        {(coin?.current_price || 0).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })} {language === 'ar' ? 'ج.م' : 'EGP'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default NewsAlerts
