import { useState, useRef, useEffect } from 'react'
import { sendChat } from '../api.js'
import styles from './ChatTab.module.css'

const HINTS = [
  'What are my payment obligations?',
  'What happens if I terminate early?',
  'What are the penalty clauses?',
  'Who owns the IP?',
  'Summarize key risks for me',
]

export default function ChatTab({ contractText }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I've analyzed your contract. Ask me anything about it — clauses, risks, obligations, or what happens in specific scenarios." }
  ])
  const [input, setInput]   = useState('')
  const [busy, setBusy]     = useState(false)
  const bottomRef           = useRef()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(text) {
    const msg = (text ?? input).trim()
    if (!msg || busy) return
    setInput('')
    const next = [...messages, { role: 'user', content: msg }]
    setMessages(next)
    setBusy(true)
    try {
      const history = next.slice(1).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
      const { data } = await sendChat(contractText, msg, history.slice(0, -1))
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + (e.response?.data?.detail || e.message) }])
    }
    setBusy(false)
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>AI Contract Chatbot</h2>
      <p className={styles.sub}>Ask any question about the contract in plain language.</p>

      <div className={styles.chatBox}>
        <div className={styles.messages}>
          {messages.map((m, i) => (
            <div key={i} className={`${styles.msg} ${m.role === 'user' ? styles.user : styles.ai}`}>
              <div className={styles.bubble}>{m.content}</div>
            </div>
          ))}
          {busy && (
            <div className={`${styles.msg} ${styles.ai}`}>
              <div className={styles.bubble}>
                <span className={styles.typing}><span/><span/><span/></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className={styles.inputRow}>
          <input
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about a clause, obligation, or scenario…"
            disabled={busy}
          />
          <button className={styles.sendBtn} onClick={() => send()} disabled={busy || !input.trim()}>
            Send
          </button>
        </div>
      </div>

      <div className={styles.hints}>
        {HINTS.map(h => (
          <button key={h} className={styles.hintBtn} onClick={() => send(h)} disabled={busy}>{h}</button>
        ))}
      </div>
    </div>
  )
}
