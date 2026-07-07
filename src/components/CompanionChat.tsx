import { useState, useRef, useEffect } from 'react'
import { X, Maximize2, Minimize2, Send } from 'lucide-react'
import { useSessionCompanion, useEffectiveMessages } from '../hooks/useCompanion'
import { useProfile } from '../hooks/useProfile'
import { generateResponse } from '../lib/companionChat'

interface ChatMessage {
  id: number
  text: string
  isUser: boolean
}

interface CompanionChatProps {
  isOpen: boolean
  onClose: () => void
}

export default function CompanionChat({ isOpen, onClose }: CompanionChatProps) {
  const companion = useSessionCompanion()
  const effectiveMessages = useEffectiveMessages(companion)
  const { profile } = useProfile()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (companion?.avatar) {
      const url = URL.createObjectURL(companion.avatar)
      setAvatarUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setAvatarUrl(null)
    }
  }, [companion?.avatar])

  useEffect(() => {
    if (isOpen && messages.length === 0 && companion) {
      const name = profile?.display_name ?? 'friend'
      const greeting = effectiveMessages?.general?.[0]?.replace('{name}', name) ?? `Hey ${name}! What's on your mind?`
      setMessages([{ id: Date.now(), text: greeting, isUser: false }])
    }
  }, [isOpen, companion, effectiveMessages, profile])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  async function handleSend() {
    if (!input.trim() || !companion || !effectiveMessages) return
    const userMsg = input.trim()
    setInput('')

    setMessages(prev => [...prev, { id: Date.now(), text: userMsg, isUser: true }])
    setTyping(true)

    const delay = 500 + Math.random() * 1000
    setTimeout(async () => {
      const response = await generateResponse(userMsg, {
        name: profile?.display_name ?? 'friend',
        messages: effectiveMessages,
      })
      setMessages(prev => [...prev, { id: Date.now(), text: response, isUser: false }])
      setTyping(false)
    }, delay)
  }

  function handleClose() {
    setMessages([])
    setIsFullScreen(false)
    onClose()
  }

  if (!isOpen || !companion) return null

  return (
    <div
      className={`fixed z-50 bg-card shadow-2xl border-t border-primary-100 dark:border-primary-900 flex flex-col transition-all duration-300 ${
        isFullScreen
          ? 'inset-0 rounded-none'
          : 'left-0 right-0 bottom-0 rounded-t-2xl'
      }`}
      style={isFullScreen ? {} : { height: '55vh' }}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-primary-100 dark:border-primary-900 shrink-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm">💬</span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary">{companion.name}</p>
          <p className="text-[11px] text-muted">{typing ? 'typing...' : 'online'}</p>
        </div>
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="p-1.5 text-muted hover:text-text-primary"
        >
          {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
        <button onClick={handleClose} className="p-1.5 text-muted hover:text-text-primary">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                msg.isUser
                  ? 'bg-primary-500 text-white rounded-br-sm'
                  : 'bg-surface text-text-primary rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-surface px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 px-4 py-3 border-t border-primary-100 dark:border-primary-900">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Say something..."
            className="flex-1 rounded-xl border border-primary-100 dark:border-primary-900 bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || typing}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
