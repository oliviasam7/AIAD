import React, { useState, useEffect, useRef } from "react";

const styles = `
/* ── Results entrance ─────────────────────────────────────────────────────── */
.results { display: flex; flex-direction: column; gap: 20px; }

/* Staggered child reveal */
.results > * {
  animation: fadeUp .4s ease both;
}
.results > *:nth-child(1) { animation-delay: 0s; }
.results > *:nth-child(2) { animation-delay: .08s; }
.results > *:nth-child(3) { animation-delay: .16s; }
.results > *:nth-child(4) { animation-delay: .24s; }
.results > *:nth-child(5) { animation-delay: .32s; }

/* ── Risk card ────────────────────────────────────────────────────────────── */
.risk-card {
  background: var(--surface); border: 1px solid var(--border2); padding: 24px;
  position: relative; overflow: hidden;
}
/* animated corner accent */
.risk-card::before {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 3px; height: 0%;
  background: linear-gradient(180deg, var(--accent), transparent);
  animation: riskAccent .8s ease .1s forwards;
}
@keyframes riskAccent {
  to { height: 100%; }
}
.risk-top {
  display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px;
}
.risk-eyebrow {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 4px;
}
.risk-score-num {
  font-family: 'Instrument Serif', serif; font-size: 52px; line-height: 1;
  /* counter animation done via JS */
}
.risk-level-pill {
  padding: 6px 16px; font-size: 11px; font-weight: 700;
  letter-spacing: 1.5px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
  animation: popIn .4s ease .3s both;
}
.pill-low  { background: rgba(0,230,118,0.1); color: var(--green); border: 1px solid rgba(0,230,118,0.3); }
.pill-med  { background: rgba(240,180,41,0.1); color: var(--gold);  border: 1px solid rgba(240,180,41,0.3); }
.pill-high { background: rgba(255,77,77,0.1);  color: var(--red);   border: 1px solid rgba(255,77,77,0.3); }

/* ── Risk bar ─────────────────────────────────────────────────────────────── */
.risk-bar-track {
  height: 6px; background: var(--border); position: relative; overflow: hidden;
}
/* Shimmer over filled bar */
.risk-bar-track::after {
  content: '';
  position: absolute; top: 0; left: -100%;
  width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: barShimmer 2s ease 1.5s forwards;
}
@keyframes barShimmer {
  from { left: -60%; }
  to   { left: 110%; }
}
.risk-bar-fill  { height: 100%; width: 0%; transition: width 1.4s cubic-bezier(.4,0,.2,1); }
.risk-bar-low  { background: linear-gradient(90deg, var(--green), #00a854); }
.risk-bar-med  { background: linear-gradient(90deg, var(--gold), var(--orange)); }
.risk-bar-high { background: linear-gradient(90deg, var(--orange), var(--red)); }

.risk-verdict {
  font-size: 13px; color: var(--muted); margin-top: 10px; line-height: 1.6;
  font-family: 'JetBrains Mono', monospace;
  animation: fadeIn .5s ease .8s both;
}

/* ── Collapsible card ─────────────────────────────────────────────────────── */
.scard { border: 1px solid var(--border); overflow: hidden; }
.scard-head {
  padding: 14px 20px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  background: var(--surface2); cursor: pointer; user-select: none;
  transition: background .2s;
}
.scard-head:hover { background: rgba(0,212,255,0.04); }
.scard-head-left { display: flex; align-items: center; gap: 10px; }
.scard-icon { font-size: 16px; }
.scard-title { font-size: 13px; font-weight: 700; letter-spacing: 0.3px; }
.scard-toggle {
  font-size: 12px; color: var(--muted);
  transition: transform .3s ease, color .2s;
}
.scard-toggle.open { transform: rotate(180deg); color: var(--accent); }
.scard-body {
  padding: 20px; display: flex; flex-direction: column; gap: 12px;
  animation: fadeUp .3s ease both;
}

/* ── Summary ──────────────────────────────────────────────────────────────── */
.summary-text {
  font-size: 14px; line-height: 1.8; color: #b0bec5;
  font-family: 'JetBrains Mono', monospace;
}

/* ── Clauses ──────────────────────────────────────────────────────────────── */
.clause {
  border-left: 3px solid var(--border); padding: 12px 16px;
  background: var(--surface2);
  display: flex; flex-direction: column; gap: 4px;
  transition: transform .2s ease, box-shadow .2s ease;
  animation: slideInLeft .3s ease both;
}
.clause:hover { transform: translateX(4px); }
.clause.risk     { border-left-color: var(--red); }
.clause.positive { border-left-color: var(--green); }
.clause.neutral  { border-left-color: var(--accent); }
.clause.risk:hover     { box-shadow: -2px 0 12px rgba(255,77,77,0.15); }
.clause.positive:hover { box-shadow: -2px 0 12px rgba(0,230,118,0.15); }
.clause.neutral:hover  { box-shadow: -2px 0 12px rgba(0,212,255,0.15); }

.clause-tag {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  letter-spacing: 1.5px; text-transform: uppercase; font-weight: 500;
}
.tag-r { color: var(--red); }
.tag-g { color: var(--green); }
.tag-n { color: var(--accent); }
.clause-body { font-size: 13px; line-height: 1.65; color: #b0bec5; }

/* Stagger clauses */
.clause:nth-child(1) { animation-delay: .05s; }
.clause:nth-child(2) { animation-delay: .10s; }
.clause:nth-child(3) { animation-delay: .15s; }
.clause:nth-child(4) { animation-delay: .20s; }
.clause:nth-child(5) { animation-delay: .25s; }
.clause:nth-child(6) { animation-delay: .30s; }

/* ── Financials ───────────────────────────────────────────────────────────── */
.fin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.fin-item {
  background: var(--surface2); border: 1px solid var(--border); padding: 16px;
  transition: border-color .2s, transform .2s;
  animation: fadeUp .3s ease both;
  cursor: default;
}
.fin-item:hover { border-color: var(--accent); transform: translateY(-2px); }
.fin-item:nth-child(1) { animation-delay: .05s; }
.fin-item:nth-child(2) { animation-delay: .10s; }
.fin-item:nth-child(3) { animation-delay: .15s; }
.fin-item:nth-child(4) { animation-delay: .20s; }

.fin-lbl {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;
}
.fin-val  { font-family: 'Instrument Serif', serif; font-size: 20px; color: var(--text); }
.fin-note { font-size: 11px; color: var(--muted); margin-top: 4px; font-family: 'JetBrains Mono', monospace; }

/* ── Recommendation ───────────────────────────────────────────────────────── */
.rec {
  background: linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,153,204,0.04));
  border: 1px solid rgba(0, 212, 255, 0.2); padding: 22px;
  position: relative; overflow: hidden;
}
/* Animated corner glow */
.rec::before {
  content: '';
  position: absolute; top: -20px; right: -20px;
  width: 80px; height: 80px;
  background: radial-gradient(circle, rgba(0,212,255,0.15), transparent 70%);
  animation: float 4s ease infinite;
}
.rec-head {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--accent); letter-spacing: 2px; text-transform: uppercase;
  margin-bottom: 10px; display: flex; align-items: center; gap: 8px;
}
.rec-head::before { content: ''; flex: 0 0 20px; height: 1px; background: var(--accent); }
.rec-body { font-size: 13px; line-height: 1.8; color: #b0bec5; }
`;

// ── Animated score counter ────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  const rafRef = useRef();
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return val;
}

// ── Animated risk bar ─────────────────────────────────────────────────────
function RiskMeter({ score, level }) {
  const [width, setWidth] = useState(0);
  const count = useCountUp(score);

  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  const pillClass = level === "Low" ? "pill-low" : level === "Medium" ? "pill-med" : "pill-high";
  const barClass  = level === "Low" ? "risk-bar-low" : level === "Medium" ? "risk-bar-med" : "risk-bar-high";
  const textColor = level === "Low" ? "var(--green)" : level === "Medium" ? "var(--gold)" : "var(--red)";
  const verdicts = {
    Low:    "This contract presents minimal risk. Standard terms with no major red flags detected.",
    Medium: "Moderate risk detected. Review highlighted clauses carefully before signing.",
    High:   "Significant risk flags identified. Strongly consider legal consultation before proceeding.",
  };

  return (
    <div className="risk-card">
      <div className="risk-top">
        <div>
          <div className="risk-eyebrow">Overall Risk Score</div>
          <div className="risk-score-num" style={{ color: textColor }}>{count}</div>
        </div>
        <div className={`risk-level-pill ${pillClass}`}>{level} Risk</div>
      </div>
      <div className="risk-bar-track">
        <div className={`risk-bar-fill ${barClass}`} style={{ width: `${width}%` }} />
      </div>
      <div className="risk-verdict">{verdicts[level] || verdicts.Medium}</div>
    </div>
  );
}

// ── Collapsible card ──────────────────────────────────────────────────────
function CollapseCard({ icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="scard">
      <div className="scard-head" onClick={() => setOpen((o) => !o)}>
        <div className="scard-head-left">
          <span className="scard-icon">{icon}</span>
          <span className="scard-title">{title}</span>
        </div>
        <span className={`scard-toggle ${open ? "open" : ""}`}>▼</span>
      </div>
      {open && <div className="scard-body">{children}</div>}
    </div>
  );
}

// ── Main Results ──────────────────────────────────────────────────────────
export default function Results({ data }) {
  return (
    <>
      <style>{styles}</style>
      <div className="results">
        <RiskMeter score={data.riskScore} level={data.riskLevel} />

        <CollapseCard icon="📋" title="Plain-Language Summary">
          <div className="summary-text">{data.summary}</div>
        </CollapseCard>

        <CollapseCard icon="🔍" title="Key Clauses Explained">
          {data.clauses?.map((c, i) => (
            <div key={i} className={`clause ${c.type}`}>
              <div className={`clause-tag ${c.type === "risk" ? "tag-r" : c.type === "positive" ? "tag-g" : "tag-n"}`}>
                {c.type === "risk" ? "⚠ " : c.type === "positive" ? "✓ " : "→ "}{c.tag}
              </div>
              <div className="clause-body">{c.text}</div>
            </div>
          ))}
        </CollapseCard>

        {data.financials?.length > 0 && (
          <CollapseCard icon="💰" title="Financial Breakdown">
            <div className="fin-grid">
              {data.financials.map((f, i) => (
                <div key={i} className="fin-item">
                  <div className="fin-lbl">{f.label}</div>
                  <div className="fin-val">{f.value}</div>
                  {f.note && <div className="fin-note">{f.note}</div>}
                </div>
              ))}
            </div>
          </CollapseCard>
        )}

        <div className="rec">
          <div className="rec-head">FinCore Recommendation</div>
          <div className="rec-body">{data.recommendation}</div>
        </div>
      </div>
    </>
  );
}
