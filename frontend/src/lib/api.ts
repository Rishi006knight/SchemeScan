import axios from 'axios'
import fallbackSchemes from '@/data/schemesData.json'
import { evaluateClientEligibility } from './ruleEvaluator'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
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
      if (refresh && !refresh.startsWith('demo-')) {
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

// Helper for local mock profile state
function getLocalProfile(): ProfileData {
  const saved = localStorage.getItem('scheme_user_profile')
  if (saved) {
    try { return JSON.parse(saved) } catch { /* ignore */ }
  }
  const user = JSON.parse(localStorage.getItem('scheme_user') || '{"username": "Citizen", "email": "citizen@example.com"}')
  return {
    id: 1,
    username: user.username,
    email: user.email,
    age: 28,
    gender: 'Female',
    state: 'Tamil Nadu',
    district: 'Chennai',
    annual_income: '180000',
    occupation: 'Self-employed',
    education: 'Graduate',
    category: 'OBC',
    disability_status: false,
    marital_status: 'Married',
    family_size: 4,
    is_rural: false,
    land_ownership_acres: '0',
    is_student: false,
    employment_status: 'Self-Employed',
    extra_details: {},
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: async (data: { username: string; email: string; password: string; password2: string }) => {
    try {
      return await api.post('/auth/register/', data)
    } catch {
      // Offline / Demo fallback
      const token = `demo-access-${Date.now()}`
      const refresh = `demo-refresh-${Date.now()}`
      const user = { id: 1, username: data.username, email: data.email }
      localStorage.setItem('access_token', token)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('scheme_user', JSON.stringify(user))
      const initialProfile = getLocalProfile()
      initialProfile.username = data.username
      initialProfile.email = data.email
      localStorage.setItem('scheme_user_profile', JSON.stringify(initialProfile))
      return {
        data: {
          access: token,
          refresh: refresh,
          user: user,
        },
      }
    }
  },

  login: async (data: { username: string; password: string }) => {
    try {
      return await api.post('/auth/token/', data)
    } catch {
      // Offline / Demo fallback
      const token = `demo-access-${Date.now()}`
      const refresh = `demo-refresh-${Date.now()}`
      const user = { id: 1, username: data.username, email: `${data.username}@demo.com` }
      localStorage.setItem('access_token', token)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('scheme_user', JSON.stringify(user))
      return {
        data: {
          access: token,
          refresh: refresh,
          user: user,
        },
      }
    }
  },

  refreshToken: (refresh: string) =>
    api.post('/auth/token/refresh/', { refresh }),
}

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  getMe: async () => {
    try {
      return await api.get('/profiles/me/')
    } catch {
      return { data: getLocalProfile() }
    }
  },

  updateMe: async (data: Partial<ProfileData>) => {
    try {
      return await api.patch('/profiles/me/', data)
    } catch {
      const current = getLocalProfile()
      const updated = { ...current, ...data }
      localStorage.setItem('scheme_user_profile', JSON.stringify(updated))
      return { data: updated }
    }
  },

  ocrUpload: async (formData: FormData) => {
    try {
      return await api.post('/profiles/ocr-upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } catch {
      // Mock OCR parsing result
      return {
        data: {
          extracted_text: 'Sample Aadhaar Card: Govt of India\nDOB: 15/08/1996\nGender: Female\nIncome: 1,80,000 INR',
          structured_data: {
            age: 28,
            gender: 'Female',
            annual_income: '180000',
            state: 'Tamil Nadu',
          },
        },
      }
    }
  },
}

// ── Schemes ───────────────────────────────────────────────────────────────────
export const schemeApi = {
  list: async (params?: { search?: string; category?: string; state?: string }) => {
    try {
      const res = await api.get('/schemes/', { params })
      if (res.data && (Array.isArray(res.data.results) || Array.isArray(res.data))) {
        return res
      }
      throw new Error('Invalid response')
    } catch {
      let list = fallbackSchemes as unknown as Scheme[]

      // Category filter
      if (params?.category && params.category !== 'All') {
        const cat = params.category.toLowerCase()
        list = list.filter((s) => {
          const sCat = s.category.toLowerCase()
          const sName = s.name.toLowerCase()
          const sTags = (s.search_tags || '').toLowerCase()
          const sDesc = s.description.toLowerCase()

          if (cat === 'health' || cat === 'healthcare') {
            return sCat.includes('health') || sTags.includes('health') || sTags.includes('hospital') || sTags.includes('medical')
          }
          if (cat === 'pension' || cat === 'pensions' || cat.includes('senior')) {
            return sCat.includes('senior') || sCat.includes('social') || sTags.includes('pension') || sName.includes('pension') || sDesc.includes('pension')
          }
          if (cat === 'insurance' || cat === 'bima') {
            return sTags.includes('insurance') || sName.includes('bima') || sName.includes('insurance') || sDesc.includes('insurance') || sCat.includes('health') || sTags.includes('pmfby')
          }
          if (cat === 'finance' || cat === 'msme' || cat.includes('business')) {
            return sCat === 'msme' || sTags.includes('loan') || sTags.includes('finance') || sTags.includes('subsidy') || sTags.includes('credit')
          }
          if (cat.includes('employment') || cat.includes('skill')) {
            return sCat.includes('employ') || sTags.includes('job') || sTags.includes('skill') || sTags.includes('internship')
          }
          if (cat.includes('disability')) {
            return sCat.includes('disab') || sTags.includes('handicap') || sTags.includes('disab')
          }
          if (cat.includes('social')) {
            return sCat.includes('social')
          }
          return sCat === cat || sCat.includes(cat)
        })
      }

      // State filter
      if (params?.state && params.state !== 'All States' && params.state !== 'All') {
        list = list.filter(
          (s) =>
            s.state_applicable === 'All' ||
            s.state_applicable.toLowerCase() === params.state!.toLowerCase()
        )
      }

      // Search query
      if (params?.search) {
        const q = params.search.toLowerCase()
        list = list.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            (s.search_tags && s.search_tags.toLowerCase().includes(q))
        )
      }

      return {
        data: {
          count: list.length,
          results: list,
        },
      }
    }
  },

  detail: async (id: number) => {
    try {
      return await api.get(`/schemes/${id}/`)
    } catch {
      const match =
        (fallbackSchemes as unknown as Scheme[]).find(
          (s) => s.id === Number(id)
        ) || (fallbackSchemes as unknown as Scheme[])[0]
      return { data: match }
    }
  },

  check: async () => {
    try {
      return await api.post('/schemes/check/')
    } catch {
      const profile = getLocalProfile()
      const result = evaluateClientEligibility(profile)
      return { data: result }
    }
  },

  bookmark: async (id: number) => {
    try {
      return await api.post(`/schemes/${id}/bookmark/`)
    } catch {
      const bookmarks = JSON.parse(localStorage.getItem('scheme_bookmarks') || '[]')
      if (!bookmarks.includes(id)) {
        bookmarks.push(id)
        localStorage.setItem('scheme_bookmarks', JSON.stringify(bookmarks))
      }
      return { data: { success: true } }
    }
  },

  unbookmark: async (id: number) => {
    try {
      return await api.delete(`/schemes/${id}/bookmark/`)
    } catch {
      let bookmarks = JSON.parse(localStorage.getItem('scheme_bookmarks') || '[]')
      bookmarks = bookmarks.filter((b: number) => b !== id)
      localStorage.setItem('scheme_bookmarks', JSON.stringify(bookmarks))
      return { data: { success: true } }
    }
  },

  bookmarks: async () => {
    try {
      return await api.get('/schemes/bookmarks/')
    } catch {
      const bookmarkIds: number[] = JSON.parse(localStorage.getItem('scheme_bookmarks') || '[]')
      const all = fallbackSchemes as unknown as Scheme[]
      const list = all
        .filter((s) => bookmarkIds.includes(s.id))
        .map((s) => ({ id: s.id, scheme: s, created_at: new Date().toISOString() }))
      return { data: list }
    }
  },

  history: async () => {
    try {
      return await api.get('/schemes/history/')
    } catch {
      return { data: [] }
    }
  },
}

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiApi = {
  chat: async (messages: ChatMessage[], include_profile = true) => {
    try {
      return await api.post('/ai/chat/', { messages, include_profile })
    } catch {
      const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || ''
      let reply = "I'm SchemeBot! Based on your profile, you can explore agricultural subsidies, educational scholarships, health assurance (like Ayushman Bharat), and small business loans like PM Mudra."
      if (lastMsg.includes('farmer') || lastMsg.includes('kisan')) {
        reply = "For farmers, you qualify for PM-KISAN (₹6,000/year), PM Fasal Bima Yojana for crop insurance, and Kisan Credit Card with 4% interest credit!"
      } else if (lastMsg.includes('student') || lastMsg.includes('scholarship')) {
        reply = "For students, check out Post-Matric Scholarships (SC/ST/OBC), AICTE Pragati for girls (₹50k/year), and Central Sector PM-USP."
      } else if (lastMsg.includes('woman') || lastMsg.includes('women') || lastMsg.includes('girl')) {
        reply = "Top schemes for women include PMMVY Maternity support (₹5,000–₹6,000), Sukanya Samriddhi SSY (8.2% tax-free interest), Ujjwala 2.0 LPG, and Stand-Up India business loans!"
      }
      return { data: { reply } }
    }
  },

  extractProfile: async (text: string) => {
    try {
      return await api.post('/ai/extract-profile/', { text })
    } catch {
      return {
        data: {
          extracted: {
            state: text.toLowerCase().includes('tamil nadu') ? 'Tamil Nadu' : undefined,
            occupation: text.toLowerCase().includes('farmer') ? 'Farmer' : undefined,
          }
        }
      }
    }
  },

  explain: async (scheme_id: number) => {
    try {
      return await api.post('/ai/explain/', { scheme_id })
    } catch {
      const scheme = (fallbackSchemes as unknown as Scheme[]).find(s => s.id === Number(scheme_id))
      return {
        data: {
          explanation: `You qualify for ${scheme?.name || 'this scheme'} because your profile details (annual income, state, and occupation) satisfy the government criteria.`
        }
      }
    }
  },
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
