import { Sun, Moon } from 'lucide-react'
import useThemeStore from '../../store/useThemeStore'

const ThemeToggle = () => {
    const { theme, toggleTheme } = useThemeStore()

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-lg bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700 hover:bg-white/20 dark:hover:bg-slate-700/50 transition-all duration-300 group"
            aria-label="Toggle theme"
        >
            <div className="relative w-6 h-6">
                {/* Sun Icon */}
                <Sun
                    className={`absolute inset-0 w-6 h-6 text-yellow-500 transition-all duration-300 ${theme === 'light'
                            ? 'opacity-100 rotate-0 scale-100'
                            : 'opacity-0 rotate-90 scale-0'
                        }`}
                />

                {/* Moon Icon */}
                <Moon
                    className={`absolute inset-0 w-6 h-6 text-blue-400 transition-all duration-300 ${theme === 'dark'
                            ? 'opacity-100 rotate-0 scale-100'
                            : 'opacity-0 -rotate-90 scale-0'
                        }`}
                />
            </div>
        </button>
    )
}

export default ThemeToggle
