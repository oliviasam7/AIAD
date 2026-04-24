import styles from './ResultTab.module.css'

function fmt(n) {
  if (n == null) return '—'
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + 'L'
  return '₹' + n.toLocaleString('en-IN')
}

export default function FinancialTab({ data }) {
  if (!data) return <div className={styles.empty}>Analyze a contract first.</div>

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Financial Impact</h2>
      <p className={styles.sub}>Key financial figures and penalty scenarios derived from the contract.</p>

      {(data.monthly_fee || data.contract_value) && (
        <div className={styles.metricRow}>
          {data.monthly_fee    && <Metric label="Monthly Fee"     value={fmt(data.monthly_fee)}    />}
          {data.contract_value && <Metric label="Contract Value"  value={fmt(data.contract_value)} />}
        </div>
      )}

      {data.scenarios?.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div className={styles.sectionLabel}>Penalty / Termination Scenarios</div>
          {data.scenarios.map((s, i) => (
            <div key={i} className={styles.card} style={{ marginBottom: 12 }}>
              <div className={styles.cardLabel}>{s.name}</div>
              {s.formula && <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6, fontFamily: 'DM Mono, monospace' }}>{s.formula}</div>}
              <div style={{ fontSize: 32, fontWeight: 600, color: 'var(--red)' }}>{fmt(s.amount)}</div>
              {s.description && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>{s.description}</p>}
            </div>
          ))}
        </div>
      )}

      {data.summary && (
        <div className={styles.card} style={{ marginTop: 12 }}>
          <div className={styles.cardLabel}>Summary</div>
          <p style={{ fontSize: 14, color: 'var(--text)' }}>{data.summary}</p>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{value}</div>
    </div>
  )
}
