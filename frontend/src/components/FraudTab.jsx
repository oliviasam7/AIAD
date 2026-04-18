import styles from './ResultTab.module.css'

const ALERT_COLOR = { Safe:'var(--green)', Caution:'var(--blue)', Warning:'var(--amber)', Alert:'var(--red)' }
const ALERT_BG    = { Safe:'var(--green-bg)', Caution:'var(--blue-bg)', Warning:'var(--amber-bg)', Alert:'var(--red-bg)' }
const SEV_COLOR   = { high:'var(--red)', medium:'var(--amber)', low:'var(--green)' }
const SEV_BG      = { high:'var(--red-bg)', medium:'var(--amber-bg)', low:'var(--green-bg)' }

export default function FraudTab({ data }) {
  if (!data) return <div className={styles.empty}>Analyze a contract first.</div>
  const score = data.fraud_score ?? 0
  const level = data.alert_level ?? 'Safe'
  const color = ALERT_COLOR[level]

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Fraud & Hidden Clause Detection</h2>
      <p className={styles.sub}>Identifies suspicious terms, hidden charges, and one-sided clauses.</p>

      <div className={styles.card} style={{ marginBottom: 16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
          <span className={styles.cardLabel} style={{ margin:0 }}>Fraud Risk Score</span>
          <span className={styles.badge} style={{ background:ALERT_BG[level], color, padding:'4px 12px', fontSize:13 }}>{level}</span>
        </div>
        <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:10 }}>
          <span style={{ fontSize:42, fontWeight:600, color, lineHeight:1 }}>{score}</span>
          <span style={{ fontSize:18, color:'var(--text3)' }}>/100</span>
        </div>
        <div className={styles.barTrack}>
          <div className={styles.barFill} style={{ width:`${score}%`, background:color }} />
        </div>
        {data.summary && <p style={{ fontSize:13, color:'var(--text2)', marginTop:10 }}>{data.summary}</p>}
      </div>

      {data.hidden_charges?.length > 0 && (
        <div className={styles.card} style={{ marginBottom:16 }}>
          <div className={styles.cardLabel}>Hidden Charges Detected</div>
          <ul className={styles.issueList}>
            {data.hidden_charges.map((c,i) => (
              <li key={i} className={styles.issueItem}>
                <span className={styles.dot} style={{ background:'var(--red)' }} />
                <div>
                  <strong style={{ fontSize:14 }}>{c.title}</strong>
                  {c.estimated_impact && <span className={styles.badge} style={{ background:'var(--red-bg)', color:'var(--red)', fontSize:11, marginLeft:8 }}>Impact: {c.estimated_impact}</span>}
                  <p style={{ fontSize:13, color:'var(--text2)', marginTop:3 }}>{c.detail}</p>
                  {c.benchmark && <p style={{ fontSize:12, color:'var(--amber)', marginTop:3, fontStyle:'italic' }}>⚠ {c.benchmark}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.suspicious_clauses?.length > 0 && (
        <div className={styles.card} style={{ marginBottom:16 }}>
          <div className={styles.cardLabel}>Suspicious Clauses</div>
          <ul className={styles.issueList}>
            {data.suspicious_clauses.map((c,i) => (
              <li key={i} className={styles.issueItem}>
                <span className={styles.dot} style={{ background:SEV_COLOR[c.severity] ?? 'var(--amber)' }} />
                <div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <strong style={{ fontSize:14 }}>{c.title}</strong>
                    <span className={styles.badge} style={{ background:SEV_BG[c.severity], color:SEV_COLOR[c.severity], fontSize:11 }}>{c.severity}</span>
                  </div>
                  <p style={{ fontSize:13, color:'var(--text2)', marginTop:3 }}>{c.issue}</p>
                  {c.benchmark && <p style={{ fontSize:12, color:'var(--amber)', marginTop:3, fontStyle:'italic' }}>⚠ {c.benchmark}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.recommendations?.length > 0 && (
        <div className={styles.card} style={{ background:'var(--amber-bg)', border:'1px solid var(--amber)' }}>
          <div className={styles.cardLabel} style={{ color:'var(--amber)' }}>Recommendations before signing</div>
          {data.recommendations.map((r,i) => (
            <div key={i} className={styles.issueItem} style={{ borderColor:'rgba(0,0,0,0.08)' }}>
              <span className={styles.dot} style={{ background:'var(--amber)' }} />
              <p style={{ fontSize:13, color:'var(--text)' }}>{r}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}