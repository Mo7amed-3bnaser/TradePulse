import { Wallet, Plus, Minus, TrendingUp, TrendingDown, Download, Trash2, ArrowLeft, PieChart, BarChart3 } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import useCoinPrices from '../hooks/useCoinPrices'
import useLanguageStore from '../store/useLanguageStore'
import usePortfolioStore from '../store/usePortfolioStore'
import ShareButton from '../components/common/ShareButton'

const Portfolio = () => {
    const { t } = useTranslation()
    const { language } = useLanguageStore()
    const { data: coins } = useCoinPrices(100)
    const { 
        transactions, 
        addTransaction, 
        removeTransaction, 
        getHoldings, 
        getTotalInvestment,
        getCurrentValue 
    } = usePortfolioStore()
    
    const [showAddModal, setShowAddModal] = useState(false)
    const [transactionType, setTransactionType] = useState('buy')
    const [selectedCoin, setSelectedCoin] = useState('')
    const [amount, setAmount] = useState('')
    const [price, setPrice] = useState('')
    const [notes, setNotes] = useState('')

    const availableCoins = coins?.filter(c => c.is_metal || ['bitcoin', 'ethereum', 'tether'].includes(c.id)) || []
    
    // Calculate portfolio metrics
    const holdings = getHoldings()
    const totalInvestment = getTotalInvestment()
    
    const currentPrices = useMemo(() => {
        const prices = {}
        coins?.forEach(coin => {
            prices[coin.id] = coin.current_price
        })
        return prices
    }, [coins])
    
    const currentValue = getCurrentValue(currentPrices)
    const totalProfitLoss = currentValue - totalInvestment
    const profitLossPercentage = totalInvestment > 0 ? ((totalProfitLoss / totalInvestment) * 100) : 0

    // Prepare data for charts
    const holdingsData = Object.entries(holdings).map(([coinId, amount]) => {
        const coin = coins?.find(c => c.id === coinId)
        const value = amount * (currentPrices[coinId] || 0)
        return {
            name: language === 'ar' ? coin?.name : (coin?.name_en || coin?.name),
            value,
            amount,
            coinId
        }
    })

    const handleAddTransaction = () => {
        if (!selectedCoin || !amount || !price) return
        
        addTransaction({
            coinId: selectedCoin,
            type: transactionType,
            amount: parseFloat(amount),
            price: parseFloat(price),
            notes
        })
        
        // Reset form
        setSelectedCoin('')
        setAmount('')
        setPrice('')
        setNotes('')
        setShowAddModal(false)
    }

    const exportToPDF = () => {
        const doc = new jsPDF()
        const isRTL = language === 'ar'
        
        // Title
        doc.setFontSize(20)
        doc.text(isRTL ? 'تقرير المحفظة' : 'Portfolio Report', 105, 15, { align: 'center' })
        
        // Date
        doc.setFontSize(10)
        doc.text(new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US'), 105, 22, { align: 'center' })
        
        // Summary Section
        doc.setFontSize(14)
        doc.text(isRTL ? 'ملخص المحفظة' : 'Portfolio Summary', 14, 35)
        
        const summaryData = [
            [isRTL ? 'إجمالي الاستثمار' : 'Total Investment', `${totalInvestment.toLocaleString()} EGP`],
            [isRTL ? 'القيمة الحالية' : 'Current Value', `${currentValue.toLocaleString()} EGP`],
            [isRTL ? 'الربح/الخسارة' : 'Profit/Loss', `${totalProfitLoss.toLocaleString()} EGP (${profitLossPercentage.toFixed(2)}%)`],
            [isRTL ? 'عدد الأصول' : 'Total Assets', Object.keys(holdings).length]
        ]
        
        doc.autoTable({
            startY: 40,
            head: [[isRTL ? 'البند' : 'Item', isRTL ? 'القيمة' : 'Value']],
            body: summaryData,
            theme: 'striped',
            headStyles: { fillColor: [139, 92, 246] }
        })
        
        // Holdings Section
        let finalY = doc.lastAutoTable.finalY + 10
        doc.setFontSize(14)
        doc.text(isRTL ? 'الممتلكات الحالية' : 'Current Holdings', 14, finalY)
        
        const holdingsTableData = holdingsData.map(h => [
            h.name,
            h.amount.toFixed(4),
            h.value.toLocaleString() + ' EGP'
        ])
        
        doc.autoTable({
            startY: finalY + 5,
            head: [[isRTL ? 'الأصل' : 'Asset', isRTL ? 'الكمية' : 'Amount', isRTL ? 'القيمة' : 'Value']],
            body: holdingsTableData,
            theme: 'striped',
            headStyles: { fillColor: [139, 92, 246] }
        })
        
        // Transactions Section
        finalY = doc.lastAutoTable.finalY + 10
        doc.setFontSize(14)
        doc.text(isRTL ? 'المعاملات الأخيرة' : 'Recent Transactions', 14, finalY)
        
        const recentTransactions = transactions.slice(-10).reverse()
        const transactionsTableData = recentTransactions.map(t => {
            const coin = coins?.find(c => c.id === t.coinId)
            return [
                new Date(t.timestamp).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US'),
                isRTL ? (t.type === 'buy' ? 'شراء' : 'بيع') : t.type.toUpperCase(),
                language === 'ar' ? coin?.name : (coin?.name_en || coin?.name),
                t.amount.toFixed(4),
                `${t.price.toLocaleString()} EGP`
            ]
        })
        
        doc.autoTable({
            startY: finalY + 5,
            head: [[
                isRTL ? 'التاريخ' : 'Date',
                isRTL ? 'النوع' : 'Type',
                isRTL ? 'الأصل' : 'Asset',
                isRTL ? 'الكمية' : 'Amount',
                isRTL ? 'السعر' : 'Price'
            ]],
            body: transactionsTableData,
            theme: 'striped',
            headStyles: { fillColor: [139, 92, 246] }
        })
        
        // Save PDF
        doc.save(`portfolio-report-${new Date().toISOString().split('T')[0]}.pdf`)
    }

    const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#f97316']

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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                            {t('portfolio.title')}
                        </h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                        {t('portfolio.subtitle')}
                    </p>
                </div>

                {/* Portfolio Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t('portfolio.totalInvestment')}</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {totalInvestment.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })} {language === 'ar' ? 'ج.م' : 'EGP'}
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t('portfolio.currentValue')}</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {currentValue.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })} {language === 'ar' ? 'ج.م' : 'EGP'}
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t('portfolio.profitLoss')}</p>
                        <p className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLoss.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })} {language === 'ar' ? 'ج.م' : 'EGP'}
                        </p>
                        <p className={`text-sm mt-1 ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {totalProfitLoss >= 0 ? '▲' : '▼'} {Math.abs(profitLossPercentage).toFixed(2)}%
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t('portfolio.totalAssets')}</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {Object.keys(holdings).length}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <button
                        onClick={() => {
                            setTransactionType('buy')
                            setShowAddModal(true)
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        {t('portfolio.addBuy')}
                    </button>

                    <button
                        onClick={() => {
                            setTransactionType('sell')
                            setShowAddModal(true)
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        <Minus className="w-5 h-5" />
                        {t('portfolio.addSell')}
                    </button>

                    <button
                        onClick={exportToPDF}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        <Download className="w-5 h-5" />
                        {t('portfolio.exportPDF')}
                    </button>

                    <ShareButton
                        title={t('portfolio.title')}
                        text={language === 'ar' 
                            ? `محفظتي: ${currentValue.toLocaleString()} ج.م (${profitLossPercentage > 0 ? '+' : ''}${profitLossPercentage.toFixed(2)}%)`
                            : `My Portfolio: ${currentValue.toLocaleString()} EGP (${profitLossPercentage > 0 ? '+' : ''}${profitLossPercentage.toFixed(2)}%)`
                        }
                    />
                </div>

                {/* Charts Section */}
                {holdingsData.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Pie Chart */}
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <PieChart className="w-5 h-5" />
                                {t('portfolio.assetDistribution')}
                            </h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <RePieChart>
                                    <Pie
                                        data={holdingsData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) => `${entry.name}: ${((entry.value / currentValue) * 100).toFixed(1)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {holdingsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Bar Chart */}
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                {t('portfolio.holdingsValue')}
                            </h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={holdingsData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Holdings List */}
                {holdingsData.length > 0 && (
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-8">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('portfolio.currentHoldings')}</h2>
                        <div className="space-y-4">
                            {holdingsData.map((holding) => {
                                const coin = coins?.find(c => c.id === holding.coinId)
                                const value = holding.value
                                const percentage = (value / currentValue) * 100
                                
                                return (
                                    <div key={holding.coinId} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                        <div className="flex items-center gap-4">
                                            <img src={coin?.image} alt="" className="w-12 h-12 rounded-full" />
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white">{holding.name}</h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {holding.amount.toFixed(4)} {coin?.symbol?.toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 dark:text-white">
                                                {value.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })} {language === 'ar' ? 'ج.م' : 'EGP'}
                                            </p>
                                            <p className="text-sm text-purple-600 dark:text-purple-400">
                                                {percentage.toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Transaction History */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('portfolio.transactionHistory')}</h2>
                    {transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <Wallet className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                            <p className="text-slate-600 dark:text-slate-400">{t('portfolio.noTransactions')}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {[...transactions].reverse().map((transaction) => {
                                const coin = coins?.find(c => c.id === transaction.coinId)
                                const date = new Date(transaction.timestamp)
                                
                                return (
                                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                        <div className="flex items-center gap-4">
                                            {transaction.type === 'buy' ? (
                                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                    <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                                    <Minus className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                </div>
                                            )}
                                            <img src={coin?.image} alt="" className="w-10 h-10 rounded-full" />
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">
                                                    {transaction.type === 'buy' ? t('portfolio.bought') : t('portfolio.sold')} {transaction.amount.toFixed(4)} {coin?.symbol?.toUpperCase()}
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')} • {transaction.price.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className={`font-bold ${transaction.type === 'buy' ? 'text-red-600' : 'text-green-600'}`}>
                                                {transaction.type === 'buy' ? '-' : '+'}{(transaction.amount * transaction.price).toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}
                                            </p>
                                            <button
                                                onClick={() => removeTransaction(transaction.id)}
                                                className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Add Transaction Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                {transactionType === 'buy' ? t('portfolio.addBuy') : t('portfolio.addSell')}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {t('portfolio.selectAsset')}
                                    </label>
                                    <select
                                        value={selectedCoin}
                                        onChange={(e) => {
                                            setSelectedCoin(e.target.value)
                                            const coin = availableCoins.find(c => c.id === e.target.value)
                                            if (coin) setPrice(coin.current_price.toString())
                                        }}
                                        className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">{t('portfolio.chooseAsset')}</option>
                                        {availableCoins.map(coin => (
                                            <option key={coin.id} value={coin.id}>
                                                {language === 'ar' ? coin.name : (coin.name_en || coin.name)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {t('portfolio.amount')}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.0000"
                                        className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {t('portfolio.pricePerUnit')}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {t('portfolio.notes')} ({t('portfolio.optional')})
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder={t('portfolio.notesPlaceholder')}
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {amount && price && (
                                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t('portfolio.totalAmount')}</p>
                                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                            {(parseFloat(amount) * parseFloat(price)).toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAddTransaction}
                                        disabled={!selectedCoin || !amount || !price}
                                        className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                                            transactionType === 'buy'
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                                : 'bg-gradient-to-r from-red-500 to-pink-500'
                                        } text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {t('portfolio.confirm')}
                                    </button>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="px-6 py-3 rounded-xl font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                                    >
                                        {t('portfolio.cancel')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Portfolio
