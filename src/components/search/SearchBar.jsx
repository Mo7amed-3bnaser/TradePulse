import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const SearchBar = ({ onSearch, placeholder }) => {
    const { t } = useTranslation()
    const [query, setQuery] = useState('')
    const defaultPlaceholder = placeholder || t('navbar.searchPlaceholder')

    const handleChange = (e) => {
        const value = e.target.value
        setQuery(value)
        onSearch(value)
    }

    const handleClear = () => {
        setQuery('')
        onSearch('')
    }

    return (
        <div className="relative w-full max-w-xl">
            {/* Search Icon */}
            <div className="absolute ltr:left-4 rtl:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <Search className="w-5 h-5" />
            </div>

            {/* Input Field */}
            <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder={defaultPlaceholder}
                className="w-full ltr:pl-12 ltr:pr-12 rtl:pr-12 rtl:pl-12 py-3 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all duration-200 text-base"
                autoComplete="off"
                spellCheck="false"
            />

            {/* Clear Button */}
            {query && (
                <button
                    onClick={handleClear}
                    className="absolute ltr:right-4 rtl:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                    aria-label="Clear search"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>
    )
}

export default SearchBar
