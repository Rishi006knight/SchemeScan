import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react'
import { useUIStore } from '@/store'
import { aiApi, type ChatMessage } from '@/lib/api'
import toast from 'react-hot-toast'

const SUGGESTED_PROMPTS = [
  "I'm a farmer from Tamil Nadu earning ₹1.5 lakh",
  "What scholarships are available for SC students?",
  "I'm a widow aged 45, what pension can I get?",
  "Housing schemes for rural poor families?",
]

export default function ChatbotWidget() {
  const { chatOpen, toggleChat } = useUIStore()
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "👋 Hi! I'm **SchemeBot**, your government scheme advisor.\n\nTell me about yourself and I'll find the best schemes for you. Or ask me anything about government benefits!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      toast.error('AI service unavailable')
      setMessages(prev => [...prev, {
        role: 'model',
        content: "I'm temporarily unavailable. Please try again later or use the Eligibility Checker directly."
      }])
    } finally {
      setLoading(false)
    }
  }

  const formatMessage = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-glow-lg transition-all duration-300 ${
          chatOpen
            ? 'bg-surface-700 rotate-0'
            : 'bg-gradient-to-br from-primary-500 to-accent-500 animate-pulse-glow hover:scale-110'
        }`}
      >
        {chatOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {/* Chat window */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[520px] card flex flex-col shadow-2xl animate-slide-up border border-primary-500/20">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-800 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-t-2xl">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white">SchemeBot</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                AI-Powered Advisor
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.role === 'user'
                    ? 'bg-primary-600'
                    : 'bg-gradient-to-br from-primary-500 to-accent-500'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-sm'
                    : 'bg-surface-800 text-surface-100 rounded-tl-sm'
                }`}
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-surface-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested prompts (only on first message) */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-xs px-2.5 py-1.5 rounded-full bg-surface-800 border border-surface-700 hover:border-primary-500/50 hover:text-primary-400 text-surface-400 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-surface-800">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder="Ask about any scheme..."
                className="input text-xs py-2 flex-1"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="btn-primary p-2.5 rounded-xl"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
