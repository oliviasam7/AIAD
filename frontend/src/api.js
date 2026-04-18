import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const uploadFile = (file) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/upload', fd)
}

export const analyzeExplain  = (contract_text) => api.post('/analyze/explain',   { contract_text })
export const analyzeRisk      = (contract_text) => api.post('/analyze/risk',      { contract_text })
export const analyzeFinancial = (contract_text) => api.post('/analyze/financial', { contract_text })

export const sendChat = (contract_text, message, history) =>
  api.post('/chat', { contract_text, message, history })

export const analyzeFraud = (contract_text) => api.post('/analyze/fraud', { contract_text })
