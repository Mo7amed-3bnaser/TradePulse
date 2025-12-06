import { Languages } from 'lucide-react'
import useLanguageStore from '../../store/useLanguageStore'

const LanguageToggle = () => {
    const { language, toggleLanguage } = useLanguageStore()

    return (
        <button
            onClick={toggleLanguage}
            className="relative p-2 rounded-lg bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700 hover:bg-white/20 dark:hover:bg-slate-700/50 transition-all duration-300 group"
            aria-label="Toggle language"
            title={language === 'en' ? 'العربية' : 'English'}
        >
            <div className="relative w-6 h-6 flex items-center justify-center">
                {/* Language Icon with text indicator */}
                <Languages className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                
                {/* Language indicator badge */}
                <span className="absolute -bottom-1 -right-1 text-[8px] font-bold text-purple-600 dark:text-purple-300 bg-white dark:bg-slate-800 rounded px-0.5">
                    {language === 'en' ? 'EN' : 'ع'}
                </span>
            </div>
        </button>
    )
}

export default LanguageToggle
