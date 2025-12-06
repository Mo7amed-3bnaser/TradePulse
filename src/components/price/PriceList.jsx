import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import PriceCard from './PriceCard'
import SkeletonLoader from '../common/SkeletonLoader'
import ErrorBanner from '../common/ErrorBanner'

const PriceList = ({ coins, isLoading, isError, error, onCoinClick, onRetry }) => {
    const { t } = useTranslation()

    if (isLoading) {
        return <SkeletonLoader count={12} />
    }

    if (isError) {
        return (
            <ErrorBanner
                message={error?.message || t('errors.failedToLoadData')}
                onRetry={onRetry}
            />
        )
    }

    if (!coins || coins.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    {t('errors.noCoinsToShow')}
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {coins.map((coin, index) => (
                <PriceCard
                    key={coin.id}
                    coin={coin}
                    index={index}
                    onClick={() => onCoinClick && onCoinClick(coin)}
                />
                ))}
        </div>
    )
}

export default memo(PriceList)
