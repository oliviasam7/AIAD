import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiCreateOrder, apiVerifyPayment } from "../utils/auth";

const styles = `
.pricing-page {
  min-height: 100vh; background: var(--bg);
  padding: 80px 40px; position: relative; z-index: 1;
}
.pricing-eyebrow {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  color: var(--accent); letter-spacing: 3px; text-transform: uppercase;
  text-align: center; margin-bottom: 16px;
}
.pricing-h1 {
  font-family: 'Instrument Serif', serif; font-size: clamp(36px,6vw,64px);
  font-weight: 400; text-align: center; color: var(--text); margin-bottom: 12px;
}
.pricing-h1 em { font-style: italic; color: var(--accent); }
.pricing-sub { text-align: center; font-size: 15px; color: var(--muted); max-width: 480px; margin: 0 auto 60px; line-height: 1.7; }
.pricing-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; max-width: 980px; margin: 0 auto; }
.plan-card {
  border: 1px solid var(--border2); background: var(--surface);
  padding: 36px 32px; display: flex; flex-direction: column; position: relative;
}
.plan-card.featured { border-color: var(--accent); background: linear-gradient(160deg,rgba(0,212,255,0.06),var(--surface)); }
.plan-badge {
  position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
  background: var(--accent); color: #000; font-family: 'JetBrains Mono', monospace;
  font-size: 9px; font-weight: 700; letter-spacing: 2px; padding: 4px 14px;
  text-transform: uppercase; white-space: nowrap;
}
.plan-name { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
.plan-price { font-family: 'Instrument Serif', serif; font-size: 52px; color: var(--text); line-height: 1; margin-bottom: 4px; }
.plan-period { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--muted); margin-bottom: 28px; }
.plan-divider { height: 1px; background: var(--border); margin-bottom: 24px; }
.plan-features { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; flex: 1; }
.plan-feature { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: var(--muted); line-height: 1.5; }
.plan-feature::before { content: '✓'; color: var(--accent); font-weight: 700; flex-shrink: 0; margin-top: 1px; }
.plan-feature.dim::before { content: '–'; color: var(--border2); }
.plan-feature.dim { color: var(--border2); }
.plan-btn {
  padding: 14px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 800;
  cursor: pointer; letter-spacing: 0.3px; border: none; transition: opacity .2s;
  clip-path: polygon(8px 0%,100% 0%,100% calc(100% - 8px),calc(100% - 8px) 100%,0% 100%,0% 8px);
}
.plan-btn.primary { background: linear-gradient(135deg,var(--accent),var(--accent2)); color: #000; }
.plan-btn.outline { background: transparent; border: 1px solid var(--border2); color: var(--muted); clip-path: none; }
.plan-btn.outline:hover { border-color: var(--accent); color: var(--text); }
.plan-btn.current { background: var(--surface2); color: var(--muted); cursor: default; border: 1px solid var(--border2); clip-path: none; }
.plan-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pricing-note { text-align: center; margin-top: 48px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--muted); line-height: 1.8; }
.pricing-note a { color: var(--accent); cursor: pointer; }
.pricing-alert { max-width: 980px; margin: 0 auto 24px; padding: 14px 20px; font-family: 'JetBrains Mono', monospace; font-size: 13px; }
.pricing-alert.success { border: 1px solid rgba(0,230,118,0.3); background: rgba(0,230,118,0.07); color: var(--green); }
.pricing-alert.error { border: 1px solid rgba(255,77,77,0.3); background: rgba(255,77,77,0.07); color: var(--red); }
@media(max-width:900px) { .pricing-grid { grid-template-columns: 1fr; max-width: 420px; } }
`;

const PLANS = [
  {
    id: "free", name: "Free", price: "₹0", period: "forever",
    features: ["3 contract analyses total", "Risk score & clause breakdown", "Financial summary", "AI chatbot (per session)"],
    dimmed: ["No translation", "No priority support"],
  },
  {
    id: "pro", name: "Pro", price: "₹499", period: "per month", featured: true,
    features: ["50 contract analyses / month", "Risk score & clause breakdown", "Financial summary", "AI chatbot (per session)", "Multilingual translation", "Priority email support"],
    dimmed: [],
  },
  {
    id: "enterprise", name: "Enterprise", price: "₹1,999", period: "per month",
    features: ["Unlimited contract analyses", "Risk score & clause breakdown", "Financial summary", "AI chatbot (per session)", "Multilingual translation", "Dedicated account manager"],
    dimmed: [],
  },
];

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Pricing({ onBack }) {
  const { user, token, updateUser } = useAuth();
  const [busy, setBusy]       = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");

  async function handleUpgrade(planId) {
    if (!token) { setError("Please sign in to upgrade."); return; }
    setBusy(planId); setError(""); setSuccess("");

    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Could not load payment gateway. Check your internet connection.");

      const order = await apiCreateOrder(token, planId);

      await new Promise((resolve, reject) => {
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "FinCore",
          description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan — Monthly`,
          order_id: order.orderId,
          handler: async (response) => {
            try {
              const result = await apiVerifyPayment(token, {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                plan: planId,
              });
              updateUser({ plan: result.plan });
              setSuccess(`Payment successful! You are now on the ${result.plan.charAt(0).toUpperCase() + result.plan.slice(1)} plan.`);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          prefill: { name: user?.name || "", email: user?.email || "" },
          theme: { color: "#00d4ff" },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled.")),
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (resp) => reject(new Error(resp.error.description)));
        rzp.open();
      });

    } catch (err) {
      if (err.message !== "Payment cancelled.") setError(err.message);
    }
    setBusy("");
  }

  return (
    <>
      <style>{styles}</style>
      <div className="pricing-page">
        <div className="pricing-eyebrow">Choose your plan</div>
        <h1 className="pricing-h1">Simple, <em>transparent</em> pricing</h1>
        <p className="pricing-sub">Start free with 3 analyses. Upgrade when you need more power.</p>

        {success && <div className="pricing-alert success">✓ {success}</div>}
        {error   && <div className="pricing-alert error">⚠ {error}</div>}

        <div className="pricing-grid">
          {PLANS.map((plan) => {
            const isCurrent = user?.plan === plan.id;
            const isPaid    = plan.id !== "free";
            return (
              <div key={plan.id} className={`plan-card ${plan.featured ? "featured" : ""}`}>
                {plan.featured && <div className="plan-badge">Most Popular</div>}
                <div className="plan-name">{plan.name}</div>
                <div className="plan-price">{plan.price}</div>
                <div className="plan-period">{plan.period}</div>
                <div className="plan-divider" />
                <ul className="plan-features">
                  {plan.features.map((f) => <li key={f} className="plan-feature">{f}</li>)}
                  {plan.dimmed.map((f)    => <li key={f} className="plan-feature dim">{f}</li>)}
                </ul>
                <button
                  className={`plan-btn ${isCurrent ? "current" : plan.featured ? "primary" : "outline"}`}
                  disabled={isCurrent || busy === plan.id || !isPaid}
                  onClick={() => isPaid && !isCurrent && handleUpgrade(plan.id)}
                >
                  {busy === plan.id
                    ? "Processing…"
                    : isCurrent
                    ? "✓ Current Plan"
                    : plan.id === "free"
                    ? "Free Forever"
                    : `Upgrade to ${plan.name} →`}
                </button>
              </div>
            );
          })}
        </div>

        <div className="pricing-note">
          Payments processed securely via Razorpay. Cancel anytime.<br />
          <a onClick={onBack}>← Back to analysis</a>
        </div>
      </div>
    </>
  );
}