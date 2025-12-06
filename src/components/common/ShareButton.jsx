import { Share2, Twitter, Facebook, Link as LinkIcon, MessageCircle, Check } from 'lucide-react'
import { useState } from 'react'
import useLanguageStore from '../../store/useLanguageStore'

const ShareButton = ({ title, text, url }) => {
    const { language } = useLanguageStore()
    const [copied, setCopied] = useState(false)
    const [showMenu, setShowMenu] = useState(false)

    const shareData = {
        title,
        text,
        url: url || window.location.href
    }

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err)
                }
            }
        } else {
            setShowMenu(true)
        }
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareData.url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const shareToTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`
        window.open(twitterUrl, '_blank', 'width=550,height=420')
    }

    const shareToFacebook = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`
        window.open(facebookUrl, '_blank', 'width=550,height=420')
    }

    const shareToWhatsApp = () => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`
        window.open(whatsappUrl, '_blank')
    }

    return (
        <div className="relative">
            <button
                onClick={handleNativeShare}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
                <Share2 className="w-4 h-4" />
                {language === 'ar' ? 'مشاركة' : 'Share'}
            </button>

            {showMenu && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute top-full mt-2 ltr:right-0 rtl:left-0 z-50 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2">
                        <button
                            onClick={() => { shareToTwitter(); setShowMenu(false); }}
                            className="flex items-center gap-3 w-full px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                            <span className="text-slate-700 dark:text-slate-300">Twitter</span>
                        </button>

                        <button
                            onClick={() => { shareToFacebook(); setShowMenu(false); }}
                            className="flex items-center gap-3 w-full px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Facebook className="w-5 h-5 text-[#1877F2]" />
                            <span className="text-slate-700 dark:text-slate-300">Facebook</span>
                        </button>

                        <button
                            onClick={() => { shareToWhatsApp(); setShowMenu(false); }}
                            className="flex items-center gap-3 w-full px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <MessageCircle className="w-5 h-5 text-[#25D366]" />
                            <span className="text-slate-700 dark:text-slate-300">WhatsApp</span>
                        </button>

                        <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />

                        <button
                            onClick={() => { copyToClipboard(); }}
                            className="flex items-center gap-3 w-full px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span className="text-green-500">
                                        {language === 'ar' ? 'تم النسخ!' : 'Copied!'}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <LinkIcon className="w-5 h-5 text-slate-500" />
                                    <span className="text-slate-700 dark:text-slate-300">
                                        {language === 'ar' ? 'نسخ الرابط' : 'Copy Link'}
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default ShareButton
