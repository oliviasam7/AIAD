import React from "react";
import Results    from "./Results";
import Chatbot    from "./Chatbot";
import Translator from "./Translator";

const styles = `
/* ── Panel entrance ───────────────────────────────────────────────────────── */
.right-panel {
  padding: 36px 40px;
  display: flex; flex-direction: column; gap: 0;
  background: var(--bg);
  overflow-y: auto; max-height: calc(100vh - 64px);
  position: sticky; top: 64px;
  animation: slideInRight .5s ease .1s both;
}

/* ── Empty state ──────────────────────────────────────────────────────────── */
.empty {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center; gap: 16px; padding: 60px 20px;
}
.empty-glyph {
  font-size: 64px; opacity: 0.12; filter: grayscale(1);
  animation: float 6s ease infinite;
}
.empty-title {
  font-family: 'Instrument Serif', serif; font-size: 24px;
  color: var(--border2); font-style: italic;
  animation: fadeIn .8s ease .2s both;
}
.empty-sub {
  font-size: 13px; color: var(--muted); max-width: 260px;
  line-height: 1.6; font-family: 'JetBrains Mono', monospace;
  animation: fadeIn .8s ease .4s both;
}

/* Animated dashes below empty state */
.empty-dashes {
  display: flex; gap: 6px; margin-top: 8px;
  animation: fadeIn .8s ease .6s both;
}
.empty-dash {
  height: 1px; background: var(--border2);
  animation: dashExpand 2s ease infinite;
}
.empty-dash:nth-child(1) { width: 20px; animation-delay: 0s; }
.empty-dash:nth-child(2) { width: 40px; animation-delay: .3s; }
.empty-dash:nth-child(3) { width: 20px; animation-delay: .6s; }
@keyframes dashExpand {
  0%, 100% { opacity: 0.3; transform: scaleX(1); }
  50%       { opacity: 1;   transform: scaleX(1.2); }
}

/* ── Loading ──────────────────────────────────────────────────────────────── */
.loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 24px; padding: 80px 20px; text-align: center;
}

/* Dual-ring spinner */
.pulse-ring {
  width: 64px; height: 64px; border-radius: 50%;
  border: 2px solid rgba(0, 212, 255, 0.15);
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
/* Outer glow ring */
.pulse-ring::before {
  content: ''; position: absolute; inset: -6px; border-radius: 50%;
  border: 1px solid rgba(0,212,255,0.08);
  animation: glow-pulse 1.5s ease infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.loading-title {
  font-family: 'Instrument Serif', serif; font-size: 22px; font-style: italic;
  animation: fadeIn .4s ease both;
}
.loading-steps { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
.loading-step {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  color: var(--muted); letter-spacing: 0.5px;
  opacity: 0; animation: slideInLeft .5s ease forwards;
  display: flex; align-items: center; gap: 8px;
}
.loading-step::before {
  content: '';
  width: 0; height: 1px;
  background: var(--accent);
  animation: stepLine .5s ease forwards;
}
@keyframes stepLine {
  to { width: 16px; }
}
.loading-step:nth-child(1) { animation-delay: .2s; }
.loading-step:nth-child(2) { animation-delay: 1.2s; }
.loading-step:nth-child(3) { animation-delay: 2.2s; }
.loading-step:nth-child(1)::before { animation-delay: .2s; }
.loading-step:nth-child(2)::before { animation-delay: 1.2s; }
.loading-step:nth-child(3)::before { animation-delay: 2.2s; }

/* ── Divider ──────────────────────────────────────────────────────────────── */
.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
  margin: 32px 0;
}

/* ── Results label ────────────────────────────────────────────────────────── */
.results-label {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--muted); letter-spacing: 2px; text-transform: uppercase;
  margin-bottom: 20px;
  display: flex; align-items: center; gap: 10px;
}
.results-label::before {
  content: '';
  display: inline-block; width: 0; height: 1px; background: var(--accent);
  animation: labelLine .6s ease forwards;
}
@keyframes labelLine { to { width: 20px; } }
`;

export default function ResultsPanel({ status, result, contractText, sessionId }) {
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
            <div className="empty-dashes">
              <div className="empty-dash" />
              <div className="empty-dash" />
              <div className="empty-dash" />
            </div>
          </div>
        )}

        {status === "loading" && (
          <div className="loading">
            <div className="pulse-ring" />
            <div className="loading-title">Analyzing your contract…</div>
            <div className="loading-steps">
              <div className="loading-step">Parsing document structure</div>
              <div className="loading-step">Identifying risk clauses</div>
              <div className="loading-step">Calculating financial exposure</div>
            </div>
          </div>
        )}

        {status === "done" && result && (
          <>
            <div className="results-label">Analysis Results</div>
            <Results data={result} />
            <div className="divider" />
            <Chatbot contractText={contractText} sessionId={sessionId} />
            <div className="divider" />
            <Translator contractText={contractText} sessionId={sessionId} />
          </>
        )}

      </div>
    </>
  );
}
