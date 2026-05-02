import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const styles = `
.nav {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40px; height: 64px;
  background: rgba(6, 8, 16, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  animation: fadeIn .5s ease both;
}
.nav::after {
  content: '';
  position: absolute; bottom: 0; left: 0;
  height: 1px; width: 0%;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  animation: navLine 2s ease .5s forwards;
}
@keyframes navLine { to { width: 100%; } }
@keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }

.nav-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.nav-logomark {
  width: 34px; height: 34px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex; align-items: center; justify-content: center;
  font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 500;
  color: #000;
  clip-path: polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%);
  transition: transform .3s ease, box-shadow .3s ease;
}
.nav-logo:hover .nav-logomark {
  transform: rotate(45deg) scale(1.1);
  box-shadow: 0 0 20px rgba(0,212,255,0.4);
}
.nav-name { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: var(--text); }
.nav-name span { color: var(--accent); }
.nav-tag {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--accent); border: 1px solid rgba(0, 212, 255, 0.3);
  padding: 3px 10px; letter-spacing: 1.5px; text-transform: uppercase;
  background: rgba(0, 212, 255, 0.05);
}
.nav-links { display: flex; gap: 4px; align-items: center; }
.nav-link {
  font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer;
  letter-spacing: 0.5px; transition: color .2s;
  padding: 6px 12px; border-radius: 6px; position: relative;
}
.nav-link:hover { color: var(--text); background: rgba(255,255,255,0.04); }
.nav-link.active { color: var(--accent); }

.nav-link-badge {
  display: inline-block; margin-left: 5px;
  padding: 1px 6px; border-radius: 99px;
  font-size: 9px; font-weight: 700; letter-spacing: 0.5px;
  font-family: 'JetBrains Mono', monospace; vertical-align: middle; line-height: 1.6;
}
.badge-new  { background: rgba(0,230,118,0.15); color: var(--green); border: 1px solid rgba(0,230,118,0.3); }
.badge-beta { background: rgba(0,212,255,0.12); color: var(--accent); border: 1px solid rgba(0,212,255,0.3); }

/* Docs link gets a subtle doc icon feel */
.nav-link-docs {
  display: inline-flex; align-items: center; gap: 5px;
}

.nav-btn {
  background: var(--accent); color: #000; border: none;
  padding: 8px 20px; font-family: 'Syne', sans-serif; font-size: 12px;
  font-weight: 700; cursor: pointer; letter-spacing: 0.5px;
  clip-path: polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px);
  transition: opacity .2s, box-shadow .2s;
  position: relative; overflow: hidden;
}
.nav-btn::before {
  content: '';
  position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  transition: left .4s ease;
}
.nav-btn:hover::before { left: 100%; }
.nav-btn:hover { opacity: 0.9; box-shadow: 0 0 16px rgba(0,212,255,0.3); }
.nav-btn.outline {
  background: transparent; border: 1px solid var(--border2); color: var(--muted);
  clip-path: none;
}
.nav-btn.outline:hover { border-color: var(--accent); color: var(--text); }
.nav-user {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  color: var(--muted); display: flex; align-items: center; gap: 10px;
}
.nav-plan-pill {
  padding: 2px 10px; font-size: 9px; font-weight: 700; letter-spacing: 1.5px;
  text-transform: uppercase; border: 1px solid rgba(0,212,255,0.3);
  color: var(--accent); background: rgba(0,212,255,0.05);
  font-family: 'JetBrains Mono', monospace;
}
.theme-toggle { padding: 6px 10px; font-size: 14px; }
`;

export default function Navbar({ onPricing, onLogin, setPage }) {
  const { user, logout } = useAuth();
  
  return (
    <>
      <style>{styles}</style>
      <nav className="nav">
        <div className="nav-logo" onClick={() => setPage("home")}>
          <div className="nav-logomark">FC</div>
          <span className="nav-name">Fin<span>Core</span></span>
        </div>

        <div className="nav-links">
          <span className="nav-link" onClick={() => setPage("home")}>Analyze</span>
          <span className="nav-link" onClick={() => setPage("compare")}>
            Compare
            <span className="nav-link-badge badge-new">NEW</span>
          </span>
          <span className="nav-link" onClick={() => setPage("tracker")}>
            Tracker
            <span className="nav-link-badge badge-beta">BETA</span>
          </span>
          <span className="nav-link" onClick={onPricing}>Pricing</span>
          <span className="nav-link nav-link-docs" onClick={() => setPage("docs")}>
             Docs
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="nav-tag">AI-Powered</span>
          <ThemeToggle />
          {user ? (
            <div className="nav-user">
              <span>{user.name}</span>
              <span className="nav-plan-pill">{user.plan}</span>
              <button className="nav-btn outline" onClick={logout}>Sign Out</button>
            </div>
          ) : (
            <button className="nav-btn" onClick={onLogin}>Sign In</button>
          )}
        </div>
      </nav>
    </>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem("fc_theme") || "dark");

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("fc_theme", theme);
  }, [theme]);

  return (
    <button className="nav-btn outline theme-toggle" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}>
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}