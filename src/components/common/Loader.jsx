import { useTranslation } from 'react-i18next'

const Loader = ({ message }) => {
    const { t } = useTranslation()
    const displayMessage = message || t('loader.loading')
    
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
                {/* Outer spinning ring */}
                <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-900 rounded-full"></div>

                {/* Inner spinning ring */}
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-purple-500 dark:border-t-purple-400 rounded-full animate-spin"></div>

                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 dark:bg-purple-400 rounded-full animate-pulse"></div>
            </div>

            <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm font-medium">
                {displayMessage}
            </p>
        </div>
    )
}

export default Loader
