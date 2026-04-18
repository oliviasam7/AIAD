import styles from './ResultTab.module.css'

export default function ExplainTab({ data }) {
  if (!data) return <div className={styles.empty}>Analyze a contract first.</div>

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Contract Explanation</h2>
      <p className={styles.sub}>Key clauses extracted and explained in plain language.</p>
      <div className={styles.grid}>
        {data.items?.map(item => (
          <div key={item.key} className={styles.card}>
            <div className={styles.cardLabel}>{item.label}</div>
            <div className={styles.cardValue}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
