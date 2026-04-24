import React, { useRef, useState, useCallback } from "react";
import { FOCUS_OPTIONS } from "../utils/constants";

const styles = `
/* ── Panel entrance ───────────────────────────────────────────────────────── */
.left-panel {
  border-right: 1px solid var(--border);
  padding: 36px 40px;
  display: flex; flex-direction: column; gap: 28px;
  background: var(--surface);
  animation: slideInLeft .5s ease .1s both;
}

/* ── Step labels ──────────────────────────────────────────────────────────── */
.step-label {
  display: flex; align-items: center; gap: 10px;
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  letter-spacing: 2px; text-transform: uppercase; color: var(--muted);
}
.step-num {
  width: 22px; height: 22px;
  border: 1px solid var(--border2);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; color: var(--accent);
  transition: all .3s ease;
  position: relative;
}
.step-num::after {
  content: '';
  position: absolute; inset: -3px;
  border: 1px solid rgba(0,212,255,0);
  transition: all .3s ease;
}
.step-num:hover::after {
  inset: -5px;
  border-color: rgba(0,212,255,0.3);
}
.panel-section-title {
  font-size: 18px; font-weight: 700; margin-top: 4px; letter-spacing: -0.3px;
}

/* ── Tabs ─────────────────────────────────────────────────────────────────── */
.input-tabs {
  display: flex; border: 1px solid var(--border2);
  background: var(--bg); width: fit-content;
  position: relative;
}
.itab {
  padding: 9px 22px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;
  cursor: pointer; border: none; background: transparent;
  font-family: 'Syne', sans-serif; color: var(--muted);
  transition: color .2s;
  position: relative; overflow: hidden;
}
.itab:not(:last-child) { border-right: 1px solid var(--border2); }
.itab.active { background: var(--accent); color: #000; }
.itab:not(.active):hover { color: var(--text); background: var(--surface2); }

/* Ripple on tab click */
.itab::after {
  content: '';
  position: absolute; top: 50%; left: 50%;
  width: 0; height: 0;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width .4s ease, height .4s ease, opacity .4s ease;
  opacity: 0;
}
.itab:active::after {
  width: 120px; height: 120px; opacity: 0;
}

/* ── Textarea ─────────────────────────────────────────────────────────────── */
.contract-ta {
  width: 100%; min-height: 260px;
  border: 1px solid var(--border2); background: var(--bg);
  padding: 16px; color: var(--text);
  font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.75;
  resize: vertical; outline: none;
  transition: border-color .2s, box-shadow .2s, background .2s;
}
.contract-ta:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.08), inset 0 0 20px rgba(0,212,255,0.02);
  background: rgba(0,212,255,0.01);
}
.contract-ta::placeholder { color: var(--muted); }

/* ── Dropzone ─────────────────────────────────────────────────────────────── */
.dropzone {
  border: 1px dashed var(--border2); background: var(--bg);
  padding: 52px 24px; text-align: center; cursor: pointer;
  transition: all .25s ease; position: relative;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  overflow: hidden;
}
/* Corner accents */
.dropzone::before, .dropzone::after {
  content: '';
  position: absolute;
  width: 16px; height: 16px;
  border-color: var(--border2);
  border-style: solid;
  transition: border-color .25s, width .25s, height .25s;
}
.dropzone::before { top: 8px; left: 8px; border-width: 1px 0 0 1px; }
.dropzone::after  { bottom: 8px; right: 8px; border-width: 0 1px 1px 0; }
.dropzone:hover::before, .dropzone.over::before,
.dropzone:hover::after,  .dropzone.over::after {
  border-color: var(--accent);
  width: 24px; height: 24px;
}
.dropzone:hover, .dropzone.over {
  border-color: var(--accent); background: rgba(0, 212, 255, 0.03);
  box-shadow: inset 0 0 40px rgba(0, 212, 255, 0.06), 0 0 20px rgba(0,212,255,0.05);
}
.dropzone.over { animation: pulse-border 1s ease infinite; }

/* Animated scan line inside dropzone on hover */
.dropzone:hover .dz-scan {
  animation: dropScan 1.5s ease infinite;
  opacity: 1;
}
.dz-scan {
  position: absolute; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent);
  top: 0; opacity: 0;
  transition: opacity .2s;
}
@keyframes dropScan {
  0%   { top: 0%; }
  100% { top: 100%; }
}

.dz-icon {
  font-size: 36px; transition: transform .3s ease;
}
.dropzone:hover .dz-icon { transform: scale(1.15) translateY(-4px); }
.dz-title { font-size: 15px; font-weight: 700; color: var(--text); }
.dz-sub { font-size: 12px; color: var(--muted); font-family: 'JetBrains Mono', monospace; }
.file-pill {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3);
  color: var(--accent); padding: 6px 14px; font-size: 12px;
  font-family: 'JetBrains Mono', monospace; margin-top: 6px;
  animation: popIn .3s ease both;
}

/* ── Focus cards ──────────────────────────────────────────────────────────── */
.focus-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.focus-card {
  border: 1px solid var(--border2); background: var(--bg);
  padding: 12px 14px; cursor: pointer;
  display: flex; align-items: center; gap: 10px;
  font-size: 12px; font-weight: 600; letter-spacing: 0.3px;
  transition: all .2s ease; user-select: none; color: var(--muted);
  position: relative; overflow: hidden;
}
/* Hover shimmer sweep */
.focus-card::before {
  content: '';
  position: absolute; top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0,212,255,0.06), transparent);
  transition: left .4s ease;
}
.focus-card:hover::before { left: 100%; }
.focus-card:hover { border-color: var(--accent); color: var(--text); transform: translateY(-1px); }
.focus-card.on {
  border-color: var(--accent);
  background: rgba(0, 212, 255, 0.07); color: var(--accent);
  box-shadow: inset 0 0 12px rgba(0,212,255,0.05);
  animation: popIn .2s ease both;
}
.focus-check {
  width: 16px; height: 16px; border: 1px solid var(--border2); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 9px;
  transition: all .2s ease;
}
.focus-card.on .focus-check {
  background: var(--accent); border-color: var(--accent); color: #000;
  transform: scale(1.1);
}

/* ── Analyze button ───────────────────────────────────────────────────────── */
.analyze-btn {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #000; border: none; padding: 18px;
  font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800;
  cursor: pointer; width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  letter-spacing: -0.3px;
  clip-path: polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px);
  transition: opacity .2s, transform .1s, box-shadow .2s;
  position: relative; overflow: hidden;
}
/* Shimmer sweep */
.analyze-btn::before {
  content: '';
  position: absolute; top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  transition: left .5s ease;
}
.analyze-btn:hover:not(:disabled)::before { left: 100%; }
.analyze-btn:hover:not(:disabled) {
  box-shadow: 0 0 30px rgba(0,212,255,0.4), 0 0 60px rgba(0,212,255,0.15);
  transform: translateY(-1px);
}
.analyze-btn:active:not(:disabled) { transform: scale(0.99) translateY(0); }
.analyze-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* Loading shimmer on the button text */
.btn-loading-text {
  background: linear-gradient(90deg, #000 30%, rgba(0,0,0,0.5) 50%, #000 70%);
  background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: shimmer 1.5s linear infinite;
}

/* ── Error ────────────────────────────────────────────────────────────────── */
.error-box {
  border: 1px solid rgba(255, 77, 77, 0.4); background: rgba(255, 77, 77, 0.07);
  padding: 18px; font-size: 13px; color: var(--red); line-height: 1.6;
  font-family: 'JetBrains Mono', monospace;
  animation: fadeUp .3s ease both;
}
`;

export default function InputPanel({
  tab, setTab,
  text, setText,
  file, setFile,
  setImgData,
  focus, toggleFocus,
  status, error,
  onAnalyze,
  canGo,
}) {
  const fileRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((f) => {
    if (!f) return;
    setFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) =>
        setImgData({ data: e.target.result.split(",")[1], type: f.type });
      reader.readAsDataURL(f);
    } else {
      setImgData(null);
    }
  }, [setFile, setImgData]);

  return (
    <>
      <style>{styles}</style>
      <div className="left-panel">
        {/* Step 1 */}
        <div>
          <div className="step-label">
            <div className="step-num">01</div>Input Your Contract
          </div>
          <div className="panel-section-title">Upload or Paste</div>
        </div>

        {/* Tabs */}
        <div className="input-tabs">
          {["text", "file"].map((t) => (
            <button
              key={t}
              className={`itab ${tab === t ? "active" : ""}`}
              onClick={() => { setTab(t); setFile(null); setImgData(null); }}
            >
              {t === "text" ? "Paste Text" : "Upload File"}
            </button>
          ))}
        </div>

        {/* Input area */}
        {tab === "text" ? (
          <textarea
            className="contract-ta"
            placeholder={"Paste your contract text here…\n\nExample: This Employment Agreement is entered into between Company X and Employee Y…\n\nWorks with: employment contracts, rental agreements, NDAs, vendor agreements, insurance policies, and more."}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        ) : (
          <div
            className={`dropzone ${dragging ? "over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <div className="dz-scan" />
            <div className="dz-icon">{file ? "📎" : "📂"}</div>
            <div className="dz-title">{file ? "File Ready" : "Drop your contract here"}</div>
            {file
              ? <div className="file-pill">📄 {file.name}</div>
              : <div className="dz-sub">PDF · TXT · DOCX · PNG · JPG · WEBP</div>
            }
          </div>
        )}

        {/* Step 2 */}
        <div>
          <div className="step-label">
            <div className="step-num">02</div>Choose Focus Areas
          </div>
          <div style={{ height: 10 }} />
          <div className="focus-grid">
            {FOCUS_OPTIONS.map((o) => (
              <div
                key={o.id}
                className={`focus-card ${focus.includes(o.id) ? "on" : ""}`}
                onClick={() => toggleFocus(o.id)}
              >
                <div className="focus-check">{focus.includes(o.id) ? "✓" : ""}</div>
                {o.label}
              </div>
            ))}
          </div>
        </div>

        {/* Analyze button */}
        <button className="analyze-btn" onClick={onAnalyze} disabled={!canGo}>
          {status === "loading"
            ? <span className="btn-loading-text">Analyzing Contract…</span>
            : "Analyze Contract →"}
        </button>

        {status === "error" && <div className="error-box">⚠ {error}</div>}
      </div>
    </>
  );
}
