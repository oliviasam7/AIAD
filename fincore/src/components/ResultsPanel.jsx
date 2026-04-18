import React from "react";
import Results from "./Results";
import Chatbot from "./Chatbot";
import Translator from "./Translator";

const styles = `
.right-panel {
  padding: 36px 40px;
  display: flex; flex-direction: column; gap: 0;
  background: var(--bg);
  overflow-y: auto; max-height: calc(100vh - 64px);
  position: sticky; top: 64px;
}
.empty {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center; gap: 16px; padding: 60px 20px;
}
.empty-glyph { font-size: 64px; opacity: 0.15; filter: grayscale(1); }
.empty-title {
  font-family: 'Instrument Serif', serif; font-size: 24px;
  color: var(--border2); font-style: italic;
}
.empty-sub {
  font-size: 13px; color: var(--muted); max-width: 260px;
  line-height: 1.6; font-family: 'JetBrains Mono', monospace;
}
.loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 24px; padding: 80px 20px; text-align: center;
}
.pulse-ring {
  width: 64px; height: 64px; border-radius: 50%;
  border: 2px solid rgba(0, 212, 255, 0.2);
  border-top-color: var(--accent);
  animation: spin .9s linear infinite;
  position: relative;
}
.pulse-ring::after {
  content: ''; position: absolute; inset: 8px; border-radius: 50%;
  border: 1px solid rgba(0, 212, 255, 0.1);
  border-top-color: rgba(0, 212, 255, 0.4);
  animation: spin .6s linear infinite reverse;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-title {
  font-family: 'Instrument Serif', serif; font-size: 22px; font-style: italic;
}
.loading-steps { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
.loading-step {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  color: var(--muted); letter-spacing: 0.5px;
  opacity: 0; animation: fadeIn .5s forwards;
}
.loading-step:nth-child(1) { animation-delay: .2s; }
.loading-step:nth-child(2) { animation-delay: 1s; }
.loading-step:nth-child(3) { animation-delay: 2s; }
@keyframes fadeIn { to { opacity: 1; } }
.results-label {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--muted); letter-spacing: 2px; text-transform: uppercase;
  margin-bottom: 20px;
}
.divider {
  height: 1px; background: var(--border);
  margin: 32px 0;
}
`;

export default function ResultsPanel({ status, result, contractText }) {
  return (
    <>
      <style>{styles}</style>
      <div className="right-panel">

        {status === "idle" && (
          <div className="empty">
            <div className="empty-glyph">⚖</div>
            <div className="empty-title">Awaiting your contract</div>
            <div className="empty-sub">
              Upload or paste a contract on the left to receive your AI-powered analysis.
            </div>
          </div>
        )}

        {status === "loading" && (
          <div className="loading">
            <div className="pulse-ring" />
            <div className="loading-title">Analyzing your contract…</div>
            <div className="loading-steps">
              <div className="loading-step">→ Parsing document structure</div>
              <div className="loading-step">→ Identifying risk clauses</div>
              <div className="loading-step">→ Calculating financial exposure</div>
            </div>
          </div>
        )}

        {status === "done" && result && (
          <>
            <div className="results-label">Analysis Results</div>
            <Results data={result} />

            <div className="divider" />
            <Chatbot contractText={contractText} />

            <div className="divider" />
            <Translator contractText={contractText} />
          </>
        )}

      </div>
    </>
  );
}