import { Clock, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LastUpdated = ({ lastUpdated, isRefetching }) => {
    const { t } = useTranslation()
    const [timeAgo, setTimeAgo] = useState(t('lastUpdated.now'))

    useEffect(() => {
        if (!lastUpdated) return

        const updateTimeAgo = () => {
            const seconds = Math.floor((Date.now() - lastUpdated) / 1000)
            
            if (seconds < 10) {
                setTimeAgo(t('lastUpdated.now'))
            } else if (seconds < 60) {
                setTimeAgo(t('lastUpdated.secondsAgo', { count: seconds }))
            } else {
                const minutes = Math.floor(seconds / 60)
                if (minutes === 1) {
                    setTimeAgo(t('lastUpdated.minuteAgo'))
                } else {
                    setTimeAgo(t('lastUpdated.minutesAgo', { count: minutes }))
                }
            }
        }

        updateTimeAgo()
        const interval = setInterval(updateTimeAgo, 1000)

        return () => clearInterval(interval)
    }, [lastUpdated, t])

    return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-sm">
            <div className={`flex items-center gap-2 ${isRefetching ? 'text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400'}`}>
                {isRefetching ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                    <Clock className="w-4 h-4" />
                )}
                <span className="font-medium">
                    {isRefetching ? t('lastUpdated.updating') : `${t('lastUpdated.lastUpdate')} ${timeAgo}`}
                </span>
            </div>
        </div>
    )
}

export default LastUpdated
