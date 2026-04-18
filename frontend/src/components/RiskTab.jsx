import styles from './ResultTab.module.css'

const SEV_COLOR = { high: 'var(--red)', medium: 'var(--amber)', low: 'var(--green)' }
const SEV_BG    = { high: 'var(--red-bg)', medium: 'var(--amber-bg)', low: 'var(--green-bg)' }

export default function RiskTab({ data }) {
  if (!data) return <div className={styles.empty}>Analyze a contract first.</div>

  const score = data.score ?? 50
  const barColor = score >= 70 ? 'var(--red)' : score >= 40 ? 'var(--amber)' : 'var(--green)'
  const levelBg  = score >= 70 ? 'var(--red-bg)' : score >= 40 ? 'var(--amber-bg)' : 'var(--green-bg)'
  const levelCol = score >= 70 ? 'var(--red)' : score >= 40 ? 'var(--amber)' : 'var(--green)'

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Risk Detection</h2>
      <p className={styles.sub}>Automated analysis of potentially unfavorable contract clauses.</p>

      <div className={styles.card} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span className={styles.cardLabel} style={{ margin: 0 }}>Risk Score</span>
          <span className={styles.badge} style={{ background: levelBg, color: levelCol }}>
            {data.level ?? 'Medium'} Risk
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 42, fontWeight: 600, color: barColor, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 18, color: 'var(--text3)' }}>/100</span>
        </div>
        <div className={styles.barTrack}>
          <div className={styles.barFill} style={{ width: `${score}%`, background: barColor }} />
        </div>
        {data.summary && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 10 }}>{data.summary}</p>}
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel}>Detected Issues</div>
        {data.issues?.length ? (
          <ul className={styles.issueList}>
            {data.issues.map((issue, i) => (
              <li key={i} className={styles.issueItem}>
                <span className={styles.dot} style={{ background: SEV_COLOR[issue.severity] ?? 'var(--text3)' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 14 }}>{issue.title}</strong>
                    <span className={styles.badge} style={{ background: SEV_BG[issue.severity], color: SEV_COLOR[issue.severity], fontSize: 11 }}>
                      {issue.severity}
                    </span>
                  </div>
                  {issue.detail && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{issue.detail}</p>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>No significant issues detected.</p>
        )}
      </div>
    </div>
  )
}
