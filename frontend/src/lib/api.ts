import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh })
          localStorage.setItem('access_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { username: string; email: string; password: string; password2: string }) =>
    api.post('/auth/register/', data),
  login: (data: { username: string; password: string }) =>
    api.post('/auth/token/', data),
  refreshToken: (refresh: string) =>
    api.post('/auth/token/refresh/', { refresh }),
}

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  getMe: () => api.get('/profiles/me/'),
  updateMe: (data: Partial<ProfileData>) => api.patch('/profiles/me/', data),
  ocrUpload: (formData: FormData) =>
    api.post('/profiles/ocr-upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

// ── Schemes ───────────────────────────────────────────────────────────────────
export const schemeApi = {
  list: (params?: { search?: string; category?: string; state?: string }) =>
    api.get('/schemes/', { params }),
  detail: (id: number) => api.get(`/schemes/${id}/`),
  check: () => api.post('/schemes/check/'),
  bookmark: (id: number) => api.post(`/schemes/${id}/bookmark/`),
  unbookmark: (id: number) => api.delete(`/schemes/${id}/bookmark/`),
  bookmarks: () => api.get('/schemes/bookmarks/'),
  history: () => api.get('/schemes/history/'),
}

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiApi = {
  chat: (messages: ChatMessage[], include_profile = true) =>
    api.post('/ai/chat/', { messages, include_profile }),
  extractProfile: (text: string) =>
    api.post('/ai/extract-profile/', { text }),
  explain: (scheme_id: number) =>
    api.post('/ai/explain/', { scheme_id }),
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ProfileData {
  id: number
  username: string
  email: string
  age: number | null
  gender: string | null
  state: string | null
  district: string | null
  annual_income: string | null
  occupation: string | null
  education: string | null
  category: string | null
  disability_status: boolean
  marital_status: string | null
  family_size: number | null
  is_rural: boolean
  land_ownership_acres: string | null
  is_student: boolean
  employment_status: string | null
  extra_details: Record<string, unknown>
}

export interface Scheme {
  id: number
  name: string
  description: string
  category: string
  state_applicable: string
  benefits: string
  documents_required: string
  official_website: string | null
  deadline: string | null
  is_active: boolean
  is_bookmarked: boolean
  search_tags: string
  rule?: { id: number; logic: unknown }
  created_at: string
  updated_at: string
}

export interface EligibilityResult {
  scheme_id: number
  scheme_name: string
  category: string
  result: 'eligible' | 'not_eligible' | 'needs_info'
  explanation: Array<{ field: string; label: string; met: boolean | null; message: string }>
  benefits: string
  official_website: string | null
  deadline: string | null
}

export interface EligibilityCheckResponse {
  profile_complete: boolean
  summary: { eligible_count: number; not_eligible_count: number; needs_info_count: number }
  eligible: EligibilityResult[]
  not_eligible: EligibilityResult[]
  needs_info: EligibilityResult[]
}

export interface ChatMessage {
  role: 'user' | 'model'
  content: string
}
