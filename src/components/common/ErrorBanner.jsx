import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const ErrorBanner = ({ message, onRetry }) => {
    const { t } = useTranslation()
    const defaultMessage = message || t('errors.somethingWentWrong')
    const isNetworkError = defaultMessage.includes('الاتصال') || defaultMessage.includes('الإنترنت') || defaultMessage.includes('connection') || defaultMessage.includes('network')
    
    return (
        <div className="w-full max-w-3xl mx-auto my-8 animate-fadeIn">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Error Icon */}
                    <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center animate-pulse">
                            {isNetworkError ? (
                                <WifiOff className="w-7 h-7 text-red-600 dark:text-red-400" />
                            ) : (
                                <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
                            )}
                        </div>
                    </div>

                    {/* Error Content */}
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">
                            {isNetworkError ? t('errors.connectionProblem') : t('errors.error')}
                        </h3>
                        <p className="text-red-700 dark:text-red-400 text-sm mb-3">
                            {defaultMessage}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                            <Wifi className="w-3.5 h-3.5" />
                            <span>{t('errors.checkConnection')}</span>
                        </div>
                    </div>

                    {/* Retry Button */}
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="flex-shrink-0 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-semibold text-sm transition-all duration-200 flex items-center gap-2 group shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                        >
                            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                            <span>{t('errors.tryAgain')}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ErrorBanner
