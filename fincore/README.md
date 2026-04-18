# FinCore — AI Contract Intelligence Platform

Upload any contract (PDF, TXT, image) and get an instant plain-language breakdown of risks, obligations, and financial terms — powered by Claude AI.

---

## Project Structure

```
fincore/
├── public/
│   └── index.html          # HTML shell
├── src/
│   ├── App.jsx             # Root component — state & orchestration
│   ├── index.js            # React entry point
│   ├── styles/
│   │   └── global.css      # CSS variables, grid bg, responsive rules
│   ├── components/
│   │   ├── Navbar.jsx      # Top navigation bar
│   │   ├── Hero.jsx        # Hero headline section
│   │   ├── InputPanel.jsx  # Left panel: tabs, textarea, dropzone, focus options
│   │   ├── ResultsPanel.jsx# Right panel: idle / loading / results states
│   │   ├── Results.jsx     # Risk meter, clauses, financials, recommendation
│   │   └── Footer.jsx      # Footer with disclaimer
│   └── utils/
│       ├── api.js          # Anthropic API calls + JSON parsing
│       └── constants.js    # Focus options, model name
└── package.json
```

---

## Run Locally in VS Code

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or higher
- [VS Code](https://code.visualstudio.com/)
- A free [Anthropic API key](https://console.anthropic.com/)

### Steps

1. **Open the project in VS Code**
   ```
   File → Open Folder → select the fincore folder
   ```

2. **Open the terminal in VS Code**
   ```
   Terminal → New Terminal  (or Ctrl + `)
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Add your Anthropic API key**

   Create a file called `.env` in the root of the project:
   ```
   REACT_APP_ANTHROPIC_KEY=your_api_key_here
   ```

   Then update `src/utils/api.js` — find the `fetch` call and add the header:
   ```js
   headers: {
     "Content-Type": "application/json",
     "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY,
     "anthropic-version": "2023-06-01",
     "anthropic-dangerous-direct-browser-access": "true",
   },
   ```

5. **Start the app**
   ```bash
   npm start
   ```
   The app opens at **http://localhost:3000**

---

## Push to GitHub

### First time setup

1. **Create a new repo on GitHub**
   - Go to https://github.com/new
   - Name it `fincore`, keep it Public or Private
   - Do NOT initialize with README (you already have one)
   - Click **Create repository**

2. **In the VS Code terminal, run these commands one by one:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit — FinCore contract analyzer"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/fincore.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your actual GitHub username.

### Subsequent updates

After making changes:
```bash
git add .
git commit -m "describe your change here"
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
