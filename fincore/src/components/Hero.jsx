import React from "react";

const styles = `
.hero {
  position: relative; z-index: 1;
  padding: 80px 40px 60px;
  text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 20px;
}
.hero-eyebrow {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  color: var(--accent); letter-spacing: 3px; text-transform: uppercase;
  border: 1px solid rgba(0, 212, 255, 0.25); padding: 6px 18px;
  background: rgba(0, 212, 255, 0.05);
}
.hero-h1 {
  font-family: 'Instrument Serif', serif; font-size: clamp(42px, 7vw, 80px);
  font-weight: 400; line-height: 1.05; max-width: 800px; color: var(--text);
}
.hero-h1 em {
  font-style: italic;
  background: linear-gradient(135deg, var(--accent), var(--gold));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-sub {
  font-size: 16px; color: var(--muted); font-weight: 400;
  max-width: 520px; line-height: 1.7;
}
`;

export default function Hero() {
  return (
    <>
      <style>{styles}</style>
      <div className="hero">
        <div className="hero-eyebrow">Contract Intelligence Platform</div>
        <h1 className="hero-h1">
          Understand <em>every clause</em><br />before you sign.
        </h1>
        <p className="hero-sub">
          Upload any contract and get an instant plain-language breakdown of risks,
          obligations, and financial consequences — powered by AI.
        </p>
      </div>
    </>
  );
}
