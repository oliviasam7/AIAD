import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Resolve and apply theme BEFORE React renders — prevents any flash
function resolveTheme(mode) {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode === 'light' ? 'light' : 'dark'
}

const saved = localStorage.getItem('fc-theme') || 'dark'
document.documentElement.setAttribute('data-theme', resolveTheme(saved))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
