'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { Plus_Jakarta_Sans } from 'next/font/google'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

type Message = {
  role: 'user' | 'assistant'
  text: string
}

export default function StepChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState<Message[]>([
    { role: 'assistant', text: 'Hi! I am Step, your Solecraft order assistant. How can I help you today?' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [history, isOpen])

  const handleSend = async () => {
    if (!message.trim() || isLoading) return
    const currentMessage = message
    setMessage('')
    const newHistory = [...history, { role: 'user' as const, text: currentMessage }]
    setHistory(newHistory)
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentMessage, history: newHistory })
      })
      const data = await res.json()
      if (res.ok) {
        setHistory([...newHistory, { role: 'assistant', text: data.reply }])
      } else {
        setHistory([...newHistory, { role: 'assistant', text: data.error || 'Step is having trouble right now.' }])
      }
    } catch (err) {
      setHistory([...newHistory, { role: 'assistant', text: 'Step is having trouble right now. Please try again later.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${plusJakarta.className}`}>
      {/* Chat Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden mb-4 h-[500px] max-h-[calc(100vh-120px)] animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="bg-[#6C5CE7] p-4 text-white flex justify-between items-center rounded-t-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="font-semibold tracking-tight">Step Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors text-white/90 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm ${
                  msg.role === 'user' 
                    ? 'bg-[#0f0f1a] text-white rounded-br-sm shadow-sm' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm leading-relaxed'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 rounded-bl-sm shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#6C5CE7]" />
                  <span className="text-xs text-gray-500 font-medium">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex gap-2 relative">
              <input 
                type="text" 
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your orders..."
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7] transition-all pr-12"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !message.trim()}
                className="absolute right-1 top-1 bottom-1 p-2 bg-[#6C5CE7] text-white rounded-lg disabled:opacity-50 hover:bg-[#5b4cdb] transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#0f0f1a] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#6C5CE7] hover:scale-105 hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f0f1a]"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  )
}
