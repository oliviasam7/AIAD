import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiLogin, apiRegister } from "../utils/auth";

const styles = `
.login-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--bg); padding: 40px 20px; position: relative; z-index: 1;
}
.login-card {
  width: 100%; max-width: 440px;
  border: 1px solid var(--border2); background: var(--surface);
  padding: 48px 44px;
}
.login-logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: var(--text); margin-bottom: 6px; }
.login-logo span { color: var(--accent); }
.login-sub { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--muted); letter-spacing: 1px; margin-bottom: 36px; }
.login-tabs { display: flex; border: 1px solid var(--border2); margin-bottom: 32px; }
.login-tab {
  flex: 1; padding: 10px; font-size: 12px; font-weight: 700;
  font-family: 'Syne', sans-serif; border: none; background: transparent;
  color: var(--muted); cursor: pointer; letter-spacing: 0.5px; transition: all .15s;
}
.login-tab:first-child { border-right: 1px solid var(--border2); }
.login-tab.active { background: var(--accent); color: #000; }
.login-field { margin-bottom: 18px; }
.login-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 7px; }
.login-input {
  width: 100%; background: var(--bg); border: 1px solid var(--border2);
  padding: 12px 14px; color: var(--text);
  font-family: 'JetBrains Mono', monospace; font-size: 13px; outline: none;
  transition: border-color .2s;
}
.login-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0,212,255,0.07); }
.login-btn {
  width: 100%; padding: 16px; margin-top: 8px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #000; border: none; font-family: 'Syne', sans-serif;
  font-size: 15px; font-weight: 800; cursor: pointer; letter-spacing: -0.3px;
  clip-path: polygon(10px 0%,100% 0%,100% calc(100% - 10px),calc(100% - 10px) 100%,0% 100%,0% 10px);
  transition: opacity .2s;
}
.login-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.login-error { margin-top: 14px; padding: 12px 14px; border: 1px solid rgba(255,77,77,0.35); background: rgba(255,77,77,0.07); font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--red); }
.login-free-note { margin-top: 20px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--muted); text-align: center; line-height: 1.6; }
.login-free-note span { color: var(--accent); }
`;

export default function Login({ onSuccess }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      let data;
      if (mode === "login") {
        data = await apiLogin(email, password);
      } else {
        if (!name.trim()) { setError("Name is required"); setBusy(false); return; }
        data = await apiRegister(name, email, password);
      }
      login(data.token, data.user);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <>
      <style>{styles}</style>
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">Fin<span>Core</span></div>
          <div className="login-sub">CONTRACT INTELLIGENCE PLATFORM</div>

          <div className="login-tabs">
            <button className={`login-tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setError(""); }}>
              Sign In
            </button>
            <button className={`login-tab ${mode === "register" ? "active" : ""}`} onClick={() => { setMode("register"); setError(""); }}>
              Create Account
            </button>
          </div>

          <form onSubmit={submit}>
            {mode === "register" && (
              <div className="login-field">
                <label className="login-label">Full Name</label>
                <input className="login-input" type="text" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div className="login-field">
              <label className="login-label">Email Address</label>
              <input className="login-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="login-field">
              <label className="login-label">Password</label>
              <input className="login-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            <button className="login-btn" type="submit" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </form>

          {error && <div className="login-error">⚠ {error}</div>}

          <div className="login-free-note">
            Free plan includes <span>3 contract analyses</span>.<br />
            Upgrade anytime for unlimited access.
          </div>
        </div>
      </div>
    </>
  );
}