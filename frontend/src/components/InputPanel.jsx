import React, { useRef, useState, useCallback } from "react";
import { FOCUS_OPTIONS } from "../utils/constants";

const styles = `
.left-panel {
  border-right: 1px solid var(--border);
  padding: 36px 40px;
  display: flex; flex-direction: column; gap: 28px;
  background: var(--surface);
}
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
}
.panel-section-title { font-size: 18px; font-weight: 700; margin-top: 4px; letter-spacing: -0.3px; }

/* Tabs */
.input-tabs { display: flex; border: 1px solid var(--border2); background: var(--bg); width: fit-content; }
.itab {
  padding: 9px 22px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;
  cursor: pointer; border: none; background: transparent;
  font-family: 'Syne', sans-serif; color: var(--muted);
  transition: all .15s;
}
.itab:not(:last-child) { border-right: 1px solid var(--border2); }
.itab.active { background: var(--accent); color: #000; }
.itab:not(.active):hover { color: var(--text); background: var(--surface2); }

/* Textarea */
.contract-ta {
  width: 100%; min-height: 260px;
  border: 1px solid var(--border2); background: var(--bg);
  padding: 16px; color: var(--text);
  font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.75;
  resize: vertical; outline: none;
  transition: border-color .2s;
}
.contract-ta:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.08); }
.contract-ta::placeholder { color: var(--muted); }

/* Dropzone */
.dropzone {
  border: 1px dashed var(--border2); background: var(--bg);
  padding: 52px 24px; text-align: center; cursor: pointer;
  transition: all .2s; position: relative;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.dropzone:hover, .dropzone.over {
  border-color: var(--accent); background: rgba(0, 212, 255, 0.04);
  box-shadow: inset 0 0 30px rgba(0, 212, 255, 0.05);
}
.dz-icon { font-size: 36px; filter: grayscale(0.4); }
.dz-title { font-size: 15px; font-weight: 700; color: var(--text); }
.dz-sub { font-size: 12px; color: var(--muted); font-family: 'JetBrains Mono', monospace; }
.file-pill {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3);
  color: var(--accent); padding: 6px 14px; font-size: 12px;
  font-family: 'JetBrains Mono', monospace; margin-top: 6px;
}

/* Focus grid */
.focus-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.focus-card {
  border: 1px solid var(--border2); background: var(--bg);
  padding: 12px 14px; cursor: pointer;
  display: flex; align-items: center; gap: 10px;
  font-size: 12px; font-weight: 600; letter-spacing: 0.3px;
  transition: all .15s; user-select: none; color: var(--muted);
}
.focus-card:hover { border-color: var(--accent); color: var(--text); }
.focus-card.on { border-color: var(--accent); background: rgba(0, 212, 255, 0.07); color: var(--accent); }
.focus-check {
  width: 16px; height: 16px; border: 1px solid var(--border2); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 9px;
  transition: all .15s;
}
.focus-card.on .focus-check { background: var(--accent); border-color: var(--accent); color: #000; }

/* Analyze button */
.analyze-btn {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #000; border: none; padding: 18px;
  font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800;
  cursor: pointer; width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  letter-spacing: -0.3px;
  clip-path: polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px);
  transition: opacity .2s, transform .1s;
  position: relative; overflow: hidden;
}
.analyze-btn::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
  opacity: 0; transition: opacity .2s;
}
.analyze-btn:hover:not(:disabled)::before { opacity: 1; }
.analyze-btn:active:not(:disabled) { transform: scale(0.99); }
.analyze-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* Error */
.error-box {
  border: 1px solid rgba(255, 77, 77, 0.4); background: rgba(255, 77, 77, 0.07);
  padding: 18px; font-size: 13px; color: var(--red); line-height: 1.6;
  font-family: 'JetBrains Mono', monospace;
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
          {status === "loading" ? "Analyzing Contract…" : "Analyze Contract →"}
        </button>

        {status === "error" && <div className="error-box">⚠ {error}</div>}
      </div>
    </>
  );
}
