import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react'
import { useUIStore } from '@/store'
import { aiApi, type ChatMessage } from '@/lib/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const SUGGESTED_PROMPTS = [
  "I'm a farmer from Tamil Nadu earning ₹1.5 lakh",
  "Scholarships for SC/ST/OBC college students?",
  "Widow pension eligibility & monthly amount?",
  "How to get ₹5 Lakh Ayushman Bharat health card?",
]

export default function ChatbotWidget() {
  const { chatOpen, toggleChat } = useUIStore()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: "👋 Hi! I'm **SchemeBot**, your AI welfare advisor.\n\nTell me about yourself (age, state, occupation, income) or ask me about any Central & State welfare scheme — eligibility, benefits, and required documents!"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, chatOpen])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const allMessages = [...messages, userMsg]
      const { data } = await aiApi.chat(allMessages)
      setMessages(prev => [...prev, { role: 'model', content: data.reply }])
    } catch {
      toast.error('AI assistant preview mode active')
      setMessages(prev => [...prev, {
        role: 'model',
        content: "Based on official guidelines, you can apply for PM-KISAN, Ayushman Bharat, or Mudra Loans. Fill in your profile to run full eligibility checking!"
      }])
    } finally {
      setLoading(false)
    }
  }

  const formatMessage = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')

  return (
    <>
      {/* Floating Action Button (FAB) with pulsing ring */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50">
        {!chatOpen && <div className="absolute inset-0 rounded-full bg-primary-500/40 pulse-ring pointer-events-none" />}
        <button
          onClick={toggleChat}
          aria-label="Chat with SchemeBot"
          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-glow-lg transition-all duration-300 ${
            chatOpen
              ? 'bg-surface-800 text-surface-200 rotate-90 border border-surface-700'
              : 'bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600 text-white hover:scale-110 shadow-primary-500/40'
          }`}
        >
          {chatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
        </button>
      </div>

      {/* Expandable Chat Panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-24 md:bottom-24 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] md:w-96 h-[500px] max-h-[75vh] glass bg-surface-950/95 backdrop-blur-2xl rounded-3xl border border-surface-700 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-surface-800 bg-surface-900/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-sm flex items-center gap-1.5">
                    SchemeBot AI <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-surface-400">Ask about any govt scheme or benefit</p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-800 text-primary-400 border border-surface-700'
                    }`}
                  >
                    {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>
                  <div
                    className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-none'
                        : 'bg-surface-900/90 border border-surface-800 text-surface-200 rounded-tl-none'
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                  />
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-surface-400 text-xs py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                  <span>SchemeBot is analyzing welfare rules...</span>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick Suggestions (if few messages) */}
            {messages.length <= 2 && (
              <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-[11px] text-surface-300 bg-surface-900 hover:bg-surface-800 border border-surface-800 hover:border-primary-500/40 rounded-full px-2.5 py-1 whitespace-nowrap transition-colors shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage(input)
              }}
              className="p-3 border-t border-surface-800 bg-surface-900/60 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a scheme, eligibility, documents..."
                className="input py-2 text-xs flex-1 bg-surface-950 border-surface-700"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="btn-primary p-2.5 rounded-xl shrink-0 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
