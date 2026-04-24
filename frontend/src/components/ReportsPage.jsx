import styles from './ReportsPage.module.css'

function riskColor(score) {
  if (score >= 70) return 'var(--red)'
  if (score >= 40) return 'var(--amber)'
  return 'var(--accent)'
}

function riskBg(score) {
  if (score >= 70) return 'var(--red-bg)'
  if (score >= 40) return 'var(--amber-bg)'
  return 'var(--green-bg)'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function avg(arr) {
  if (!arr.length) return 0
  return Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
}

export default function ReportsPage({ queue }) {
  if (!queue || queue.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.empty}>
          <div className={styles.emptyGlyph}>📊</div>
          <div className={styles.emptyTitle}>No data yet</div>
          <div className={styles.emptySub}>
            Analyze a contract in New Analysis to see aggregated risk intelligence here.
          </div>
        </div>
      </div>
    )
  }

  const scores = queue.map((e) => e.riskScore)
  const avgScore = avg(scores)
  const highRisk = queue.filter((e) => e.riskScore >= 70).length
  const safe = queue.filter((e) => e.riskScore < 40).length
  const maxScore = Math.max(...scores, 1)

  const sorted = [...queue].sort((a, b) => b.riskScore - a.riskScore)

  return (
    <div className={styles.wrap}>
      {/* Section 1 — Summary metrics */}
      <div className={styles.sectionLabel}>Summary Metrics</div>
      <div className={styles.metricsRow}>
        {[
          { label: 'Total Analyzed', value: queue.length, icon: '📄', color: 'var(--text)' },
          { label: 'Avg Risk Score', value: avgScore, icon: '⚠️', color: avgScore >= 70 ? 'var(--red)' : avgScore >= 40 ? 'var(--amber)' : 'var(--accent)' },
          { label: 'High Risk Contracts', value: highRisk, icon: '🚩', color: 'var(--red)' },
          { label: 'Safe Contracts', value: safe, icon: '✅', color: 'var(--accent)' },
        ].map((m) => (
          <div key={m.label} className={styles.metricCard}>
            <div className={styles.metricIcon}>{m.icon}</div>
            <div className={styles.metricVal} style={{ color: m.color }}>{m.value}</div>
            <div className={styles.metricLabel}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Section 2 — Risk table */}
      <div className={styles.sectionLabel}>Risk Breakdown</div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Contract Name</th>
              <th>Risk Score</th>
              <th>Risk Level</th>
              <th>Top Issue</th>
              <th>Fraud Alert</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry) => {
              const topIssue = entry.results?.risk?.issues?.[0]?.title || '—'
              return (
                <tr key={entry.id} className={styles.row}>
                  <td>
                    <div className={styles.nameCell}>
                      <span>📄</span>
                      <span className={styles.nameText}>{entry.name}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={styles.scoreBadge}
                      style={{ background: riskBg(entry.riskScore), color: riskColor(entry.riskScore) }}
                    >
                      {entry.riskScore}
                    </span>
                  </td>
                  <td>
                    <span
                      className={styles.levelBadge}
                      style={{ background: riskBg(entry.riskScore), color: riskColor(entry.riskScore) }}
                    >
                      {entry.riskLevel}
                    </span>
                  </td>
                  <td className={styles.issueCell}>{topIssue}</td>
                  <td>
                    <span className={styles.fraudBadge}>{entry.fraudLevel}</span>
                  </td>
                  <td className={styles.dateCell}>{formatDate(entry.analyzedAt)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Section 3 — Bar chart (only if 1+ contracts) */}
      <div className={styles.sectionLabel}>Risk Score Comparison</div>
      <div className={styles.chartCard}>
        <div className={styles.chart}>
          {sorted.map((entry) => (
            <div key={entry.id} className={styles.chartCol}>
              <div className={styles.chartBarWrap}>
                <div className={styles.chartScoreLabel} style={{ color: riskColor(entry.riskScore) }}>
                  {entry.riskScore}
                </div>
                <div
                  className={styles.chartBar}
                  style={{
                    height: `${(entry.riskScore / maxScore) * 100}%`,
                    background: riskColor(entry.riskScore),
                    opacity: 0.85,
                  }}
                />
              </div>
              <div className={styles.chartLabel} title={entry.name}>
                {entry.name.length > 14 ? entry.name.slice(0, 14) + '…' : entry.name}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.chartAxis}>
          {[0, 25, 50, 75, 100].reverse().map((v) => (
            <div key={v} className={styles.chartAxisTick}>{v}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
