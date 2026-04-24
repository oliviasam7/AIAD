# FinCore — AI Contract Intelligence Platform

Upload any contract and get an instant AI-powered breakdown of risks, clauses, and financial terms — powered by **Claude (Anthropic API)**.

---

## What It Does

| Step | What happens |
|------|-------------|
| ① Paste or Upload | Paste contract text, or upload a `.txt`, `.pdf`, `.docx`, `.png`, `.jpg`, or `.webp` file |
| ② Choose Focus Areas | Select which aspects to prioritize: Risk Flags, Financial Terms, Obligations, Exit Clauses, Penalties, or IP & Ownership |
| ③ Analyze | Claude reads the contract and returns a structured JSON analysis |
| ④ View Results | Risk score (0–100), plain-language clause breakdown, financial figures, and an actionable recommendation |

---

## Project Structure

```
fincorp/
├── public/
│   └── index.html              # HTML shell
├── src/
│   ├── App.jsx                 # Root component — state & orchestration
│   ├── index.js                # React entry point
│   ├── styles/
│   │   └── global.css          # CSS variables, grid background, responsive rules
│   ├── components/
│   │   ├── Navbar.jsx          # Top navigation bar
│   │   ├── Hero.jsx            # Hero headline section
│   │   ├── InputPanel.jsx      # Left panel: input tabs, textarea, dropzone, focus toggles, analyze button
│   │   ├── ResultsPanel.jsx    # Right panel: idle / loading / results states
│   │   ├── Results.jsx         # Risk meter, clause cards, financials grid, recommendation block
│   │   └── Footer.jsx          # Footer with disclaimer
│   └── utils/
│       ├── api.js              # Anthropic API calls, JSON parsing, file reading helpers
│       └── constants.js        # Focus area options, model name
└── package.json
```

---

## Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or higher
- A free [Anthropic API key](https://console.anthropic.com/)

### Steps

**1. Install dependencies**
```bash
npm install
```

**2. Add your API key**

Create a `.env` file in the project root:
```
REACT_APP_ANTHROPIC_KEY=your_api_key_here
```

Then open `src/utils/api.js` and add the auth headers to the `callAPI` fetch call:
```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
},
```

**3. Start the app**
```bash
npm start
```

Opens at **http://localhost:3000**

---

## How to Use

1. **Paste text** directly into the textarea, or switch to **Upload File** and drop in a contract
2. **Select focus areas** — at least one must be checked (Risk Flags, Financial Terms, Obligations, etc.)
3. Click **Analyze Contract →** and wait ~10–15 seconds
4. Browse the results: risk score, clause-by-clause breakdown, financial figures, and a final recommendation

> **Note on image uploads:** `.png`, `.jpg`, and `.webp` files are sent to Claude as base64 image inputs. Text-based files (`.txt`, `.pdf`, `.docx`) are read as plain text. Scanned PDFs that are images will be handled as images.

---

## Push to GitHub

**First time:**
```bash
git init
git add .
git commit -m "Initial commit — FinCorp contract analyzer"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fincorp.git
git push -u origin main
```

**Subsequent updates:**
```bash
git add .
git commit -m "describe your change"
git push
```

---

## Editing Guide

| What you want to change | File to edit |
|---|---|
| Logo, nav links | `src/components/Navbar.jsx` |
| Hero headline / subtitle | `src/components/Hero.jsx` |
| Input tabs, textarea, dropzone | `src/components/InputPanel.jsx` |
| Focus area options | `src/utils/constants.js` |
| AI system prompt / model | `src/utils/api.js` |
| Risk meter, clauses, financials UI | `src/components/Results.jsx` |
| Loading / idle / done states | `src/components/ResultsPanel.jsx` |
| Footer text | `src/components/Footer.jsx` |
| Colors, fonts, CSS variables | `src/styles/global.css` |
| App-level state & flow | `src/App.jsx` |

---

## Troubleshooting

**`REACT_APP_ANTHROPIC_KEY` not working**
→ Make sure the `.env` file is in the project root (same level as `package.json`), and that you restarted `npm start` after creating it.

**CORS error in the browser**
→ The `anthropic-dangerous-direct-browser-access: true` header is required for direct browser-to-API calls. Confirm it's present in `api.js`.

**Analysis returns null / "Failed to parse"**
→ The model response wasn't valid JSON. This can happen if the contract text is very short or garbled. Try a longer, cleaner input.

**Image contract not analyzed**
→ Only image formats (`.png`, `.jpg`, `.jpeg`, `.webp`) are sent as vision inputs. Make sure the file extension is one of these. Scanned PDFs need to be converted to an image format first.
