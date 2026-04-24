import { useState, useRef, useEffect } from 'react'
import { sendChat } from '../api.js'
import styles from './AssistantPage.module.css'

const STARTER_PROMPTS = [
  'Explain this contract to me',
  'What are the biggest risks here?',
  'Is this penalty clause normal?',
  'What does indemnification mean?',
  'How do I negotiate better terms?',
  'What should I watch out for?',
]

export default function AssistantPage({ queue }) {
  const [selectedContext, setSelectedContext] = useState(null)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm FinCore AI, your contract intelligence assistant. You can ask me anything about contracts, legal terms, or financial agreements — or load a contract from the panel on the left for specific questions.",
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function loadContext(entry) {
    setSelectedContext(entry)
    setMessages([
      {
        role: 'assistant',
        content: `✅ I've loaded **${entry.name}** as context. I can now answer specific questions about this contract's clauses, risks, obligations, and more.`,
      },
    ])
  }

  function clearContext() {
    setSelectedContext(null)
    setMessages([
      {
        role: 'assistant',
        content: "Context cleared. I'm back to general mode — ask me anything about contracts or legal terms.",
      },
    ])
  }

  async function send(text) {
    const msg = (text ?? input).trim()
    if (!msg || busy) return
    setInput('')
    const next = [...messages, { role: 'user', content: msg }]
    setMessages(next)
    setBusy(true)
    try {
      const history = next
        .slice(1)
        .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
      const contractText = selectedContext?.contractText || ''
      const { data } = await sendChat(contractText, msg, history.slice(0, -1))
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error: ' + (e.response?.data?.detail || e.message) },
      ])
    }
    setBusy(false)
  }

  return (
    <div className={styles.page}>
      {/* LEFT PANEL — Context */}
      <aside className={styles.contextPanel}>
        <div className={styles.panelTitle}>Session Context</div>

        {selectedContext ? (
          <div className={styles.loadedCtx}>
            <div className={styles.loadedBadge}>✓ Contract loaded</div>
            <div className={styles.loadedName}>{selectedContext.name}</div>
            <button className={styles.clearBtn} onClick={clearContext}>
              Clear context
            </button>
          </div>
        ) : queue && queue.length > 0 ? (
          <>
            <div className={styles.ctxHint}>
              Click a contract to load it as context for targeted questions.
            </div>
            <div className={styles.ctxList}>
              {queue.map((entry) => (
                <div
                  key={entry.id}
                  className={styles.ctxItem}
                  onClick={() => loadContext(entry)}
                >
                  <span className={styles.ctxIcon}>📄</span>
                  <div>
                    <div className={styles.ctxName}>{entry.name}</div>
                    <div className={styles.ctxScore}>
                      Risk: {entry.riskScore} · {entry.riskLevel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.ctxEmpty}>
            Analyze a contract to enable contract-specific questions, or ask general questions below.
          </div>
        )}
      </aside>

      {/* RIGHT PANEL — Chat */}
      <div className={styles.chatPanel}>
        {/* Starter prompts */}
        {messages.length <= 1 && (
          <div className={styles.starters}>
            {STARTER_PROMPTS.map((p) => (
              <button
                key={p}
                className={styles.starterChip}
                onClick={() => send(p)}
                disabled={busy}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className={styles.messages}>
          {messages.map((m, i) => (
            <div key={i} className={`${styles.msg} ${m.role === 'user' ? styles.user : styles.ai}`}>
              {m.role === 'assistant' && <div className={styles.aiAvatar}>AI</div>}
              <div className={styles.bubble}>{m.content}</div>
            </div>
          ))}
          {busy && (
            <div className={`${styles.msg} ${styles.ai}`}>
              <div className={styles.aiAvatar}>AI</div>
              <div className={styles.bubble}>
                <span className={styles.typing}>
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className={styles.inputArea}>
          <input
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder={
              selectedContext
                ? `Ask about ${selectedContext.name}…`
                : 'Ask anything about contracts, legal terms, or agreements…'
            }
            disabled={busy}
          />
          <button
            className={styles.sendBtn}
            onClick={() => send()}
            disabled={busy || !input.trim()}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}
