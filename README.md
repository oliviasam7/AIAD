# FinCore — AI Contract Intelligence Platform

Upload any contract and get an instant AI-powered breakdown of risks, clauses, and financial terms — powered by **OpenAI GPT-4o**.

---

## What It Does

| Step | What happens |
|------|-------------|
| ① Sign Up / Sign In | Create an account to access the platform |
| ② Paste or Upload | Paste contract text, or upload a `.txt`, `.pdf`, `.docx`, `.png`, `.jpg`, or `.webp` file |
| ③ Choose Focus Areas | Select which aspects to prioritize: Risk Flags, Financial Terms, Obligations, Exit Clauses, Penalties, or IP & Ownership |
| ④ Analyze | GPT-4o reads the contract and returns a structured analysis |
| ⑤ View Results | Risk score (0–100), plain-language clause breakdown, financial figures, and an actionable recommendation |
| ⑥ Chat & Translate | Ask follow-up questions about the contract or explain it in Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, or Simple English |
| ⑦ Download | Export the full analysis as a formatted Word document (.docx) |

---

## Project Structure

## 📁 Project Structure

```plaintext
FinCore-ia2/
│
├── backend/
│   ├── server.js              # Express API — auth, JWT, usage limits, Razorpay
│   ├── db.json                # Auto-generated database (users + plans)
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Backend secrets (not committed)
│   └── .env.example           # Environment variable template
│
├── frontend/
│   ├── public/
│   │   └── index.html         # HTML shell
│   │
│   ├── src/
│   │   ├── App.jsx            # Root component (state, auth, routing)
│   │   ├── index.js           # React entry point
│   │
│   │   ├── styles/
│   │   │   └── global.css     # CSS variables, layout, responsiveness
│   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global auth state
│   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar
│   │   │   ├── Hero.jsx          # Hero section
│   │   │   ├── InputPanel.jsx    # Upload + text input
│   │   │   ├── ResultsPanel.jsx  # Results display panel
│   │   │   ├── Results.jsx       # Risk, clauses, financials
│   │   │   ├── Login.jsx         # Authentication page
│   │   │   ├── Pricing.jsx       # Pricing + Razorpay
│   │   │   ├── Chatbot.jsx       # Contract Q&A chatbot
│   │   │   ├── Translator.jsx    # Multilingual panel
│   │   │   └── Footer.jsx        # Footer
│   │
│   │   ├── utils/
│   │   │   ├── api.js            # API calls + PDF extraction
│   │   │   ├── auth.js           # Auth utilities
│   │   │   ├── downloadReport.js # DOCX generation
│   │   │   └── constants.js      # App constants
│   │
│   └── package.json
│
└── README.md
```

## Plans & Limits

| Plan | Analyses | Price |
|------|----------|-------|
| Free | 3 total | ₹0 |
| Pro | 50 / month | ₹499 / month |
| Enterprise | Unlimited | ₹1,999 / month |

Upgrades are processed via **Razorpay**. Users must complete payment before their plan is updated.

---

## Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or higher
- An [OpenAI API key](https://platform.openai.com/api-keys) (GPT-4o access required)
- A [Razorpay account](https://razorpay.com) for payment processing (free test mode available)

---

### Backend Setup

**1. Go to the backend folder**
```bash
cd backend
```

**2. Install dependencies**
```bash
npm install
```

**3. Create your `.env` file**

Copy the example file:
```bash
cp .env.example .env
```

Then open `.env` and fill in your values:

```env
JWT_SECRET=any_long_random_string_you_make_up
PORT=4001
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
```

**4. Start the backend**
```bash
node server.js
```

You should see: `FinCore backend running on port 4001`

Keep this terminal open while using the app.

---

### Frontend Setup

**1. Go to the frontend folder**
```bash
cd frontend
```

**2. Install dependencies**
```bash
npm install
```

**3. Install required packages**
```bash
npm install pdfjs-dist@3.11.174 docx file-saver
```

**4. Create your `.env` file** in the `frontend/` folder:

```env
REACT_APP_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
Get your key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
```

**5. Start the frontend**
```bash
npm start
```

Opens at **http://localhost:3000**

---

## How to Use

1. Click **Sign In** in the navbar and create an account
2. **Paste text** directly into the textarea, or switch to **Upload File** and drop in a contract
3. **Select focus areas** — at least one must be checked
4. Click **Analyze Contract →** and wait ~10–15 seconds
5. Browse the results: risk score, clause-by-clause breakdown, financial figures, and a final recommendation
6. Use the **chatbot** to ask follow-up questions about the contract
7. Use the **translator** to get an explanation in your preferred language
8. Click **↓ Download Report** to export the analysis as a Word document

> **Free plan:** 3 analyses total. Upgrade via the Pricing page to get more.

> **Note on PDFs:** PDFs are extracted in-browser using pdfjs-dist. Scanned or image-based PDFs cannot be extracted — upload them as an image (`.png`, `.jpg`) instead.

---

## Running Both Servers

You need **two terminals** running at the same time:

| Terminal 1 (Backend) | Terminal 2 (Frontend) |
|---|---|
| `cd backend` | `cd frontend` |
| `node server.js` | `npm start` |
| Runs on port 4001 | Runs on port 3000 |

---

## Push to GitHub

**First time:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/FinCore.git
git push -u origin main
```

**Subsequent updates:**
```bash
git add .
git commit -m "describe your change"
git push origin main
```

---

## Editing Guide

| What you want to change | File to edit |
|---|---|
| Logo, nav links | `frontend/src/components/Navbar.jsx` |
| Hero headline / subtitle | `frontend/src/components/Hero.jsx` |
| Input tabs, textarea, dropzone | `frontend/src/components/InputPanel.jsx` |
| Focus area options | `frontend/src/utils/constants.js` |
| AI system prompt / model | `frontend/src/utils/api.js` |
| Risk meter, clauses, financials UI | `frontend/src/components/Results.jsx` |
| Loading / idle / done states | `frontend/src/components/ResultsPanel.jsx` |
| Download report formatting | `frontend/src/utils/downloadReport.js` |
| Pricing plans and amounts | `frontend/src/components/Pricing.jsx` |
| Auth pages | `frontend/src/components/Login.jsx` |
| Footer text | `frontend/src/components/Footer.jsx` |
| Colors, fonts, CSS variables | `frontend/src/styles/global.css` |
| App-level state & flow | `frontend/src/App.jsx` |
| User database & API routes | `backend/server.js` |

---

## Troubleshooting

**`REACT_APP_OPENAI_API_KEY` not working**
→ Make sure the `.env` file is inside the `frontend/` folder (same level as `package.json`), and restart `npm start` after creating it.

**"Failed to fetch" on login or register**
→ The backend is not running. Open a second terminal, go to `backend/`, and run `node server.js`.

**"Setting up fake worker failed" on PDF upload**
→ Run `npm install pdfjs-dist@3.11.174` inside the `frontend/` folder. The version must be exactly `3.11.174`.

**PDF shows no text extracted**
→ The PDF is likely scanned or image-based. Convert it to a `.png` or `.jpg` and upload as an image instead.

**"receipt: the length must be no more than 40" on payment**
→ Update the receipt line in `backend/server.js` to: `receipt: uuid().slice(0, 40)`

**Analysis returns null / "Failed to parse"**
→ The model response wasn't valid JSON. This can happen if the contract text is very short or garbled. Try a longer, cleaner input.

**Port already in use error on backend**
→ Change `PORT=4001` in `backend/.env` and update `http://localhost:4000` to `http://localhost:4001` in `frontend/src/utils/auth.js` and `frontend/src/context/AuthContext.jsx`.

**Download Report fails**
→ Run `npm install docx file-saver` inside the `frontend/` folder.
