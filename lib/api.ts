import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://socart-backend-production.up.railway.app',
})

api.interceptors.request.use(cfg => {
  if (typeof window !== 'undefined') {
    const t  = localStorage.getItem('admin_token')
    const id = localStorage.getItem('admin_tgid')
    if (t)  cfg.headers['X-Admin-Token'] = t
    if (id) cfg.headers['X-Telegram-Id'] = id
  }
  return cfg
})

export const getToken     = () => typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : ''
export const getRole      = () => typeof window !== 'undefined' ? localStorage.getItem('admin_role')  || '' : ''
export const clearSession = () => { ['admin_token','admin_role','admin_tgid'].forEach(k => localStorage.removeItem(k)) }
export const getTg        = (): any => typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null
