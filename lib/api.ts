import axios from 'axios'

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://socart-backend-production.up.railway.app'

export const api = axios.create({ baseURL: API_URL })

// সব request এ token + telegram_id header দেয়
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token')
    const tgId  = localStorage.getItem('admin_tgid')
    if (token) config.headers['X-Admin-Token'] = token
    if (tgId)  config.headers['X-Telegram-Id'] = tgId
  }
  return config
})

export const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : ''

export const getRole = () =>
  typeof window !== 'undefined' ? localStorage.getItem('admin_role') || '' : ''

export const getTgId = () =>
  typeof window !== 'undefined' ? localStorage.getItem('admin_tgid') || '' : ''

export const clearSession = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_role')
  localStorage.removeItem('admin_tgid')
}

// Telegram WebApp helper
export const getTelegramWebApp = (): any =>
  typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null
