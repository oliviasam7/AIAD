import { useRef, useState } from 'react'
import styles from './UploadTab.module.css'
import { uploadFile, analyzeExplain, analyzeRisk, analyzeFraud, analyzeFinancial } from '../api.js'

const SAMPLE = `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into between TechCorp Solutions Pvt. Ltd. ("Service Provider") and ClientCo Enterprises ("Client") effective January 1, 2025.

1. SERVICES
Service Provider agrees to provide software development and maintenance services as outlined in Schedule A.

2. PAYMENT TERMS
Client shall pay all invoices within 30 days of receipt. Any payments not received within the due date shall accrue a penalty of 8% per month on the outstanding amount. Service Provider may suspend services for payments delayed beyond 45 days.

3. CONTRACT TERM
This Agreement shall remain in effect for 12 months and automatically renew unless terminated with 60 days written notice.

4. TERMINATION
Service Provider may terminate this agreement immediately upon any breach by Client. Client may terminate only with 90 days written notice and shall pay a termination fee equal to 3 months of service fees.

5. INTELLECTUAL PROPERTY
All work product, code, and deliverables produced under this Agreement shall remain the exclusive property of Service Provider unless otherwise agreed in writing.

6. LIABILITY
Service Provider's total liability shall not exceed the fees paid in the prior month. Client waives all rights to consequential or indirect damages.

7. GOVERNING LAW
This Agreement is governed by the laws of Karnataka, India. Disputes shall be resolved by arbitration in Bengaluru.

Monthly Service Fee: ₹1,00,000
Contract Value: ₹12,00,000`

export default function UploadTab({ contractText, setContract, setResults, setLoading, loading, onDone }) {
  const fileRef = useRef()
  const [drag, setDrag]     = useState(false)
  const [fileName, setFN]   = useState('')
  const [error, setError]   = useState('')
  const [progress, setProgress] = useState('')

  async function handleFile(file) {
    setError('')
    try {
      const { data } = await uploadFile(file)
      setContract(data.text)
      setFN(file.name)
    } catch {
      setError('Could not read file. Try a plain .txt file or paste text below.')
    }
  }

  async function analyze() {
    const text = contractText.trim()
    if (!text) { setError('Please upload a file or paste contract text.'); return }
    setError('')
    setLoading(true)
    setResults(null)
    try {
      setProgress('Extracting contract clauses...')
      const [exp, risk, fraud, fin] = await Promise.all([ analyzeExplain(text),
      analyzeRisk(text),
      analyzeFraud(text),
      analyzeFinancial(text),
      ])
      setResults({ explain: exp.data, risk: risk.data, fraud: fraud.data, financial: fin.data })
      setProgress('')
      onDone()
    } catch (e) {
      setError('Analysis failed: ' + (e.response?.data?.detail || e.message))
      setProgress('')
    }
    setLoading(false)
  }

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.dropzone} ${drag ? styles.dragOver : ''}`}
        onClick={() => fileRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
      >
        <input ref={fileRef} type="file" accept=".pdf,.txt" hidden onChange={e => handleFile(e.target.files[0])} />
        <div className={styles.icon}>📄</div>
        <p className={styles.dzTitle}>Drop a contract file here</p>
        <p className={styles.dzSub}>Supports .txt and .pdf &nbsp;·&nbsp; Click to browse</p>
        {fileName && <span className={styles.filePill}>✓ {fileName}</span>}
      </div>

      <div className={styles.divider}><span>or paste contract text</span></div>

      <textarea
        className={styles.textarea}
        placeholder="Paste your full contract text here..."
        value={contractText}
        onChange={e => { setContract(e.target.value); setFN('') }}
        rows={12}
      />

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={analyze} disabled={loading || !contractText}>
          {loading ? <><span className={styles.spinner} /> {progress || 'Analyzing…'}</> : 'Analyze Contract →'}
        </button>
        <button className={styles.btnGhost} onClick={() => { setContract(SAMPLE); setFN('') }} disabled={loading}>
          Load sample contract
        </button>
      </div>
    </div>
  )
}
