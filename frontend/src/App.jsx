import { useState, useRef, useEffect } from 'react'
import UploadTab from './components/UploadTab.jsx'
import ExplainTab from './components/ExplainTab.jsx'
import RiskTab from './components/RiskTab.jsx'
import FinancialTab from './components/FinancialTab.jsx'
import ChatTab from './components/ChatTab.jsx'
import FraudTab from './components/FraudTab.jsx'
import PlansSection from './components/PlansSection.jsx'
import TranslateTab from './components/TranslateTab.jsx'
import styles from './App.module.css'
import Login from './components/Login.jsx'

const ANALYSIS_TABS = [
  { id: 'upload', label: '① Upload' },
  { id: 'explain', label: '② Explanation' },
  { id: 'risk', label: '③ Risk' },
  { id: 'fraud', label: '④ Fraud' },
  { id: 'financial', label: '⑤ Financial' },
  { id: 'chat', label: '⑥ AI Chat' },
]

const RECENT = [
  { icon: '📋', name: 'Employment Contract — Infosys', time: '2 hours ago · 18 pages', badge: 'Low Risk · 28', bc: 'bGreen' },
  { icon: '⚠️', name: 'Vendor Agreement — TechPark Ltd', time: 'Yesterday · 34 pages', badge: 'High Risk · 84', bc: 'bRed' },
  { icon: '🏠', name: 'Lease Agreement — Prestige Group', time: '3 days ago · 12 pages', badge: 'Medium · 56', bc: 'bAmber' },
  { icon: '🔒', name: 'NDA — Wipro Digital', time: '4 days ago · 8 pages', badge: 'Reviewed', bc: 'bBlue' },
  { icon: '💼', name: 'Freelance Contract — Swiggy', time: '1 week ago · 6 pages', badge: 'Low Risk · 31', bc: 'bGreen' },
]

export default function App() {
  const [activeNav, setNav] = useState('dashboard')
  const [activeTab, setActiveTab] = useState('upload')
  const [contractText, setContract] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const plansRef = useRef()
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('fc-theme') || 'dark')
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fc-user')) } catch { return null }
  })
  const isLoggedIn = !!user && localStorage.getItem('fc-logged-in') === 'true'
  function handleLogin(userInfo) { setUser(userInfo) }
  function handleLogout() {
    localStorage.removeItem('fc-logged-in')
    localStorage.removeItem('fc-user')
    setUser(null)
  }

  // Resolve 'system' to actual dark/light
  function resolveTheme(mode) {
    if (mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return mode === 'light' ? 'light' : 'dark'
  }

  // Apply theme on every change — sets data-theme on <html>
  useEffect(() => {
    const apply = () => {
      document.documentElement.setAttribute('data-theme', resolveTheme(themeMode))
    }
    apply()
    localStorage.setItem('fc-theme', themeMode)
    if (themeMode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [themeMode])

  function goTo(tab) {
    if (tab !== 'upload' && !results) return
    setActiveTab(tab)
  }

  function goAnalysis() {
    setNav('analysis')
    setActiveTab('upload')
  }

  const navGroups = [
    {
      group: 'Workspace', items: [
        { id: 'dashboard', icon: '◈', label: 'Dashboard' },
        { id: 'analysis', icon: '◉', label: 'Contracts' },
        { id: 'queue', icon: '◎', label: 'Analysis Queue' },
        { id: 'history', icon: '◇', label: 'AI Chat History' },
      ]
    },
    {
      group: 'Insights', items: [
        { id: 'reports', icon: '▤', label: 'Risk Reports' },
        { id: 'fin', icon: '▦', label: 'Financials' },
        { id: 'trans', icon: '▣', label: 'Translations' },
      ]
    },
    {
      group: 'Account', items: [
        { id: 'billing', icon: '◻', label: 'Billing & Plans' },
        { id: 'settings', icon: '◌', label: 'Settings' },
      ]
    },
  ]

  const pageMeta = {
    dashboard: {
      title: 'Dashboard',
      sub: (() => {
        const now = new Date()
        return now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      })()
    },
    analysis: { title: 'New Analysis', sub: 'Upload or paste a contract' },
    billing: { title: 'Billing & Plans', sub: 'Manage your subscription' },
    trans: { title: 'Translations', sub: 'Translate contract summaries into Indian languages' },
  }[activeNav] || { title: 'FinCore', sub: '' }

  function getInitials(userInfo) {
    if (!userInfo) return 'FC'
    const id = userInfo.email || userInfo.phone || ''
    if (userInfo.email) {
      const name = userInfo.email.split('@')[0] // e.g. "surapriya"
      const parts = name.split(/[._-]/)
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase() // "su" + "pr" → "SP"
      }
      return name.substring(0, 2).toUpperCase()           // "surapriya" → "SU"
    }
    return id.substring(0, 2).toUpperCase()
  }

  if (!isLoggedIn) return <Login onLogin={handleLogin} />
  return (
    <div className={styles.shell}>

      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>FC</div>
            <div className={styles.logoName}>Fin<span>Core</span></div>
          </div>
        </div>

        <div className={styles.planBadge}>
          <div>
            <div className={styles.planTier}>Current Plan</div>
            <div className={styles.planNameB}>Free Tier</div>
          </div>
          <div className={styles.planUsage}>3 / 5</div>
        </div>

        <button className={styles.upgradeBtn}
          onClick={() => { setNav('dashboard'); setTimeout(() => plansRef.current?.scrollIntoView({ behavior: 'smooth' }), 120) }}>
          Upgrade to Pro ↑
        </button>

        {navGroups.map(g => (
          <div key={g.group} className={styles.navGroup}>
            <div className={styles.navLabel}>{g.group}</div>
            {g.items.map(item => (
              <div key={item.id}
                className={`${styles.navItem} ${activeNav === item.id ? styles.navActive : ''}`}
                onClick={() => setNav(item.id)}>
                <span className={styles.navIcon}>{item.icon}</span>{item.label}
              </div>
            ))}
          </div>
        ))}

        <div className={styles.usageSection}>
          <div className={styles.usageLabel}>Monthly Usage</div>
          <div className={styles.usageBar}><div className={styles.usageFill} style={{ width: '60%' }} /></div>
          <div className={styles.usageStats}><span>3 of 5 analyses</span><span>60%</span></div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className={styles.mainWrap}>

        {/* TOPBAR */}
        <div className={styles.topbar}>
          <div>
            <div className={styles.pageTitle}>{pageMeta.title}</div>
            <div className={styles.pageSub}>{pageMeta.sub}</div>
          </div>
          <div className={styles.topbarRight}>
            {/* Theme Switcher */}
            <div className={styles.themeSw}>
              {[
                { id: 'dark', icon: '🌙', label: 'Dark' },
                { id: 'light', icon: '☀️', label: 'Light' },
                { id: 'system', icon: '💻', label: 'System' },
              ].map(t => (
                <button
                  key={t.id}
                  className={`${styles.themeBtn} ${themeMode === t.id ? styles.themeBtnActive : ''}`}
                  onClick={() => setThemeMode(t.id)}
                  title={t.label}
                >
                  <span className={styles.themeBtnIcon}>{t.icon}</span>
                  <span className={styles.themeBtnLabel}>{t.label}</span>
                </button>
              ))}
            </div>
            <button className={styles.tbBtn}>Export</button>
            <button className={`${styles.tbBtn} ${styles.tbBtnPrimary}`} onClick={goAnalysis}>+ New Analysis</button>
            <div className={styles.notif}>🔔<div className={styles.notifDot} /></div>
            <button className={styles.tbBtn} onClick={handleLogout}>Sign out</button>
            <div className={styles.avatarChip}>
              <div className={styles.avatar}>
                {getInitials(user)}
              </div>
              <div className={styles.avatarInfo}>
                <div className={styles.avatarName}>
                  {user?.email?.split('@')[0] || user?.phone || 'User'}
                </div>
                <div className={styles.avatarEmail}>
                  {user?.email || user?.phone || ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── DASHBOARD ── */}
        {activeNav === 'dashboard' && (
          <div className={styles.content}>

            {/* Stats */}
            <div className={styles.statsRow}>
              {[
                { label: 'Total Analysed', val: '24', delta: '↑ 4 this month', dir: 'up', icon: '📄', color: 'var(--text)' },
                { label: 'Avg Risk Score', val: '62', delta: '↑ 8 pts avg', dir: 'down', icon: '⚠️', color: 'var(--gold)' },
                { label: 'High Risk Flags', val: '7', delta: '↓ 2 resolved', dir: 'up', icon: '🚩', color: 'var(--red)' },
                { label: 'AI Queries', val: '143', delta: '↑ 23 this week', dir: 'up', icon: '💬', color: 'var(--text)' },
              ].map(s => (
                <div key={s.label} className={styles.statCard}>
                  <div className={styles.statLabel}>{s.label}</div>
                  <div className={styles.statVal} style={{ color: s.color }}>{s.val}</div>
                  <div className={`${styles.statDelta} ${s.dir === 'up' ? styles.deltaUp : styles.deltaDown}`}>{s.delta}</div>
                  <div className={styles.statIcon}>{s.icon}</div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className={styles.qaGrid}>
              {[
                { icon: '📂', text: 'Upload Contract', sub: 'PDF, DOCX, TXT', action: goAnalysis },
                { icon: '⚡', text: 'Quick Analysis', sub: 'Paste & analyze', action: goAnalysis },
                { icon: '🌐', text: 'Translate', sub: '6 Indian languages', action: goAnalysis },
                {
                  icon: '👑', text: 'Upgrade Plan', sub: 'Unlock all features', subColor: 'var(--accent)',
                  action: () => plansRef.current?.scrollIntoView({ behavior: 'smooth' })
                },
              ].map(q => (
                <div key={q.text} className={styles.qaItem} onClick={q.action}>
                  <div className={styles.qaIcon}>{q.icon}</div>
                  <div>
                    <div className={styles.qaText}>{q.text}</div>
                    <div className={styles.qaSub} style={q.subColor ? { color: q.subColor } : {}}>{q.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mid grid */}
            <div className={styles.midGrid}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <div className={styles.cardTitle}>Recent Activity</div>
                    <div className={styles.cardSub}>Last 5 contracts analyzed</div>
                  </div>
                </div>
                {RECENT.map((a, i) => (
                  <div key={i} className={styles.actItem}>
                    <div className={styles.actIcon}>{a.icon}</div>
                    <div>
                      <div className={styles.actName}>{a.name}</div>
                      <div className={styles.actTime}>{a.time}</div>
                    </div>
                    <div className={`${styles.actBadge} ${styles[a.bc]}`}>{a.badge}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    <div>
                      <div className={styles.cardTitle}>Risk Distribution</div>
                      <div className={styles.cardSub}>This month</div>
                    </div>
                  </div>
                  <div className={styles.barChart}>
                    {[{ h: 40, label: 'W1' }, { h: 75, label: 'W2', hi: true }, { h: 55, label: 'W3' }, { h: 90, label: 'W4', hi: true }].map(b => (
                      <div key={b.label} className={styles.barCol}>
                        <div className={`${styles.barFill} ${b.hi ? styles.barHi : ''}`} style={{ height: `${b.h}%` }} />
                        <div className={styles.barLbl}>{b.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    <div>
                      <div className={styles.cardTitle}>Open Risk Items</div>
                      <div className={styles.cardSub}>Needs attention</div>
                    </div>
                  </div>
                  {[
                    { name: 'Penalty Clause', score: 84, color: 'var(--red)' },
                    { name: 'IP Ownership', score: 56, color: 'var(--gold)' },
                    { name: 'Early Termination', score: 28, color: 'var(--accent)' },
                  ].map(r => (
                    <div key={r.name} className={styles.riskItem}>
                      <div className={styles.riskItemHead}>
                        <div className={styles.riskName}>{r.name}</div>
                        <div className={styles.riskScore} style={{ color: r.color }}>{r.score}</div>
                      </div>
                      <div className={styles.riskBarBg}>
                        <div className={styles.riskBarFill} style={{ width: `${r.score}%`, background: r.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Plans */}
            <div ref={plansRef}><PlansSection /></div>
          </div>
        )}

        {/* ── ANALYSIS ── */}
        {activeNav === 'analysis' && (
          <div className={styles.analysisWrap}>
            <nav className={styles.analysisTabs}>
              {ANALYSIS_TABS.map(t => (
                <button key={t.id}
                  className={`${styles.aTab} ${activeTab === t.id ? styles.aTabActive : ''} ${t.id !== 'upload' && !results ? styles.aTabDisabled : ''}`}
                  onClick={() => goTo(t.id)}>
                  {t.label}
                </button>
              ))}
            </nav>
            <div className={styles.analysisPanel}>
              {activeTab === 'upload' && (
                <UploadTab
                  contractText={contractText}
                  setContract={setContract}
                  setResults={setResults}
                  setLoading={setLoading}
                  loading={loading}
                  onDone={() => setActiveTab('explain')}
                />
              )}
              {activeTab === 'explain' && <ExplainTab data={results?.explain} />}
              {activeTab === 'risk' && <RiskTab data={results?.risk} />}
              {activeTab === 'fraud' && <FraudTab data={results?.fraud} />}
              {activeTab === 'financial' && <FinancialTab data={results?.financial} />}
              {activeTab === 'chat' && <ChatTab contractText={contractText} />}
            </div>
          </div>
        )}

        {/* ── BILLING ── */}
        {activeNav === 'billing' && (
          <div className={styles.content}><PlansSection /></div>
        )}

        {/* ── TRANSLATIONS ── */}
        {activeNav === 'trans' && (
          <div className={styles.content}>
            <TranslateTab contractText={contractText} />
          </div>
        )}

        {/* ── OTHER PAGES ── */}
        {!['dashboard', 'analysis', 'billing', 'trans'].includes(activeNav) && (
          <div className={styles.content}>
            <div className={styles.emptyState}>
              <div className={styles.emptyGlyph}>🚧</div>
              <div className={styles.emptyTitle}>Coming soon</div>
              <div className={styles.emptySub}>This section is under construction. Check back soon.</div>
            </div>
          </div>
        )}

        <footer className={styles.footer}>
          <div className={styles.footerLeft}>© 2026 <span>FinCore</span> · Contract Intelligence Platform</div>
          <div className={styles.footerRight}>AI analysis is for informational purposes only and does not constitute legal advice. Always consult a qualified attorney.</div>
        </footer>
      </div>
    </div>
  )
}
