'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Loader2 } from 'lucide-react'
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
    { role: 'assistant', text: 'Step (Admin Mode) initialized. Ready for operations.' }
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
      const res = await fetch('/api/chat/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentMessage, history: newHistory })
      })
      const data = await res.json()
      if (res.ok) {
        setHistory([...newHistory, { role: 'assistant', text: data.reply }])
      } else {
        setHistory([...newHistory, { role: 'assistant', text: data.error || 'System error encountered.' }])
      }
    } catch (err) {
      setHistory([...newHistory, { role: 'assistant', text: 'System error encountered. Please check logs.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${plusJakarta.className}`}>
      {/* Chat Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-[#1a1a24] rounded-2xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden mb-4 h-[500px] max-h-[calc(100vh-120px)] animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="bg-[#0f0f1a] p-4 text-white flex justify-between items-center rounded-t-2xl shadow-sm border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <span className="font-semibold tracking-tight text-gray-200">Step <span className="text-xs font-normal text-blue-400 border border-blue-400/30 bg-blue-400/10 px-1.5 py-0.5 rounded ml-1">ADMIN</span></span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-gray-800 p-1 rounded-full transition-colors text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#13131a]">
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm font-medium ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-sm shadow-sm' 
                    : 'bg-[#1a1a24] text-gray-300 border border-gray-800 rounded-bl-sm shadow-sm leading-relaxed'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-[#1a1a24] border border-gray-800 rounded-bl-sm shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-xs text-gray-500 font-medium tracking-wider uppercase">Processing...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-3 bg-[#1a1a24] border-t border-gray-800">
            <div className="flex gap-2 relative">
              <input 
                type="text" 
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Query system..."
                className="flex-1 px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all pr-12 placeholder-gray-600"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !message.trim()}
                className="absolute right-1 top-1 bottom-1 p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-500 transition-colors"
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
        className="w-14 h-14 bg-[#1a1a24] border-2 border-gray-800 text-blue-400 rounded-full flex items-center justify-center shadow-lg hover:border-blue-500 hover:text-blue-300 hover:scale-105 hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f0f1a] focus:ring-blue-500"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>
    </div>
  )
}
