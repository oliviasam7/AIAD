import styles from './QueuePage.module.css'

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

function fraudColor(level) {
  const map = { Alert: 'var(--red)', Warning: 'var(--amber)', Caution: 'var(--gold)', Safe: 'var(--accent)' }
  return map[level] || 'var(--text3)'
}

function fraudBg(level) {
  const map = { Alert: 'var(--red-bg)', Warning: 'var(--amber-bg)', Caution: 'var(--amber-bg)', Safe: 'var(--green-bg)' }
  return map[level] || 'transparent'
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function QueuePage({ queue, onViewResults }) {
  if (!queue || queue.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.empty}>
          <div className={styles.emptyGlyph}>📭</div>
          <div className={styles.emptyTitle}>No contracts analyzed yet</div>
          <div className={styles.emptySub}>
            Start by uploading a contract in New Analysis.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.countBadge}>{queue.length} contract{queue.length !== 1 ? 's' : ''} this session</div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Contract</th>
              <th>Analyzed</th>
              <th>Risk Score</th>
              <th>Risk Level</th>
              <th>Fraud Alert</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((entry) => (
              <tr key={entry.id} className={styles.row}>
                <td>
                  <div className={styles.contractName}>
                    <span className={styles.docIcon}>📄</span>
                    <div>
                      <div className={styles.nameText}>{entry.name}</div>
                      <div className={styles.nameLen}>
                        {entry.contractText ? `${Math.ceil(entry.contractText.length / 5)} words` : ''}
                      </div>
                    </div>
                  </div>
                </td>
                <td className={styles.dateCell}>{formatDate(entry.analyzedAt)}</td>
                <td>
                  <div className={styles.scoreCell}>
                    <div
                      className={styles.scoreBadge}
                      style={{ background: riskBg(entry.riskScore), color: riskColor(entry.riskScore) }}
                    >
                      {entry.riskScore}
                    </div>
                    <div className={styles.scoreBar}>
                      <div
                        className={styles.scoreBarFill}
                        style={{ width: `${entry.riskScore}%`, background: riskColor(entry.riskScore) }}
                      />
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={styles.levelBadge}
                    style={{ background: riskBg(entry.riskScore), color: riskColor(entry.riskScore) }}
                  >
                    {entry.riskLevel}
                  </span>
                </td>
                <td>
                  <span
                    className={styles.fraudBadge}
                    style={{ background: fraudBg(entry.fraudLevel), color: fraudColor(entry.fraudLevel) }}
                  >
                    {entry.fraudLevel}
                  </span>
                </td>
                <td>
                  <button
                    className={styles.viewBtn}
                    onClick={() => onViewResults(entry)}
                  >
                    View Results →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
