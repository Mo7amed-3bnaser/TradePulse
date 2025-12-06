import { Calculator as CalcIcon, Scale, DollarSign, TrendingUp, ArrowLeft, Gem } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import useLanguageStore from '../store/useLanguageStore'
import useCoinPrices from '../hooks/useCoinPrices'

const Calculator = () => {
    const { t } = useTranslation()
    const { language } = useLanguageStore()
    const { data: coins } = useCoinPrices(100)
    
    const [activeTab, setActiveTab] = useState('gold')
    
    // Gold Calculator State
    const [goldKarat, setGoldKarat] = useState(21)
    const [goldWeight, setGoldWeight] = useState('')
    const [goldMakingCharges, setGoldMakingCharges] = useState(0)
    
    // Currency Converter State
    const [fromCurrency, setFromCurrency] = useState('USD')
    const [toCurrency, setToCurrency] = useState('EGP')
    const [amount, setAmount] = useState('')
    
    // Unit Converter State
    const [fromUnit, setFromUnit] = useState('gram')
    const [toUnit, setToUnit] = useState('ounce')
    const [unitAmount, setUnitAmount] = useState('')

    // Get gold prices
    const gold24k = coins?.find(c => c.id === 'gold-24k')?.price_per_gram || 0
    const gold21k = coins?.find(c => c.id === 'gold-21k')?.price_per_gram || 0
    const gold18k = coins?.find(c => c.id === 'gold-18k')?.price_per_gram || 0
    
    // Calculate gold price
    const getGoldPrice = () => {
        if (!goldWeight || goldWeight <= 0) return 0
        let pricePerGram = 0
        if (goldKarat === 24) pricePerGram = gold24k
        else if (goldKarat === 21) pricePerGram = gold21k
        else if (goldKarat === 18) pricePerGram = gold18k
        
        const basePrice = pricePerGram * parseFloat(goldWeight)
        const makingCharges = (basePrice * goldMakingCharges) / 100
        return basePrice + makingCharges
    }
    
    // Currency conversion (simplified - in real app use live rates)
    const exchangeRates = {
        USD: 1,
        EGP: 47.7,
        EUR: 0.92,
        GBP: 0.79,
        SAR: 3.75
    }
    
    const convertCurrency = () => {
        if (!amount || amount <= 0) return 0
        const amountInUSD = parseFloat(amount) / exchangeRates[fromCurrency]
        return amountInUSD * exchangeRates[toCurrency]
    }
    
    // Unit conversion
    const unitConversions = {
        gram: 1,
        ounce: 31.1035,
        kilogram: 1000,
        pound: 453.592,
        tola: 11.664
    }
    
    const convertUnit = () => {
        if (!unitAmount || unitAmount <= 0) return 0
        const amountInGrams = parseFloat(unitAmount) * unitConversions[fromUnit]
        return amountInGrams / unitConversions[toUnit]
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] py-8">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 text-slate-700 dark:text-slate-300 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('coinDetails.backToHome')}</span>
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <CalcIcon className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                            {t('calculator.title')}
                        </h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        {t('calculator.subtitle')}
                    </p>
                    
                    {/* Jewelry Calculator Link */}
                    <Link
                        to="/jewelry-calculator"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        <Gem className="w-5 h-5" />
                        {language === 'ar' ? 'حاسبة المجوهرات المتقدمة' : 'Advanced Jewelry Calculator'}
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8 overflow-x-auto">
                    <div className="inline-flex items-center gap-2 p-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setActiveTab('gold')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                                activeTab === 'gold'
                                    ? 'bg-purple-500 text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                            }`}
                        >
                            <Scale className="w-4 h-4" />
                            {t('calculator.goldCalculator')}
                        </button>
                        <button
                            onClick={() => setActiveTab('currency')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                                activeTab === 'currency'
                                    ? 'bg-purple-500 text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                            }`}
                        >
                            <DollarSign className="w-4 h-4" />
                            {t('calculator.currencyConverter')}
                        </button>
                        <button
                            onClick={() => setActiveTab('unit')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                                activeTab === 'unit'
                                    ? 'bg-purple-500 text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                            }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            {t('calculator.unitConverter')}
                        </button>
                    </div>
                </div>

                {/* Gold Calculator */}
                {activeTab === 'gold' && (
                    <div className="max-w-2xl mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 animate-fadeIn">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            {t('calculator.goldCalculator')}
                        </h2>
                        
                        <div className="space-y-6">
                            {/* Karat Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {t('calculator.selectKarat')}
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[24, 21, 18].map(k => (
                                        <button
                                            key={k}
                                            onClick={() => setGoldKarat(k)}
                                            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                                                goldKarat === k
                                                    ? 'bg-yellow-500 text-white shadow-lg scale-105'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:scale-105'
                                            }`}
                                        >
                                            {k}K
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Weight Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {t('calculator.weightInGrams')}
                                </label>
                                <input
                                    type="number"
                                    value={goldWeight}
                                    onChange={(e) => setGoldWeight(e.target.value)}
                                    placeholder="0"
                                    className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Making Charges */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {t('calculator.makingCharges')} (%)
                                </label>
                                <input
                                    type="number"
                                    value={goldMakingCharges}
                                    onChange={(e) => setGoldMakingCharges(parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Result */}
                            <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                    {t('calculator.totalPrice')}
                                </p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    {getGoldPrice().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })} {language === 'ar' ? 'ج.م' : 'EGP'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Currency Converter */}
                {activeTab === 'currency' && (
                    <div className="max-w-2xl mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 animate-fadeIn">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            {t('calculator.currencyConverter')}
                        </h2>
                        
                        <div className="space-y-6">
                            {/* From Currency */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {t('calculator.from')}
                                </label>
                                <div className="flex gap-3">
                                    <select
                                        value={fromCurrency}
                                        onChange={(e) => setFromCurrency(e.target.value)}
                                        className="w-32 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                    >
                                        {Object.keys(exchangeRates).map(curr => (
                                            <option key={curr} value={curr}>{curr}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0"
                                        className="flex-1 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* To Currency */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {t('calculator.to')}
                                </label>
                                <div className="flex gap-3">
                                    <select
                                        value={toCurrency}
                                        onChange={(e) => setToCurrency(e.target.value)}
                                        className="w-32 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                    >
                                        {Object.keys(exchangeRates).map(curr => (
                                            <option key={curr} value={curr}>{curr}</option>
                                        ))}
                                    </select>
                                    <div className="flex-1 px-4 py-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white font-bold text-lg flex items-center justify-center">
                                        {convertCurrency().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Unit Converter */}
                {activeTab === 'unit' && (
                    <div className="max-w-2xl mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 animate-fadeIn">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            {t('calculator.unitConverter')}
                        </h2>
                        
                        <div className="space-y-6">
                            {/* From Unit */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {t('calculator.from')}
                                </label>
                                <div className="flex gap-3">
                                    <select
                                        value={fromUnit}
                                        onChange={(e) => setFromUnit(e.target.value)}
                                        className="w-40 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 text-sm"
                                    >
                                        {Object.keys(unitConversions).map(unit => (
                                            <option key={unit} value={unit}>{t(`calculator.${unit}`)}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        value={unitAmount}
                                        onChange={(e) => setUnitAmount(e.target.value)}
                                        placeholder="0"
                                        className="flex-1 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* To Unit */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {t('calculator.to')}
                                </label>
                                <div className="flex gap-3">
                                    <select
                                        value={toUnit}
                                        onChange={(e) => setToUnit(e.target.value)}
                                        className="w-40 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 text-sm"
                                    >
                                        {Object.keys(unitConversions).map(unit => (
                                            <option key={unit} value={unit}>{t(`calculator.${unit}`)}</option>
                                        ))}
                                    </select>
                                    <div className="flex-1 px-4 py-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white font-bold text-lg flex items-center justify-center">
                                        {convertUnit().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                            minimumFractionDigits: 4,
                                            maximumFractionDigits: 4
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Calculator
