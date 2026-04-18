import React from "react";

const styles = `
.footer {
  border-top: 1px solid var(--border); padding: 20px 40px;
  display: flex; align-items: center; justify-content: space-between;
  background: var(--surface); position: relative; z-index: 1;
}
.footer-left { font-size: 12px; color: var(--muted); font-family: 'JetBrains Mono', monospace; }
.footer-left span { color: var(--accent); }
.footer-disclaimer {
  font-size: 11px; color: var(--muted); max-width: 400px;
  text-align: right; font-family: 'JetBrains Mono', monospace; line-height: 1.5;
}
`;

export default function Footer() {
  return (
    <>
      <style>{styles}</style>
      <footer className="footer">
        <div className="footer-left">
          © 2025 <span>FinCore</span> · Contract Intelligence Platform
        </div>
        <div className="footer-disclaimer">
          AI analysis is for informational purposes only and does not constitute
          legal advice. Always consult a qualified attorney for important contracts.
        </div>
      </footer>
    </>
  );
}
