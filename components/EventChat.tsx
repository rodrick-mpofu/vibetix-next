import { useState } from 'react'
import { Send, Sparkles, Loader2 } from 'lucide-react'
import type { EventParseResult } from '@/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface EventChatProps {
  onEventGenerated: (result: EventParseResult) => void
}

export function EventChat({ onEventGenerated }: EventChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m here to help you create an amazing event. Just describe your event in plain English, and I\'ll generate a custom ticketing experience for you. For example: "I\'m hosting a jazz concert for 200 people next Friday."'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/events/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: userMessage,
          conversationHistory: messages
        })
      })

      if (!response.ok) {
        throw new Error('Failed to parse event')
      }

      const result: EventParseResult = await response.json()

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Perfect! I've created "${result.eventSpec.name}" for you. I've suggested ${result.eventSpec.suggestedTiers.length} ticket tiers and designed a custom interface. Click "View Event" to see it!`
        }
      ])

      onEventGenerated(result)
    } catch (error) {
      console.error('Error parsing event:', error)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I had trouble understanding that. Could you provide more details about your event?'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Event Creator AI</h2>
              <p className="text-sm text-white/80">Describe your event, and I'll build it</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                <p className="text-sm text-slate-600">Generating your event...</p>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-slate-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your event..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Example prompts */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={() => setInput('Tech conference for 500 people with multiple workshops')}
          className="text-left px-4 py-3 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 hover:bg-white hover:shadow-lg transition-all"
        >
          <p className="text-sm font-medium text-slate-900">Tech Conference</p>
          <p className="text-xs text-slate-600">500 attendees, workshops</p>
        </button>
        <button
          onClick={() => setInput('Jazz concert for 200 people next Friday night')}
          className="text-left px-4 py-3 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 hover:bg-white hover:shadow-lg transition-all"
        >
          <p className="text-sm font-medium text-slate-900">Jazz Concert</p>
          <p className="text-xs text-slate-600">200 capacity, evening show</p>
        </button>
      </div>
    </div>
  )
}
