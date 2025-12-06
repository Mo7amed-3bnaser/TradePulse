import { Gem, ArrowLeft, Plus, Minus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import useLanguageStore from '../store/useLanguageStore'
import useCoinPrices from '../hooks/useCoinPrices'

const JewelryCalculator = () => {
    const { t } = useTranslation()
    const { language } = useLanguageStore()
    const { data: coins } = useCoinPrices(100)

    const [goldWeight, setGoldWeight] = useState('')
    const [goldKarat, setGoldKarat] = useState(21)
    const [designType, setDesignType] = useState('simple')
    const [makingCharges, setMakingCharges] = useState(10)
    const [stones, setStones] = useState([])
    
    const designTypes = {
        simple: { nameEn: 'Simple Design', nameAr: 'تصميم بسيط', charges: 10 },
        medium: { nameEn: 'Medium Design', nameAr: 'تصميم متوسط', charges: 15 },
        complex: { nameEn: 'Complex Design', nameAr: 'تصميم معقد', charges: 25 },
        luxury: { nameEn: 'Luxury Design', nameAr: 'تصميم فاخر', charges: 35 }
    }

    const stoneTypes = {
        diamond: { nameEn: 'Diamond', nameAr: 'ألماس', pricePerCarat: 15000 },
        ruby: { nameEn: 'Ruby', nameAr: 'ياقوت أحمر', pricePerCarat: 8000 },
        emerald: { nameEn: 'Emerald', nameAr: 'زمرد', pricePerCarat: 6000 },
        sapphire: { nameEn: 'ياقوت أزرق', nameAr: 'ياقوت أزرق', pricePerCarat: 5000 },
        pearl: { nameEn: 'Pearl', nameAr: 'لؤلؤ', pricePerCarat: 2000 },
        zircon: { nameEn: 'Zircon', nameAr: 'زركون', pricePerCarat: 500 }
    }

    // Get gold prices
    const gold24k = coins?.find(c => c.id === 'gold-24k')?.price_per_gram || 0
    const gold21k = coins?.find(c => c.id === 'gold-21k')?.price_per_gram || 0
    const gold18k = coins?.find(c => c.id === 'gold-18k')?.price_per_gram || 0

    const addStone = () => {
        setStones([...stones, { type: 'diamond', carats: 0.5, quantity: 1 }])
    }

    const removeStone = (index) => {
        setStones(stones.filter((_, i) => i !== index))
    }

    const updateStone = (index, field, value) => {
        const newStones = [...stones]
        newStones[index][field] = value
        setStones(newStones)
    }

    const calculateGoldPrice = () => {
        if (!goldWeight || goldWeight <= 0) return 0
        let pricePerGram = 0
        if (goldKarat === 24) pricePerGram = gold24k
        else if (goldKarat === 21) pricePerGram = gold21k
        else if (goldKarat === 18) pricePerGram = gold18k
        
        return pricePerGram * parseFloat(goldWeight)
    }

    const calculateMakingCharges = () => {
        const goldPrice = calculateGoldPrice()
        const designCharges = designTypes[designType].charges
        return (goldPrice * designCharges) / 100
    }

    const calculateStonesPrice = () => {
        return stones.reduce((total, stone) => {
            const stoneData = stoneTypes[stone.type]
            return total + (stoneData.pricePerCarat * stone.carats * stone.quantity)
        }, 0)
    }

    const getTotalPrice = () => {
        return calculateGoldPrice() + calculateMakingCharges() + calculateStonesPrice()
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <Link
                    to="/calculator"
                    className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 text-slate-700 dark:text-slate-300 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('coinDetails.backToHome')}</span>
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Gem className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                            {language === 'ar' ? 'حاسبة المجوهرات' : 'Jewelry Calculator'}
                        </h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                        {language === 'ar' 
                            ? 'احسب سعر المجوهرات بدقة مع تفاصيل التصميم والأحجار الكريمة'
                            : 'Calculate jewelry price accurately with design and gemstone details'}
                    </p>
                </div>

                {/* Calculator Form */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700">
                    {/* Gold Details */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            {language === 'ar' ? 'تفاصيل الذهب' : 'Gold Details'}
                        </h3>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {t('calculator.selectKarat')}
                                </label>
                                <select
                                    value={goldKarat}
                                    onChange={(e) => setGoldKarat(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value={24}>{language === 'ar' ? 'عيار 24' : '24 Karat'}</option>
                                    <option value={21}>{language === 'ar' ? 'عيار 21' : '21 Karat'}</option>
                                    <option value={18}>{language === 'ar' ? 'عيار 18' : '18 Karat'}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {t('calculator.weightInGrams')}
                                </label>
                                <input
                                    type="number"
                                    value={goldWeight}
                                    onChange={(e) => setGoldWeight(e.target.value)}
                                    placeholder={language === 'ar' ? 'أدخل الوزن' : 'Enter weight'}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Design Type */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            {language === 'ar' ? 'نوع التصميم' : 'Design Type'}
                        </h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(designTypes).map(([key, design]) => (
                                <button
                                    key={key}
                                    onClick={() => setDesignType(key)}
                                    className={`p-4 rounded-xl border-2 transition-all ${
                                        designType === key
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'
                                    }`}
                                >
                                    <div className="font-semibold text-slate-900 dark:text-white mb-1">
                                        {language === 'ar' ? design.nameAr : design.nameEn}
                                    </div>
                                    <div className="text-sm text-purple-600 dark:text-purple-400">
                                        {design.charges}%
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Gemstones */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {language === 'ar' ? 'الأحجار الكريمة' : 'Gemstones'}
                            </h3>
                            <button
                                onClick={addStone}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                {language === 'ar' ? 'إضافة حجر' : 'Add Stone'}
                            </button>
                        </div>

                        {stones.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                {language === 'ar' 
                                    ? 'لم تتم إضافة أحجار كريمة بعد'
                                    : 'No gemstones added yet'}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {stones.map((stone, index) => (
                                    <div key={index} className="flex gap-3 items-start p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                        <div className="flex-1 grid md:grid-cols-3 gap-3">
                                            <select
                                                value={stone.type}
                                                onChange={(e) => updateStone(index, 'type', e.target.value)}
                                                className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                            >
                                                {Object.entries(stoneTypes).map(([key, st]) => (
                                                    <option key={key} value={key}>
                                                        {language === 'ar' ? st.nameAr : st.nameEn}
                                                    </option>
                                                ))}
                                            </select>

                                            <input
                                                type="number"
                                                value={stone.carats}
                                                onChange={(e) => updateStone(index, 'carats', parseFloat(e.target.value))}
                                                placeholder={language === 'ar' ? 'القيراط' : 'Carats'}
                                                step="0.1"
                                                className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                            />

                                            <input
                                                type="number"
                                                value={stone.quantity}
                                                onChange={(e) => updateStone(index, 'quantity', parseInt(e.target.value))}
                                                placeholder={language === 'ar' ? 'العدد' : 'Quantity'}
                                                className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                            />
                                        </div>

                                        <button
                                            onClick={() => removeStone(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            {language === 'ar' ? 'تفاصيل السعر' : 'Price Breakdown'}
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 dark:text-slate-400">
                                    {language === 'ar' ? 'سعر الذهب' : 'Gold Price'}
                                </span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {calculateGoldPrice().toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 dark:text-slate-400">
                                    {language === 'ar' ? 'المصنعية' : 'Making Charges'} ({designTypes[designType].charges}%)
                                </span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {calculateMakingCharges().toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                                </span>
                            </div>

                            {stones.length > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400">
                                        {language === 'ar' ? 'الأحجار الكريمة' : 'Gemstones'}
                                    </span>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {calculateStonesPrice().toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                    {language === 'ar' ? 'الإجمالي' : 'Total Price'}
                                </span>
                                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    {getTotalPrice().toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JewelryCalculator
