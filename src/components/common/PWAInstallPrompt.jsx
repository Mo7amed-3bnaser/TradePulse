import { Download, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import useLanguageStore from '../../store/useLanguageStore'

const PWAInstallPrompt = () => {
    const { t } = useTranslation()
    const { language } = useLanguageStore()
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showPrompt, setShowPrompt] = useState(false)

    useEffect(() => {
        // Check if already installed or prompt was dismissed
        const dismissed = localStorage.getItem('pwa-prompt-dismissed')
        if (dismissed === 'true') return

        const handler = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowPrompt(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        // Check if already installed (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowPrompt(false)
        }

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        
        if (outcome === 'accepted') {
            console.log('PWA installed')
        }
        
        setDeferredPrompt(null)
        setShowPrompt(false)
    }

    const handleDismiss = () => {
        localStorage.setItem('pwa-prompt-dismissed', 'true')
        setShowPrompt(false)
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-4 ltr:left-4 rtl:right-4 z-50 max-w-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                        <Download className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                            {language === 'ar' ? 'ثبّت التطبيق' : 'Install App'}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            {language === 'ar' 
                                ? 'أضف TradePulse إلى الشاشة الرئيسية للوصول السريع'
                                : 'Add TradePulse to your home screen for quick access'}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleInstall}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
                            >
                                {language === 'ar' ? 'تثبيت' : 'Install'}
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                            >
                                {language === 'ar' ? 'لاحقاً' : 'Later'}
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PWAInstallPrompt
