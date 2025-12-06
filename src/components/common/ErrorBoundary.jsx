import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import i18n from '../../i18n'

// Helper to get translations in class component
const t = (key) => i18n.t(key)

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
        this.setState({
            error,
            errorInfo,
        })
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
        window.location.reload()
    }

    handleGoHome = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
        window.location.href = '/'
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-3">
                            {t('errors.unexpectedError')}
                        </h1>

                        {/* Description */}
                        <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
                            {t('errors.errorDuringApp')}
                        </p>

                        {/* Error Details (Development Only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-6 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-300 dark:border-slate-600">
                                <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('errors.errorDetails')}
                                </summary>
                                <div className="text-xs text-red-600 dark:text-red-400 font-mono whitespace-pre-wrap break-all">
                                    <p className="font-bold mb-2">{this.state.error.toString()}</p>
                                    {this.state.errorInfo && (
                                        <p className="text-slate-600 dark:text-slate-400">
                                            {this.state.errorInfo.componentStack}
                                        </p>
                                    )}
                                </div>
                            </details>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                            >
                                <RefreshCw className="w-5 h-5" />
                                {t('errors.reloadPage')}
                            </button>

                            <button
                                onClick={this.handleGoHome}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200"
                            >
                                <Home className="w-5 h-5" />
                                {t('errors.backToHome')}
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
