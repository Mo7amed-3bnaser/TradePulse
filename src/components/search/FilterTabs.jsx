import { LayoutGrid, Bitcoin, TrendingUp, Star, Coins } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const FilterTabs = ({ activeTab, onTabChange }) => {
    const { t } = useTranslation()

    const TABS = [
        { id: 'all', labelKey: 'filters.all', icon: LayoutGrid },
        { id: 'metals', labelKey: 'filters.metals', icon: Coins },
        { id: 'crypto', labelKey: 'filters.crypto', icon: Bitcoin },
        { id: 'trending', labelKey: 'filters.trending', icon: TrendingUp },
        { id: 'watchlist', labelKey: 'filters.watchlist', icon: Star },
    ]

    return (
        <div className="inline-flex items-center gap-2 p-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm">
            {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${isActive
                                ? 'bg-purple-500 dark:bg-purple-600 text-white shadow-md'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                            }
            `}
                    >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{t(tab.labelKey)}</span>
                    </button>
                )
            })}
        </div>
    )
}

export default FilterTabs
