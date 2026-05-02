require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const crypto = require("crypto");
const fetch = require("node-fetch");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

const adapter = new FileSync("db.json");
const db = low(adapter);
db.defaults({ users: [] }).write();

const app = express();

// Security and parsing
app.use(helmet());
app.use(morgan("tiny"));
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json({ limit: "1mb" }));

const JWT_SECRET = process.env.JWT_SECRET || "fincore_dev_secret_change_me";
const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RZP_SECRET = process.env.RAZORPAY_KEY_SECRET;
const PORT = process.env.PORT || 4000;

const PLAN_LIMITS = { free: 3, pro: 50, enterprise: Infinity };
const PLAN_PRICES = { pro: 49900, enterprise: 199900 };

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(header.replace("Bearer ", ""), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Rate limiter for AI usage to prevent abuse
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/api/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: "All fields required" });
  if (db.get("users").find({ email }).value())
    return res.status(409).json({ error: "Email already registered" });
  const hashed = await bcrypt.hash(password, 10);
  const user = {
    id: uuid(), name, email, password: hashed,
    plan: "free", analysisCount: 0,
    createdAt: new Date().toISOString(),
  };
  db.get("users").push(user).write();
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, plan: user.plan, analysisCount: user.analysisCount } });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.get("users").find({ email }).value();
  if (!user) return res.status(401).json({ error: "Invalid email or password" });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid email or password" });
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, plan: user.plan, analysisCount: user.analysisCount } });
});

app.get("/api/me", auth, (req, res) => {
  const user = db.get("users").find({ id: req.user.id }).value();
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ id: user.id, name: user.name, email: user.email, plan: user.plan, analysisCount: user.analysisCount });
});

app.post("/api/analyze/use", auth, (req, res) => {
  const user = db.get("users").find({ id: req.user.id }).value();
  if (!user) return res.status(404).json({ error: "User not found" });
  const limit = PLAN_LIMITS[user.plan] ?? 3;
  if (user.plan !== "enterprise" && user.analysisCount >= limit)
    return res.status(403).json({ error: "limit_reached", plan: user.plan, limit });
  db.get("users").find({ id: req.user.id }).assign({ analysisCount: user.analysisCount + 1 }).write();
  const updated = db.get("users").find({ id: req.user.id }).value();
  res.json({ analysisCount: updated.analysisCount, limit });
});

app.post("/api/payment/create-order", auth, async (req, res) => {
  const { plan } = req.body;
  if (!PLAN_PRICES[plan])
    return res.status(400).json({ error: "Invalid plan" });
  if (!RZP_KEY_ID || !RZP_SECRET)
    return res.status(500).json({ error: "Payment not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file." });

  const body = JSON.stringify({
    amount: PLAN_PRICES[plan],
    currency: "INR",
    receipt: uuid().slice(0, 40),
    notes: { plan, userId: req.user.id },
  });

  const authHeader = "Basic " + Buffer.from(`${RZP_KEY_ID}:${RZP_SECRET}`).toString("base64");

  try {
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader },
      body,
    });
    const order = await rzpRes.json();
    if (!rzpRes.ok) throw new Error(order.error?.description || "Razorpay error");
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: RZP_KEY_ID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/payment/verify", auth, (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
  if (!RZP_SECRET)
    return res.status(500).json({ error: "Payment not configured" });

  const expectedSig = crypto
    .createHmac("sha256", RZP_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSig !== razorpay_signature)
    return res.status(400).json({ error: "Payment verification failed. Invalid signature." });

  db.get("users").find({ id: req.user.id }).assign({ plan }).write();
  const user = db.get("users").find({ id: req.user.id }).value();
  res.json({ success: true, plan: user.plan });
});

// Proxy endpoint for OpenAI — keeps the API key on the server
app.post("/api/ai", aiLimiter, async (req, res) => {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) return res.status(500).json({ error: "OpenAI not configured on server" });

  const { messages, systemPrompt, model, max_tokens } = req.body || {};
  const reqMessages = [];
  if (systemPrompt) reqMessages.push({ role: "system", content: systemPrompt });
  if (Array.isArray(messages)) reqMessages.push(...messages);

  try {
    const openRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: model || "gpt-4o",
        messages: reqMessages,
        max_tokens: max_tokens || 1500,
      }),
    });

    const data = await openRes.json();
    if (!openRes.ok) {
      console.error("OpenAI error:", data);
      return res.status(openRes.status || 500).json({ error: data.error?.message || "OpenAI error", raw: data });
    }

    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    return res.json({ content, raw: data });
  } catch (err) {
    console.error("AI proxy failed:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Serve frontend build in production
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "..", "frontend", "build");
  app.use(express.static(clientBuildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

app.listen(PORT, () => console.log(`FinCore backend running on port ${PORT}`));