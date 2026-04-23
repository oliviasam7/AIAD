import { useState, useRef } from 'react'
import styles from './Login.module.css'
import { auth } from '../firebase.js'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  sendEmailVerification,
  createUserWithEmailAndPassword
} from 'firebase/auth'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('email')
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const confirmRef = useRef(null)     // stores Firebase SMS confirmation
  const recaptchaRef = useRef(null)   // stores recaptcha widget

  // ── OTP box auto-advance ──────────────────────────────────────
  const handleOtpChange = (val, i, setter, arr) => {
    const next = [...arr]
    next[i] = val.slice(-1)
    setter(next)
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus()
  }

  // ── STEP 1: Send OTP or proceed to password ───────────────────
  const proceed1 = async () => {
    setError('')
    setLoading(true)
    try {
      if (mode === 'phone') {
        // Set up invisible reCAPTCHA (required by Firebase for SMS)
        if (!recaptchaRef.current) {
          recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible'
          })
        }
        // Send real SMS OTP via Firebase
        const confirmation = await signInWithPhoneNumber(auth, phone, recaptchaRef.current)
        confirmRef.current = confirmation
        setStep(2)
      } else {
        // Email: just go to password step
        setStep(2)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    }
    setLoading(false)
  }

  // ── STEP 2 (email): Verify password → send email code ─────────
  const proceed2 = async () => {
    setError('')
    setLoading(true)
    try {
      // Sign in with email + password
      const result = await signInWithEmailAndPassword(auth, email, password)
      // If email not verified, send verification email
      if (!result.user.emailVerified) {
        await sendEmailVerification(result.user)
        setStep(3)
      } else {
        // Already verified — log straight in
        localStorage.setItem('fc-user', JSON.stringify({ email, mode }))
        localStorage.setItem('fc-logged-in', 'true')
        onLogin({ email, mode })
      }
    } catch (err) {
      // If user doesn't exist yet, create account and send verification
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          const result = await createUserWithEmailAndPassword(auth, email, password)
          await sendEmailVerification(result.user)
          setStep(3)
        } catch (e) {
          setError(e.message)
        }
      } else {
        setError(err.message)
      }
    }
    setLoading(false)
  }

  // ── STEP 2 (phone): Verify SMS OTP ───────────────────────────
  const verifyOtp = async () => {
    setError('')
    setLoading(true)
    try {
      const otpCode = otp.join('')
      await confirmRef.current.confirm(otpCode)  // real Firebase OTP check
      localStorage.setItem('fc-user', JSON.stringify({ phone, mode }))
      localStorage.setItem('fc-logged-in', 'true')
      onLogin({ phone, mode })
    } catch (err) {
      setError('Invalid OTP. Please try again.')
    }
    setLoading(false)
  }

  // ── STEP 3 (email): User clicks "I verified my email" ────────
  const proceed3 = async () => {
    setError('')
    setLoading(true)
    try {
      await auth.currentUser?.reload()  // refresh user state
      if (auth.currentUser?.emailVerified) {
        localStorage.setItem('fc-user', JSON.stringify({ email, mode }))
        localStorage.setItem('fc-logged-in', 'true')
        onLogin({ email, mode })
      } else {
        setError('Email not verified yet. Please check your inbox and click the link.')
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className={styles.screen}>
      <div className={styles.bg} />
      <div className={styles.gridLines} />

      {/* Firebase invisible reCAPTCHA mounts here */}
      <div id="recaptcha-container"></div>

      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>FC</div>
          <div className={styles.logoName}>Fin<span>Core</span></div>
        </div>

        <div className={styles.stepDots}>
          {[1, 2, 3].map(n => (
            <div key={n} className={`${styles.dot}
              ${n < step ? styles.dotDone : ''}
              ${n === step ? styles.dotActive : ''}`} />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)',
            borderRadius: 8, padding: '10px 12px', marginBottom: 14,
            fontSize: 12, color: '#EF4444'
          }}>{error}</div>
        )}

        {/* STEP 1: Identity */}
        {step === 1 && (
          <>
            <h2 className={styles.title}>Welcome </h2>
            <p className={styles.sub}>Sign in with email or phone number</p>
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${mode === 'email' ? styles.tabActive : ''}`}
                onClick={() => setMode('email')}>Email</button>
              <button className={`${styles.tab} ${mode === 'phone' ? styles.tabActive : ''}`}
                onClick={() => setMode('phone')}>Phone</button>
            </div>
            {mode === 'email' ? (
              <div className={styles.field}>
                <label className={styles.label}>Email address</label>
                <input className={styles.input} type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            ) : (
              <div className={styles.field}>
                <label className={styles.label}>Phone number</label>
                <input className={styles.input} type="tel" placeholder="+91 98765 43210"
                  value={phone} onChange={e => setPhone(e.target.value)} />
                <p className={styles.hint}>We'll send a real OTP via SMS</p>
              </div>
            )}
            <button className={styles.btn} onClick={proceed1} disabled={loading}>
              {loading ? 'Sending...' : 'Continue →'}
            </button>
          </>
        )}

        {/* STEP 2a: Password */}
        {step === 2 && mode === 'email' && (
          <>
            <button className={styles.back} onClick={() => setStep(1)}>← Back</button>
            <h2 className={styles.title}>Enter password</h2>
            <p className={styles.sub}>Signing in as {email}</p>
            <div className={styles.field} style={{ marginTop: 16 }}>
              <label className={styles.label}>Password</label>
              <input className={styles.input} type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button className={styles.btn} onClick={proceed2} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & continue →'}
            </button>
          </>
        )}

        {/* STEP 2b: SMS OTP */}
        {step === 2 && mode === 'phone' && (
          <>
            <button className={styles.back} onClick={() => setStep(1)}>← Back</button>
            <h2 className={styles.title}>Enter OTP</h2>
            <p className={styles.sub}>OTP sent to {phone} via SMS</p>
            <div className={styles.otpRow}>
              {otp.map((v, i) => (
                <input key={i} id={`otp-${i}`} className={styles.otpBox} maxLength={1}
                  value={v} onChange={e => handleOtpChange(e.target.value, i, setOtp, otp)} />
              ))}
            </div>
            <button className={styles.btn} style={{ marginTop: 16 }} onClick={verifyOtp} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP →'}
            </button>
          </>
        )}

        {/* STEP 3: Check email */}
        {step === 3 && (
          <>
            <h2 className={styles.title}>Check your email</h2>
            <p className={styles.sub}>
              We sent a verification link to <strong style={{ color: 'var(--accent)' }}>{email}</strong>.
              Click the link in the email, then come back and press the button below.
            </p>
            <button className={styles.btn} style={{ marginTop: 20 }} onClick={proceed3} disabled={loading}>
              {loading ? 'Checking...' : 'I verified my email →'}
            </button>
            <p className={styles.hint} style={{ marginTop: 12, textAlign: 'center' }}>
              Didn't get it?{' '}
              <span style={{ color: 'var(--accent)', cursor: 'pointer' }}
                onClick={() => sendEmailVerification(auth.currentUser)}>
                Resend email
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}