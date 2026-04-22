import { useState } from 'react'
import styles from './PlansSection.module.css'

const PLANS = [
  {
    id: 'free',
    name: 'FREE',
    monthlyPrice: '₹0',
    annualPrice:  '₹0',
    period_m: 'forever',
    period_a: 'forever',
    color: '#6B7280',
    btnClass: styles.btnOutline,
    btnLabel: 'Get started',
    features: [
      { on: true,  text: '3 contract analyses/month' },
      { on: true,  text: 'Risk score + summary'       },
      { on: true,  text: 'Paste text only'            },
      { on: true,  text: 'Basic chatbot (10 msgs)'    },
      { on: false, text: 'No PDF/file upload'         },
      { on: false, text: 'No translation'             },
      { on: false, text: 'No history'                 },
    ],
  },
  {
    id: 'pro',
    name: 'PRO',
    monthlyPrice: '₹499',
    annualPrice:  '₹399',
    period_m: '/month',
    period_a: '/month · billed annually',
    annualNote: '₹4,999/year — save 2 months',
    color: '#00C896',
    popular: true,
    btnClass: styles.btnAccent,
    btnLabel: 'Start free trial →',
    features: [
      { on: true,  text: '50 analyses/month'           },
      { on: true,  text: 'PDF + TXT file upload'       },
      { on: true,  text: 'Full risk breakdown'         },
      { on: true,  text: 'Unlimited chatbot'           },
      { on: true,  text: 'All 7 language translations' },
      { on: true,  text: 'Contract history (30 days)'  },
      { on: false, text: 'No team collaboration'       },
    ],
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE',
    monthlyPrice: '₹2,999',
    annualPrice:  '₹2,399',
    period_m: '/month per team',
    period_a: '/month per team · billed annually',
    color: '#A78BFA',
    btnClass: styles.btnPurple,
    btnLabel: 'Contact sales →',
    features: [
      { on: true, text: 'Unlimited analyses'        },
      { on: true, text: 'All Pro features'          },
      { on: true, text: 'Up to 10 team members'     },
      { on: true, text: 'Shared contract history'   },
      { on: true, text: 'Priority support'          },
      { on: true, text: 'Custom focus areas'        },
      { on: true, text: 'API access'                },
    ],
  },
]

export default function PlansSection() {
  const [billing, setBilling] = useState('monthly')

  return (
    <div>
      <div className={styles.hdr}>
        <div className={styles.title}>Subscription Plans</div>
        <div className={styles.sub}>Everything you need to review contracts with confidence.</div>
      </div>

      <div className={styles.billingRow}>
        <div>
          <div className={styles.billingLabel}>Billing Cycle</div>
          <div className={styles.billingSub}>Switch to annual billing and save up to 20%</div>
        </div>
        <div className={styles.toggle}>
          <button className={`${styles.tBtn} ${billing === 'monthly' ? styles.tBtnActive : ''}`}
            onClick={() => setBilling('monthly')}>Monthly</button>
          <button className={`${styles.tBtn} ${billing === 'annual' ? styles.tBtnActive : ''}`}
            onClick={() => setBilling('annual')}>
            Annual <span className={styles.savePill}>−20%</span>
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {PLANS.map(plan => {
          const price  = billing === 'annual' ? plan.annualPrice  : plan.monthlyPrice
          const period = billing === 'annual' ? plan.period_a : plan.period_m
          return (
            <div key={plan.id} className={`${styles.card} ${plan.popular ? styles.popular : ''}`}>
              {plan.popular && <div className={styles.popularPill}>Most popular</div>}
              <div className={styles.cardTop}>
                <div className={styles.planLabel}>{plan.name}</div>
                <div className={styles.priceRow}>
                  <span className={styles.price} style={{ color: plan.color }}>{price}</span>
                  {plan.id !== 'free' && <span className={styles.perMonth}>{billing === 'monthly' ? '/month' : '/month'}</span>}
                </div>
                <div className={styles.period}>{period}</div>
                {plan.popular && billing === 'monthly' && plan.annualNote && (
                  <div className={styles.annualNote}>{plan.annualNote}</div>
                )}
              </div>
              <div className={styles.divider} />
              <div className={styles.cardBody}>
                {plan.features.map((item, i) => (
                  <div key={i} className={`${styles.feature} ${item.on ? styles.featureOn : styles.featureOff}`}>
                    <span className={styles.fIcon} style={item.on ? { color: plan.id === 'enterprise' ? '#A78BFA' : 'var(--accent)' } : {}}>
                      {item.on ? '✓' : '✕'}
                    </span>
                    {item.text}
                  </div>
                ))}
              </div>
              <div className={styles.cardFooter}>
                <button className={`${styles.btn} ${plan.btnClass}`}>{plan.btnLabel}</button>
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.note}>
        <span>🔒</span>
        All plans include data encryption in transit and at rest. Your contracts are never used to train AI models.
      </div>
    </div>
  )
}
