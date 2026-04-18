import { useState } from 'react'
import UploadTab    from './components/UploadTab.jsx'
import ExplainTab   from './components/ExplainTab.jsx'
import RiskTab      from './components/RiskTab.jsx'
import FinancialTab from './components/FinancialTab.jsx'
import ChatTab      from './components/ChatTab.jsx'
import styles       from './App.module.css'
import FraudTab from './components/FraudTab.jsx'

const TABS = [
  { id: 'upload',    label: '① Upload'   },
  { id: 'explain',   label: '② Explanation' },
  { id: 'risk',      label: '③ Risk'     },
  { id: 'fraud', label: '④ Fraud' },
  { id: 'financial', label: '④ Financial' },
  { id: 'chat',      label: '⑤ AI Chat'  },
]

export default function App() {
  const [activeTab, setActiveTab]   = useState('upload')
  const [contractText, setContract] = useState('')
  const [results, setResults]       = useState(null)
  const [loading, setLoading]       = useState(false)

  function goTo(tab) {
    if (tab !== 'upload' && !results) return
    setActiveTab(tab)
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>CA</span>
            <div>
              <div className={styles.logoTitle}>Contract Analyzer</div>
              <div className={styles.logoSub}>AI-powered contract review</div>
            </div>
          </div>
          {results && (
            <span className={styles.pill} style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
              ✓ Contract analyzed
            </span>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <nav className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''} ${t.id !== 'upload' && !results ? styles.tabDisabled : ''}`}
              onClick={() => goTo(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className={styles.panel}>
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
          {activeTab === 'explain'   && <ExplainTab   data={results?.explain}   />}
          {activeTab === 'risk'      && <RiskTab      data={results?.risk}      />}
          {activeTab === 'fraud' && <FraudTab data={results?.fraud} />}
          {activeTab === 'financial' && <FinancialTab data={results?.financial} />}
          {activeTab === 'chat'      && <ChatTab      contractText={contractText} />}
        </div>
      </main>
    </div>
  )
}
