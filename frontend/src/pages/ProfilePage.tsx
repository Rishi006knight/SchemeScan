import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi, aiApi, type ProfileData } from '@/lib/api'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'
import {
  User, Upload, Sparkles, Save, Loader2, CheckCircle2, FileText, Brain
} from 'lucide-react'

const STATES = [
  '', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
]

export default function ProfilePage() {
  const { setProfile } = useAuthStore()
  const qc = useQueryClient()
  const [nlpText, setNlpText] = useState('')
  const [showNlp, setShowNlp] = useState(false)
  const [docType, setDocType] = useState('general')

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getMe,
  })

  const [form, setForm] = useState<Partial<ProfileData>>({})
  const profile: ProfileData = data?.data

  // Sync form when profile loads
  useState(() => { if (profile) setForm(profile) })

  const updateMutation = useMutation({
    mutationFn: (d: Partial<ProfileData>) => profileApi.updateMe(d),
    onSuccess: (res) => {
      setProfile(res.data)
      qc.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile saved! ✅')
    },
    onError: () => toast.error('Failed to save profile'),
  })

  const ocrMutation = useMutation({
    mutationFn: (formData: FormData) => profileApi.ocrUpload(formData),
    onSuccess: (res) => {
      const fields = res.data.extracted_fields
      if (Object.keys(fields).length === 0) {
        toast('No fields extracted. Try a clearer image.', { icon: '⚠️' })
        return
      }
      setForm(prev => ({ ...prev, ...fields }))
      toast.success(`✅ ${Object.keys(fields).length} fields auto-filled from document!`)
    },
    onError: () => toast.error('OCR failed. Ensure Tesseract is installed or document is legible.'),
  })

  const nlpMutation = useMutation({
    mutationFn: (text: string) => aiApi.extractProfile(text),
    onSuccess: (res) => {
      const fields = res.data.extracted_fields
      setForm(prev => ({ ...prev, ...fields }))
      toast.success(`AI filled ${Object.keys(fields).length} fields!`)
      setNlpText('')
      setShowNlp(false)
    },
    onError: () => toast.error('AI extraction failed'),
  })

  const onDrop = useCallback((files: File[]) => {
    if (!files[0]) return
    const fd = new FormData()
    fd.append('document', files[0])
    fd.append('doc_type', docType)
    ocrMutation.mutate(fd)
  }, [ocrMutation, docType])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1,
  })

  const set = (k: keyof ProfileData, v: unknown) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(form)
  }

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 py-12 page-container">
      <div className="h-8 w-64 shimmer rounded mb-8" />
      <div className="h-96 shimmer rounded-2xl" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="page-container max-w-3xl">
        <div className="mb-10">
          <h1 className="section-title flex items-center gap-3">
            <User className="w-9 h-9 text-violet-600" /> My Profile
          </h1>
          <p className="section-subtitle">The more complete your profile, the more accurate your eligibility results</p>
        </div>

        {/* OCR Upload */}
        <div className="bg-white p-6 mb-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="font-display font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Upload className="w-5 h-5 text-violet-600" /> Auto-fill from Document
          </h2>
          <p className="text-gray-500 text-sm mb-4">Upload Aadhaar, Income Certificate, or Student ID — OCR + AI fills your profile automatically</p>

          <div className="mb-4">
            <label className="input-label text-xs font-semibold text-gray-700">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="select text-xs py-2 bg-white border-gray-300 text-gray-800 rounded-lg w-full sm:w-64"
            >
              <option value="general">General / Other Document</option>
              <option value="aadhaar">Aadhaar Card (identity/age/address)</option>
              <option value="income_cert">Income Certificate</option>
              <option value="student_id">Student ID Card</option>
            </select>
          </div>

          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragActive ? 'border-violet-500 bg-violet-50' : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50/40'
          }`}>
            <input {...getInputProps()} />
            {ocrMutation.isPending ? (
              <div className="flex flex-col items-center gap-2 text-violet-600">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm font-semibold">Processing document with OCR + AI...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <FileText className="w-8 h-8 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">{isDragActive ? 'Drop the image here' : 'Drag & drop image or click to upload'}</p>
                <p className="text-xs text-gray-400">Supports: JPG, PNG, WebP</p>
              </div>
            )}
          </div>
        </div>

        {/* NLP Auto-fill */}
        <div className="bg-white p-6 mb-6 rounded-2xl border border-gray-200 shadow-sm">
          <button onClick={() => setShowNlp(!showNlp)}
            className="w-full flex items-center justify-between text-left">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-fuchsia-600" />
              <span className="font-display font-bold text-gray-900">AI Profile Extraction</span>
              <span className="badge bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 text-xs font-semibold">New</span>
            </div>
            <span className="text-gray-500 text-sm font-semibold">{showNlp ? '▲ Hide' : '▼ Try it'}</span>
          </button>

          {showNlp && (
            <div className="mt-4 space-y-3">
              <p className="text-gray-500 text-sm">Describe yourself in plain English and AI will fill your profile</p>
              <textarea
                value={nlpText}
                onChange={(e) => setNlpText(e.target.value)}
                className="input min-h-[80px] resize-none border-gray-300"
                placeholder='e.g. "I am a 28-year-old female farmer from Tamil Nadu earning ₹1.5 lakh per year. I belong to SC category and own 2 acres of land."'
              />
              <button onClick={() => nlpMutation.mutate(nlpText)} disabled={!nlpText.trim() || nlpMutation.isPending}
                className="btn-primary gap-2">
                {nlpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Extract & Fill Profile
              </button>
            </div>
          )}
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="bg-white p-8 space-y-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="font-display font-bold text-gray-900 text-xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Profile Details
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Age</label>
              <input type="number" className="input" placeholder="25" min={0} max={120}
                value={form.age || ''} onChange={(e) => set('age', Number(e.target.value) || null)} />
            </div>
            <div>
              <label className="input-label">Gender</label>
              <select className="select" value={form.gender || ''} onChange={(e) => set('gender', e.target.value || null)}>
                <option value="">Select gender</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">State</label>
              <select className="select" value={form.state || ''} onChange={(e) => set('state', e.target.value || null)}>
                <option value="">Select state</option>
                {STATES.filter(Boolean).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">District</label>
              <input type="text" className="input" placeholder="e.g. Coimbatore"
                value={form.district || ''} onChange={(e) => set('district', e.target.value || null)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Annual Income (₹)</label>
              <input type="number" className="input" placeholder="150000"
                value={form.annual_income || ''} onChange={(e) => set('annual_income', e.target.value || null)} />
            </div>
            <div>
              <label className="input-label">Occupation</label>
              <select className="select" value={form.occupation || ''} onChange={(e) => set('occupation', e.target.value || null)}>
                <option value="">Select occupation</option>
                {['Farmer', 'Student', 'Salaried', 'Business', 'Self-employed', 'Unemployed', 'Housewife', 'Other'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Category</label>
              <select className="select" value={form.category || ''} onChange={(e) => set('category', e.target.value || null)}>
                <option value="">Select category</option>
                <option>General</option><option>OBC</option><option>SC</option><option>ST</option>
              </select>
            </div>
            <div>
              <label className="input-label">Education</label>
              <select className="select" value={form.education || ''} onChange={(e) => set('education', e.target.value || null)}>
                <option value="">Select education</option>
                {['No Education', 'Primary', 'Secondary', 'Higher Secondary', 'Graduate', 'Post-Graduate', 'PhD'].map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Marital Status</label>
              <select className="select" value={form.marital_status || ''} onChange={(e) => set('marital_status', e.target.value || null)}>
                <option value="">Select</option>
                <option>Single</option><option>Married</option><option>Widowed</option><option>Divorced</option>
              </select>
            </div>
            <div>
              <label className="input-label">Family Size</label>
              <input type="number" className="input" placeholder="4" min={1}
                value={form.family_size || ''} onChange={(e) => set('family_size', Number(e.target.value) || null)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Employment Status</label>
              <select className="select" value={form.employment_status || ''} onChange={(e) => set('employment_status', e.target.value || null)}>
                <option value="">Select</option>
                {['Employed', 'Unemployed', 'Self-employed', 'Student', 'Retired'].map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Land Ownership (acres)</label>
              <input type="number" step="0.01" className="input" placeholder="0.00"
                value={form.land_ownership_acres || ''} onChange={(e) => set('land_ownership_acres', e.target.value || null)} />
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {([
              { key: 'is_rural', label: 'Rural Resident' },
              { key: 'is_student', label: 'Currently Student' },
              { key: 'disability_status', label: 'Has Disability' },
            ] as Array<{ key: keyof ProfileData; label: string }>).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-2xs hover:border-gray-300">
                <div className={`relative w-11 h-6 rounded-full transition-colors ${form[key] ? 'bg-violet-600' : 'bg-gray-300'}`}
                  onClick={() => set(key, !form[key])}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${form[key] ? 'left-6' : 'left-1'}`} />
                </div>
                <span className="text-sm font-semibold text-gray-800">{label}</span>
              </label>
            ))}
          </div>

          <button type="submit" disabled={updateMutation.isPending} className="btn-primary w-full justify-center py-3.5 text-base font-bold shadow-lg shadow-violet-500/20">
            {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Profile</>}
          </button>
        </form>
      </div>
    </div>
  )
}
