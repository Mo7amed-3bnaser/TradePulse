import { Activity, Star, Home, Calculator, TrendingUp, Newspaper, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from '../common/ThemeToggle'
import LanguageToggle from '../common/LanguageToggle'
import SearchBar from '../search/SearchBar'
import useWatchlistStore from '../../store/useWatchlistStore'

const Navbar = ({ onSearch }) => {
    const { t } = useTranslation()
    const { watchlist } = useWatchlistStore()
    const location = useLocation()

    const isActive = (path) => location.pathname === path

    const navLinks = [
        { path: '/', icon: Home, label: t('navbar.home') },
        { path: '/portfolio', icon: Wallet, label: t('navbar.portfolio') },
        { path: '/calculator', icon: Calculator, label: t('navbar.calculator') },
        { path: '/charts', icon: TrendingUp, label: t('navbar.charts') },
        { path: '/news', icon: Newspaper, label: t('navbar.news') }
    ]

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col gap-4">
                    {/* Top Row */}
                    <div className="flex items-center justify-between gap-4">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div className="hidden lg:block">
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Trade<span className="text-purple-500">Pulse</span>
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {t('navbar.realTimeTracker')}
                                </p>
                            </div>
                        </Link>

                        {/* Search Bar - Desktop - Only show on home page */}
                        {location.pathname === '/' && (
                            <div className="hidden md:block flex-1 max-w-xl ltr:ml-auto ltr:mr-8 rtl:mr-auto rtl:ml-8">
                                <SearchBar onSearch={onSearch} placeholder={t('navbar.searchPlaceholder')} />
                            </div>
                        )}

                        {/* Navigation Links - Desktop */}
                        <div className="hidden lg:flex items-center gap-2 ltr:ml-auto rtl:mr-auto">
                            {navLinks.map(({ path, icon: Icon, label }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                        isActive(path)
                                            ? 'bg-purple-500 text-white shadow-lg'
                                            : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-purple-500 dark:hover:border-purple-400 border border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm">{label}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Watchlist Counter & Theme Toggle & Language Toggle */}
                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <button className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-200 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-purple-500 dark:text-purple-400" fill="currentColor" />
                                    {watchlist.length > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-purple-500 dark:bg-purple-400 text-white text-xs font-bold">
                                            {watchlist.length}
                                        </span>
                                    )}
                                </button>
                                {/* Tooltip */}
                                <div className="absolute top-full mt-2 ltr:right-0 rtl:left-0 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                    {t('navbar.watchlist')} ({watchlist.length})
                                </div>
                            </div>
                            <ThemeToggle />
                            <LanguageToggle />
                        </div>
                    </div>

                    {/* Search Bar - Mobile - Only show on home page */}
                    {location.pathname === '/' && (
                        <div className="md:hidden w-full">
                            <SearchBar onSearch={onSearch} placeholder={t('navbar.searchPlaceholder')} />
                        </div>
                    )}

                    {/* Navigation Links - Mobile */}
                    <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2">
                        {navLinks.map(({ path, icon: Icon, label }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                                    isActive(path)
                                        ? 'bg-purple-500 text-white shadow-lg'
                                        : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-purple-500 dark:hover:border-purple-400 border border-slate-200 dark:border-slate-700'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm">{label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
