import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../utils/api";

const styles = `
.chat-section {
  margin-top: 28px;
}
.chat-section-label {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--muted); letter-spacing: 2px; text-transform: uppercase;
  margin-bottom: 16px;
}
.chat-wrap {
  display: flex; flex-direction: column;
  border: 1px solid var(--border2); overflow: hidden;
}
.chat-header {
  padding: 14px 20px; background: var(--surface2);
  border-bottom: 1px solid var(--border);
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  letter-spacing: 2px; text-transform: uppercase; color: var(--accent);
  display: flex; align-items: center; gap: 8px;
}
.chat-header::before {
  content: ''; width: 6px; height: 6px;
  background: var(--accent); border-radius: 50%;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
}
.chat-messages {
  padding: 20px; display: flex; flex-direction: column; gap: 14px;
  min-height: 280px; max-height: 360px; overflow-y: auto;
  background: var(--bg);
}
.chat-msg { display: flex; flex-direction: column; gap: 4px; }
.chat-msg.user { align-items: flex-end; }
.chat-msg.ai   { align-items: flex-start; }
.chat-bubble {
  padding: 10px 14px; font-size: 13px; line-height: 1.65;
  max-width: 88%; font-family: 'JetBrains Mono', monospace;
}
.chat-msg.user .chat-bubble {
  background: rgba(0,212,255,0.12);
  border: 1px solid rgba(0,212,255,0.3);
  color: var(--text);
}
.chat-msg.ai .chat-bubble {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: #b0bec5;
}
.chat-hints {
  display: flex; flex-wrap: wrap; gap: 8px;
  padding: 12px 20px; background: var(--surface);
  border-top: 1px solid var(--border);
}
.chat-hint {
  padding: 5px 12px; font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  border: 1px solid var(--border2); background: var(--bg);
  color: var(--muted); cursor: pointer; transition: all .15s;
}
.chat-hint:hover:not(:disabled) {
  border-color: var(--accent); color: var(--accent);
}
.chat-hint:disabled { opacity: 0.4; cursor: not-allowed; }
.chat-input-row {
  display: flex; border-top: 1px solid var(--border2);
}
.chat-input {
  flex: 1; padding: 14px 16px;
  background: var(--surface); border: none; outline: none;
  color: var(--text); font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}
.chat-input::placeholder { color: var(--muted); }
.chat-input:disabled { opacity: 0.5; }
.chat-send {
  padding: 14px 24px; background: var(--accent); color: #000;
  border: none; font-family: 'Syne', sans-serif;
  font-size: 12px; font-weight: 800; cursor: pointer;
  letter-spacing: 0.5px; transition: opacity .15s;
  white-space: nowrap;
}
.chat-send:disabled { opacity: 0.35; cursor: not-allowed; }
.typing {
  display: flex; gap: 5px; align-items: center; padding: 2px 0;
}
.typing span {
  width: 6px; height: 6px; background: var(--accent);
  border-radius: 50%; animation: bounce .8s infinite;
}
.typing span:nth-child(2) { animation-delay: .15s; }
.typing span:nth-child(3) { animation-delay: .3s; }
@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}
`;

const HINTS = [
  "What are my payment obligations?",
  "What happens if I terminate early?",
  "Who owns the IP?",
  "What are the main risks?",
  "Summarize the key penalties",
];

export default function Chatbot({ contractText }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I've reviewed this contract. Ask me anything about its clauses, risks, obligations, or financial terms.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text) {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;
    setInput("");

    const next = [...messages, { role: "user", content: msg }];
    setMessages(next);
    setBusy(true);

    try {
      const history = next
        .slice(1)
        .map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        }));
      const reply = await sendChatMessage(contractText, msg, history.slice(0, -1));
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: " + e.message },
      ]);
    }
    setBusy(false);
  }

  return (
    <>
      <style>{styles}</style>
      <div className="chat-section">
        <div className="chat-section-label">Contract AI Chat</div>
        <div className="chat-wrap">
          <div className="chat-header">◈ Ask anything about this contract</div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role === "user" ? "user" : "ai"}`}>
                <div className="chat-bubble">{m.content}</div>
              </div>
            ))}
            {busy && (
              <div className="chat-msg ai">
                <div className="chat-bubble">
                  <div className="typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-hints">
            {HINTS.map((h) => (
              <button
                key={h}
                className="chat-hint"
                onClick={() => send(h)}
                disabled={busy}
              >
                {h}
              </button>
            ))}
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask about a clause, risk, or obligation…"
              disabled={busy}
            />
            <button
              className="chat-send"
              onClick={() => send()}
              disabled={busy || !input.trim()}
            >
              Send →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}