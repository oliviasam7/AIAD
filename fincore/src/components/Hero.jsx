import React, { useEffect, useState } from "react";

const styles = `
.hero {
  position: relative; z-index: 1;
  padding: 80px 40px 60px;
  text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 20px;
  overflow: hidden;
}

/* Radial glow behind hero text */
.hero::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 600px; height: 300px;
  background: radial-gradient(ellipse, rgba(0,212,255,0.07) 0%, transparent 70%);
  pointer-events: none;
  animation: glow-pulse 4s ease infinite;
}

/* ── Eyebrow ──────────────────────────────────────────────────────────────── */
.hero-eyebrow {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  color: var(--accent); letter-spacing: 3px; text-transform: uppercase;
  border: 1px solid rgba(0, 212, 255, 0.25); padding: 6px 18px;
  background: rgba(0, 212, 255, 0.05);
  animation: fadeUp .6s ease both;
  position: relative;
}
/* scanning light on eyebrow pill */
.hero-eyebrow::after {
  content: '';
  position: absolute; top: 0; left: -100%;
  width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0,212,255,0.15), transparent);
  animation: eyebrowScan 4s ease 1s infinite;
}
@keyframes eyebrowScan {
  0%   { left: -60%; }
  100% { left: 110%; }
}

/* ── H1 ───────────────────────────────────────────────────────────────────── */
.hero-h1 {
  font-family: 'Instrument Serif', serif; font-size: clamp(42px, 7vw, 80px);
  font-weight: 400; line-height: 1.05; max-width: 800px; color: var(--text);
  animation: fadeUp .7s ease .15s both;
}
.hero-h1 em {
  font-style: italic;
  background: linear-gradient(135deg, var(--accent) 0%, var(--gold) 50%, var(--accent) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: shimmer 4s linear infinite;
}

/* ── Sub ──────────────────────────────────────────────────────────────────── */
.hero-sub {
  font-size: 16px; color: var(--muted); font-weight: 400;
  max-width: 520px; line-height: 1.7;
  animation: fadeUp .7s ease .3s both;
}

/* ── Stats row ────────────────────────────────────────────────────────────── */
.hero-stats {
  display: flex; gap: 40px; margin-top: 12px;
  animation: fadeUp .7s ease .45s both;
}
.hero-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.hero-stat-num {
  font-family: 'Instrument Serif', serif; font-size: 28px;
  color: var(--accent); line-height: 1;
}
.hero-stat-label {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase;
}
.hero-stat-divider {
  width: 1px; background: var(--border2); align-self: stretch;
}

/* ── Floating particles ───────────────────────────────────────────────────── */
.hero-particle {
  position: absolute;
  width: 3px; height: 3px;
  border-radius: 50%;
  background: var(--accent);
  pointer-events: none;
  opacity: 0;
}
`;

// Animated counter hook
function useCounter(target, duration = 1500, delay = 600) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setVal(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return val;
}

function StatItem({ num, label, suffix = "" }) {
  const count = useCounter(num);
  return (
    <div className="hero-stat">
      <div className="hero-stat-num">{count}{suffix}</div>
      <div className="hero-stat-label">{label}</div>
    </div>
  );
}

// Random floating dots
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${8 + Math.random() * 84}%`,
  top: `${10 + Math.random() * 80}%`,
  delay: `${Math.random() * 5}s`,
  duration: `${4 + Math.random() * 6}s`,
  size: `${2 + Math.random() * 3}px`,
}));

export default function Hero() {
  return (
    <>
      <style>{styles}</style>
      <div className="hero">

        {/* Floating particles */}
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="hero-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animation: `float ${p.duration} ease-in-out ${p.delay} infinite, fadeIn .5s ease ${p.delay} forwards`,
            }}
          />
        ))}

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
