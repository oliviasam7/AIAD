import React from "react";

const styles = `
.footer {
  border-top: 1px solid var(--border); padding: 20px 40px;
  display: flex; align-items: center; justify-content: space-between;
  background: var(--surface); position: relative; z-index: 1;
  overflow: hidden;
}
/* Animated top accent line */
.footer::before {
  content: '';
  position: absolute; top: 0; left: -100%;
  width: 100%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  animation: footerLine 6s ease infinite;
}
@keyframes footerLine {
  0%   { left: -100%; }
  100% { left: 100%; }
}

.footer-left {
  font-size: 12px; color: var(--muted); font-family: 'JetBrains Mono', monospace;
  display: flex; align-items: center; gap: 8px;
}
.footer-left span {
  color: var(--accent);
  transition: text-shadow .3s;
}
.footer-left span:hover {
  text-shadow: 0 0 12px rgba(0,212,255,0.6);
  cursor: default;
}
.footer-dot {
  width: 4px; height: 4px; border-radius: 50%;
  background: var(--accent); opacity: 0.4;
  animation: glow-pulse 2s ease infinite;
}
.footer-disclaimer {
  font-size: 11px; color: var(--muted); max-width: 400px;
  text-align: right; font-family: 'JetBrains Mono', monospace; line-height: 1.5;
  opacity: 0.7; transition: opacity .2s;
}
.footer-disclaimer:hover { opacity: 1; }
`;

export default function Footer() {
  return (
    <>
      <style>{styles}</style>
      <footer className="footer">
        <div className="footer-left">
          <div className="footer-dot" />
          © 2026 <span>FinCore</span> · Contract Intelligence Platform
        </div>
        <div className="footer-disclaimer">
          AI analysis is for informational purposes only and does not constitute
          legal advice. Always consult a qualified attorney for important contracts.
        </div>
      </footer>
    </>
  );
}
