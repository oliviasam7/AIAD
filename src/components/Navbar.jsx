import React from "react";

const styles = `
.nav {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40px; height: 64px;
  background: rgba(6, 8, 16, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}
.nav-logo { display: flex; align-items: center; gap: 10px; }
.nav-logomark {
  width: 34px; height: 34px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex; align-items: center; justify-content: center;
  font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 500;
  color: #000;
  clip-path: polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%);
}
.nav-name { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: var(--text); }
.nav-name span { color: var(--accent); }
.nav-tag {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--accent); border: 1px solid rgba(0, 212, 255, 0.3);
  padding: 3px 10px; letter-spacing: 1.5px; text-transform: uppercase;
  background: rgba(0, 212, 255, 0.05);
}
.nav-links { display: flex; gap: 28px; align-items: center; }
.nav-link { font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer; letter-spacing: 0.5px; transition: color .2s; }
.nav-link:hover { color: var(--text); }
.nav-btn {
  background: var(--accent); color: #000; border: none;
  padding: 8px 20px; font-family: 'Syne', sans-serif; font-size: 12px;
  font-weight: 700; cursor: pointer; letter-spacing: 0.5px;
  clip-path: polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px);
  transition: opacity .2s;
}
.nav-btn:hover { opacity: 0.85; }
`;

export default function Navbar() {
  return (
    <>
      <style>{styles}</style>
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-logomark">FC</div>
          <span className="nav-name">Fin<span>Core</span></span>
        </div>
        <div className="nav-links">
          <span className="nav-link">Products</span>
          <span className="nav-link">Pricing</span>
          <span className="nav-link">Enterprise</span>
          <span className="nav-link">Docs</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="nav-tag">AI-Powered</span>
          <button className="nav-btn">Get Started</button>
        </div>
      </nav>
    </>
  );
}
