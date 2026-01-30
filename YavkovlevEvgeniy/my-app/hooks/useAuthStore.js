import { create } from 'zustand'
import api, { setAuthToken, clearAuthToken } from '../services/api'

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

    register: async (name, email, password) => {
      set({ loading: true, error: null })
      try {
        const payload = { name, password, username: name, email }
        const body = await api.request('/auth/register', { method: 'POST', body: payload })
        const data = body.data || body
        const user = data.user || data
        const token = data.accessToken || data.token || data.access || null
        if (token) setAuthToken(token)
        set({ user, token, isAuthenticated: !!token })
        return { ok: true }
      } catch (e) {
        let message = (e && e.message) || String(e)
        try {
          const b = e && e.body
          if (b) {
            if (typeof b === 'string') message = b
            else if (b.message) message = b.message
            else message = JSON.stringify(b)
          }
        } catch (err) {}
        set({ error: message })
        return { ok: false, message }
      } finally {
        set({ loading: false })
      }
    },

  login: async (name, password) => {
    set({ loading: true, error: null })
    try {
      const payload = { name, password, username: name, email: name }
      const body = await api.request('/auth/login', { method: 'POST', body: payload })
      const data = body.data || body
      const user = data.user || data
      const token = data.accessToken || data.token || data.access || null
      if (token) setAuthToken(token)
      set({ user, token, isAuthenticated: !!token })
      return { ok: true }
    } catch (e) {
      let message = (e && e.message) || String(e)
      try {
        const b = e && e.body
        if (b) {
          if (typeof b === 'string') message = b
          else if (b.message) message = b.message
          else message = JSON.stringify(b)
        }
      } catch (err) {}
      set({ error: message })
      return { ok: false, message }
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    try {
      await api.request('/auth/logout', { method: 'POST' })
    } catch (e) {
      
    } finally {
      clearAuthToken()
      set({ user: null, token: null, isAuthenticated: false })
    }
  },
}))
