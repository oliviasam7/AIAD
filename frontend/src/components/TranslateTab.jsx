import { useState } from 'react'
import { translateContract } from '../api'
import styles from './TranslateTab.module.css'

const LANGUAGES = ['Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali']

export default function TranslateTab({ contractText }) {
  const [selectedLang, setSelectedLang] = useState('Hindi')
  const [result, setResult]             = useState(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  const noContract = !contractText?.trim()

  async function handleTranslate() {
    if (noContract || loading) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await translateContract(contractText, selectedLang)
      setResult(res.data)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Translation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerIcon}>🌐</span>
        <div>
          <div className={styles.title}>Contract Translation</div>
          <div className={styles.sub}>
            AI-powered translation of your contract summary into 6 Indian languages
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <label className={styles.selectLabel}>Target Language</label>
        <select
          className={styles.select}
          value={selectedLang}
          onChange={e => setSelectedLang(e.target.value)}
          disabled={loading}
        >
          {LANGUAGES.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>

        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleTranslate}
          disabled={noContract || loading}
        >
          {loading ? (
            <>
              <span className={styles.spinner} />
              Translating…
            </>
          ) : (
            '🌐 Translate'
          )}
        </button>
      </div>

      {/* No contract notice */}
      {noContract && (
        <div className={styles.notice}>
          <span>📄</span>
          <span>Please upload and analyze a contract first.</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className={styles.error}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={styles.result}>
          {/* English Summary */}
          <div className={styles.resultSection}>
            <div className={styles.resultLabel}>🇬🇧 English Summary</div>
            <div className={styles.resultText}>{result.summary_en}</div>
          </div>

          {/* Translation */}
          <div className={`${styles.resultSection} ${styles.resultSectionAccent}`}>
            <div className={styles.resultLabelRow}>
              <div className={styles.resultLabel}>🌏 {result.language} Translation</div>
              <button
                className={styles.copyBtn}
                onClick={() => navigator.clipboard.writeText(result.translated_text)}
              >
                📋 Copy
              </button>
            </div>
            <div className={`${styles.resultText} ${styles.resultTextTranslated}`}>
              {result.translated_text}
            </div>
          </div>

          <p className={styles.disclaimer}>
            ⚖️ This is an AI-generated translation for informational purposes only.
            Consult a qualified legal translator for official use.
          </p>
        </div>
      )}
    </div>
  )
}
