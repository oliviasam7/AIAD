import React, { useState } from "react";
import { translateContract } from "../utils/api";

const LANGUAGES = [
  { code: "Hindi",         flag: "🇮🇳" },
  { code: "Tamil",         flag: "🇮🇳" },
  { code: "Telugu",        flag: "🇮🇳" },
  { code: "Kannada",       flag: "🇮🇳" },
  { code: "Bengali",       flag: "🇮🇳" },
  { code: "Marathi",       flag: "🇮🇳" },
  { code: "Simple English",flag: "🔤" },
];

const styles = `
.trans-section {
  margin-top: 20px;
}
.trans-section-label {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--muted); letter-spacing: 2px; text-transform: uppercase;
  margin-bottom: 16px;
}
.trans-wrap {
  border: 1px solid var(--border2); overflow: hidden;
}
.trans-header {
  padding: 14px 20px; background: var(--surface2);
  border-bottom: 1px solid var(--border);
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  letter-spacing: 2px; text-transform: uppercase; color: var(--accent);
}
.trans-body {
  padding: 20px; display: flex; flex-direction: column;
  gap: 16px; background: var(--bg);
}
.lang-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 8px;
}
.lang-btn {
  padding: 10px 14px; font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  border: 1px solid var(--border2); background: var(--surface);
  color: var(--muted); cursor: pointer; transition: all .15s;
  display: flex; align-items: center; gap: 8px;
  text-align: left;
}
.lang-btn:hover {
  border-color: var(--accent); color: var(--text);
}
.lang-btn.active {
  border-color: var(--accent);
  background: rgba(0,212,255,0.08);
  color: var(--accent);
}
.trans-btn {
  padding: 16px; background: var(--accent); color: #000;
  border: none; font-family: 'Syne', sans-serif;
  font-size: 14px; font-weight: 800; cursor: pointer; width: 100%;
  transition: opacity .15s; letter-spacing: -0.3px;
  clip-path: polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px);
}
.trans-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.trans-error {
  font-family: 'JetBrains Mono', monospace; font-size: 12px;
  color: var(--red); padding: 12px; border: 1px solid rgba(255,77,77,0.3);
  background: rgba(255,77,77,0.07);
}
.trans-result {
  background: var(--surface2); border: 1px solid var(--border);
  padding: 20px; font-family: 'JetBrains Mono', monospace;
  font-size: 12px; color: #b0bec5; line-height: 1.9;
  white-space: pre-wrap; animation: fadeIn .4s ease;
}
.trans-result-label {
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--accent); margin-bottom: 12px;
  display: flex; align-items: center; gap: 8px;
}
.trans-result-label::after {
  content: ''; flex: 1; height: 1px; background: var(--border);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

export default function Translator({ contractText }) {
  const [language, setLanguage] = useState("Hindi");
  const [result, setResult]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function translate() {
    setLoading(true);
    setError("");
    setResult("");
    try {
      const text = await translateContract(contractText, language);
      setResult(text);
    } catch (e) {
      setError("Translation failed: " + e.message);
    }
    setLoading(false);
  }

  return (
    <>
      <style>{styles}</style>
      <div className="trans-section">
        <div className="trans-section-label">Multilingual Explanation</div>
        <div className="trans-wrap">
          <div className="trans-header">◉ Explain this contract in your language</div>
          <div className="trans-body">

            <div className="lang-grid">
              {LANGUAGES.map(({ code, flag }) => (
                <button
                  key={code}
                  className={`lang-btn ${language === code ? "active" : ""}`}
                  onClick={() => setLanguage(code)}
                >
                  <span>{flag}</span>
                  <span>{code}</span>
                </button>
              ))}
            </div>

            <button
              className="trans-btn"
              onClick={translate}
              disabled={loading}
            >
              {loading ? "Translating…" : `Explain in ${language} →`}
            </button>

            {error && <div className="trans-error">⚠ {error}</div>}

            {result && (
              <div className="trans-result">
                <div className="trans-result-label">{language}</div>
                {result}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}