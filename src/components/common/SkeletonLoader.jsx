const SkeletonCard = () => {
    return (
        <div className="p-5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 dark:via-slate-700/60 to-transparent"></div>
            
            {/* Header with image and text */}
            <div className="flex items-center gap-3 mb-4">
                {/* Circular image skeleton */}
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                
                <div className="flex-1">
                    {/* Name skeleton */}
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2 animate-pulse"></div>
                    {/* Symbol skeleton */}
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse" style={{animationDelay: '0.1s'}}></div>
                </div>

                {/* Star button skeleton */}
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" style={{animationDelay: '0.2s'}}></div>
            </div>

            {/* Price skeleton */}
            <div className="mb-3">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse" style={{animationDelay: '0.3s'}}></div>
            </div>

            {/* Price change and rank */}
            <div className="flex items-center justify-between">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-20 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-8 animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>

            {/* Sparkline skeleton */}
            <div className="mt-3 h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" style={{animationDelay: '0.6s'}}></div>
        </div>
    )
}

const SkeletonLoader = ({ count = 12 }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    )
}

export default SkeletonLoader
