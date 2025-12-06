import { useState, useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import ErrorBoundary from './components/common/ErrorBoundary'
import Navbar from './components/layout/Navbar'
import FilterTabs from './components/search/FilterTabs'
import PriceList from './components/price/PriceList'
import LastUpdated from './components/common/LastUpdated'
import PWAInstallPrompt from './components/common/PWAInstallPrompt'
import useCoinPrices from './hooks/useCoinPrices'
import useWatchlistStore from './store/useWatchlistStore'
import Calculator from './pages/Calculator'
import JewelryCalculator from './pages/JewelryCalculator'
import HistoricalCharts from './pages/HistoricalCharts'
import NewsAlerts from './pages/NewsAlerts'
import Portfolio from './pages/Portfolio'
import CoinDetails from './pages/CoinDetails'

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})

function HomePage() {
    const { t } = useTranslation()
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 30

    const { watchlist } = useWatchlistStore()
    const { data: coins, isLoading, isError, error, refetch, dataUpdatedAt, isRefetching } = useCoinPrices(100)

    // Filter and search coins
    const filteredCoins = useMemo(() => {
        if (!coins) return []

        let filtered = coins

        // Apply filter
        if (activeFilter === 'watchlist') {
            filtered = coins.filter(coin =>
                watchlist.some(w => w.id === coin.id)
            )
        } else if (activeFilter === 'trending') {
            // Show top 20 by market cap rank
            filtered = coins.slice(0, 20)
        } else if (activeFilter === 'metals') {
            // Show only precious metals
            filtered = coins.filter(coin => coin.is_metal)
        }

        // Apply search (supports Arabic and English)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                coin =>
                    coin.name.toLowerCase().includes(query) ||
                    coin.symbol.toLowerCase().includes(query) ||
                    (coin.name_en && coin.name_en.toLowerCase().includes(query))
            )
        }

        return filtered
    }, [coins, activeFilter, searchQuery, watchlist])

    // Pagination logic
    const totalPages = Math.ceil(filteredCoins.length / itemsPerPage)
    const paginatedCoins = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredCoins.slice(startIndex, endIndex)
    }, [filteredCoins, currentPage, itemsPerPage])

    // Reset to first page when filters change
    useMemo(() => {
        setCurrentPage(1)
    }, [activeFilter, searchQuery])

    const handleCoinClick = (coin) => {
        console.log('Coin clicked:', coin)
        // You can add any action here if needed
    }

    return (
        <>
            <Navbar onSearch={setSearchQuery} />

            <main className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12 animate-fadeIn">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 px-4">
                        {t('home.title')}
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 px-4">
                        {t('home.subtitle')}
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <FilterTabs activeTab={activeFilter} onTabChange={setActiveFilter} />
                    {!isLoading && coins && (
                        <LastUpdated lastUpdated={dataUpdatedAt} isRefetching={isRefetching} />
                    )}
                </div>

                {/* Stats */}
                {!isLoading && coins && (
                    <div className="mb-6 sm:mb-8 grid grid-cols-3 gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">{t('home.totalCoins')}</p>
                            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{coins.length}</p>
                        </div>
                        <div className="p-3 sm:p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">{t('home.watchlist')}</p>
                            <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{watchlist.length}</p>
                        </div>
                        <div className="p-3 sm:p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">{t('home.results')}</p>
                            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{filteredCoins.length}</p>
                        </div>
                    </div>
                )}

                {/* Price List */}
                <PriceList
                    coins={paginatedCoins}
                    isLoading={isLoading}
                    isError={isError}
                    error={error}
                    onCoinClick={handleCoinClick}
                    onRetry={refetch}
                />

                {/* Pagination */}
                {!isLoading && filteredCoins.length > itemsPerPage && (
                    <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3 sm:gap-4">
                        {/* Page Info */}
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center">
                            {t('pagination.page')} <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> {t('pagination.of')} <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
                            <span className="mx-2">•</span>
                            <span className="hidden sm:inline">{t('pagination.showing')} {paginatedCoins.length} {t('pagination.from')} {filteredCoins.length} {t('pagination.currency')}</span>
                            <span className="sm:hidden">{paginatedCoins.length}/{filteredCoins.length}</span>
                        </p>
                        
                        {/* Pagination Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="px-2.5 sm:px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-200 text-sm"
                            >
                                {t('pagination.first')}
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 sm:px-4 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-200 text-sm"
                            >
                                {t('pagination.previous')}
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 sm:px-4 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-200 text-sm"
                            >
                                {t('pagination.next')}
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="px-2.5 sm:px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-200 text-sm"
                            >
                                {t('pagination.last')}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-16 py-8 border-t border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-slate-600 dark:text-slate-400">
                        {t('footer.developedBy')}{' '}
                        <a 
                            href="https://3bnaser.tech" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors"
                        >
                            3bnaser.tech
                        </a>
                    </p>
                </div>
            </footer>
        </>
    )
}

function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <Router>
                    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] transition-colors duration-300">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/calculator" element={<Calculator />} />
                            <Route path="/jewelry-calculator" element={<JewelryCalculator />} />
                            <Route path="/charts" element={<HistoricalCharts />} />
                            <Route path="/news" element={<NewsAlerts />} />
                            <Route path="/portfolio" element={<Portfolio />} />
                            <Route path="/coin/:id" element={<CoinDetails />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                        <PWAInstallPrompt />
                    </div>
                </Router>
            </QueryClientProvider>
        </ErrorBoundary>
    )
}

export default App
