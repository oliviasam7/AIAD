import React, { useState } from "react";

const styles = `
/* Results wrapper */
.results { display: flex; flex-direction: column; gap: 20px; animation: slideUp .4s ease; }
@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

/* Risk meter */
.risk-card {
  background: var(--surface); border: 1px solid var(--border2); padding: 24px;
}
.risk-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.risk-eyebrow {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 4px;
}
.risk-score-num { font-family: 'Instrument Serif', serif; font-size: 52px; line-height: 1; }
.risk-level-pill {
  padding: 6px 16px; font-size: 11px; font-weight: 700;
  letter-spacing: 1.5px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
}
.pill-low  { background: rgba(0,230,118,0.1); color: var(--green); border: 1px solid rgba(0,230,118,0.3); }
.pill-med  { background: rgba(240,180,41,0.1); color: var(--gold);  border: 1px solid rgba(240,180,41,0.3); }
.pill-high { background: rgba(255,77,77,0.1);  color: var(--red);   border: 1px solid rgba(255,77,77,0.3); }
.risk-bar-track { height: 6px; background: var(--border); position: relative; }
.risk-bar-fill  { height: 100%; transition: width 1.2s cubic-bezier(.4,0,.2,1); }
.risk-bar-low  { background: linear-gradient(90deg, var(--green), #00a854); }
.risk-bar-med  { background: linear-gradient(90deg, var(--gold), var(--orange)); }
.risk-bar-high { background: linear-gradient(90deg, var(--orange), var(--red)); }
.risk-verdict { font-size: 13px; color: var(--muted); margin-top: 10px; line-height: 1.6; font-family: 'JetBrains Mono', monospace; }

/* Collapsible card */
.scard { border: 1px solid var(--border); overflow: hidden; }
.scard-head {
  padding: 14px 20px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  background: var(--surface2); cursor: pointer; user-select: none;
}
.scard-head-left { display: flex; align-items: center; gap: 10px; }
.scard-icon { font-size: 16px; }
.scard-title { font-size: 13px; font-weight: 700; letter-spacing: 0.3px; }
.scard-toggle { font-size: 12px; color: var(--muted); transition: transform .2s; }
.scard-toggle.open { transform: rotate(180deg); }
.scard-body { padding: 20px; display: flex; flex-direction: column; gap: 12px; }

/* Summary */
.summary-text { font-size: 14px; line-height: 1.8; color: #b0bec5; font-family: 'JetBrains Mono', monospace; }

/* Clauses */
.clause {
  border-left: 3px solid var(--border); padding: 12px 16px;
  background: var(--surface2);
  display: flex; flex-direction: column; gap: 4px;
}
.clause.risk     { border-left-color: var(--red); }
.clause.positive { border-left-color: var(--green); }
.clause.neutral  { border-left-color: var(--accent); }
.clause-tag {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  letter-spacing: 1.5px; text-transform: uppercase; font-weight: 500;
}
.tag-r { color: var(--red); }
.tag-g { color: var(--green); }
.tag-n { color: var(--accent); }
.clause-body { font-size: 13px; line-height: 1.65; color: #b0bec5; }

/* Financials */
.fin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.fin-item { background: var(--surface2); border: 1px solid var(--border); padding: 16px; }
.fin-lbl {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;
}
.fin-val  { font-family: 'Instrument Serif', serif; font-size: 20px; color: var(--text); }
.fin-note { font-size: 11px; color: var(--muted); margin-top: 4px; font-family: 'JetBrains Mono', monospace; }

/* Recommendation */
.rec {
  background: linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,153,204,0.04));
  border: 1px solid rgba(0, 212, 255, 0.2); padding: 22px;
}
.rec-head {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--accent); letter-spacing: 2px; text-transform: uppercase;
  margin-bottom: 10px; display: flex; align-items: center; gap: 8px;
}
.rec-head::before { content: ''; flex: 0 0 20px; height: 1px; background: var(--accent); }
.rec-body { font-size: 13px; line-height: 1.8; color: #b0bec5; }
`;

// ── CollapseCard ──────────────────────────────────────────
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

// ── RiskMeter ─────────────────────────────────────────────
function RiskMeter({ score, level }) {
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
          <div className="risk-score-num" style={{ color: textColor }}>{score}</div>
        </div>
        <div className={`risk-level-pill ${pillClass}`}>{level} Risk</div>
      </div>
      <div className="risk-bar-track">
        <div className={`risk-bar-fill ${barClass}`} style={{ width: `${score}%` }} />
      </div>
      <div className="risk-verdict">{verdicts[level] || verdicts.Medium}</div>
    </div>
  );
}

// ── Main Results component ────────────────────────────────
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
