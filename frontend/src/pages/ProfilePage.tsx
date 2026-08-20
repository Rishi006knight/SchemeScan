import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi, aiApi, type ProfileData } from '@/lib/api'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'
import {
  User, MapPin, IndianRupee, GraduationCap, Heart,
  Upload, Sparkles, Save, Loader2, CheckCircle2,
  Brain, Shield, AlertCircle
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
      toast.success('Profile saved successfully! ✅')
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
    onError: () => toast.error('OCR failed. Please ensure the document is clear and readable.'),
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

  // Calculate group completion states
  const isPersonalComplete = Boolean(form.age && form.gender && form.marital_status)
  const isLocationComplete = Boolean(form.state && form.district)
  const isFinancialComplete = Boolean(form.annual_income !== undefined && form.annual_income !== null && form.occupation && form.category)
  const isEducationComplete = Boolean(form.education && form.family_size)
  const isAdditionalComplete = form.disability_status !== undefined

  const totalCompletedGroups = [
    isPersonalComplete, isLocationComplete, isFinancialComplete, isEducationComplete, isAdditionalComplete
  ].filter(Boolean).length

  const completionPct = Math.round((totalCompletedGroups / 5) * 100)

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 py-12 page-container">
      <div className="h-8 w-64 shimmer rounded mb-8" />
      <div className="h-96 shimmer rounded-2xl" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-14">
      <div className="page-container max-w-5xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-black text-gray-900 flex items-center gap-3">
            <User className="w-8 h-8 text-violet-600" /> Citizen Profile
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Grouped parameters for instant matching across 135+ Central and State welfare rules.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form Content */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* AI Document Extraction Card */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-violet-300 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="font-display font-bold text-gray-900 text-base">
                  AI Document & Certificate Auto-Fill
                </h2>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Upload an Aadhaar card, income certificate, or student ID and our multimodal AI will auto-fill your profile parameters.
              </p>

              <div className="mb-4">
                <label className="input-label text-xs font-semibold">Select Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="select text-xs py-2 bg-white border-gray-300 text-gray-800 rounded-xl w-full sm:w-64"
                >
                  <option value="general">General / Other Document</option>
                  <option value="aadhaar">Aadhaar Card (identity/age/address)</option>
                  <option value="income_cert">Income Certificate (income/category)</option>
                  <option value="student_id">Student ID Card (education)</option>
                </select>
              </div>

              <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragActive ? 'border-violet-500 bg-violet-50' : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50/40'
              }`}>
                <input {...getInputProps()} />
                {ocrMutation.isPending ? (
                  <div className="flex flex-col items-center gap-2 text-violet-600 py-2">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm font-semibold">Analyzing document with Multimodal AI...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500 py-2">
                    <Upload className="w-8 h-8 text-violet-500" />
                    <p className="text-sm font-bold text-gray-800">{isDragActive ? 'Drop image here' : 'Drag & drop image or click to browse'}</p>
                    <p className="text-xs text-gray-400">Supports JPG, PNG, WebP</p>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
                <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Your documents are processed securely and never stored on our servers.</span>
              </div>
            </div>

            {/* NLP Plain Text Extraction */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <button
                type="button"
                onClick={() => setShowNlp(!showNlp)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-fuchsia-600" />
                  <span className="font-display font-bold text-gray-900 text-sm">Natural Language AI Extraction</span>
                  <span className="badge bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 text-[10px] font-bold">Fast</span>
                </div>
                <span className="text-violet-600 text-xs font-semibold">{showNlp ? 'Hide ▲' : 'Describe Yourself ▼'}</span>
              </button>

              {showNlp && (
                <div className="mt-4 space-y-3 pt-3 border-t border-gray-100">
                  <p className="text-gray-500 text-xs">Describe yourself in plain words (e.g. English or Hinglish):</p>
                  <textarea
                    value={nlpText}
                    onChange={(e) => setNlpText(e.target.value)}
                    className="input min-h-[75px] text-xs resize-none border-gray-300"
                    placeholder='e.g. "I am a 28-year-old female farmer from Tamil Nadu earning ₹1.5 lakh per year. I belong to SC category and own 2 acres of land."'
                  />
                  <button
                    type="button"
                    onClick={() => nlpMutation.mutate(nlpText)}
                    disabled={!nlpText.trim() || nlpMutation.isPending}
                    className="btn-primary btn-sm gap-1.5 text-xs font-bold"
                  >
                    {nlpMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Extract & Auto-Fill
                  </button>
                </div>
              )}
            </div>

            {/* Grouped Form */}
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Group 1: Personal Information */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 border-l-4 border-l-blue-500 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-gray-900 text-base flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" /> Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="input-label">Age</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="e.g. 28"
                      min={0}
                      max={120}
                      value={form.age ?? ''}
                      onChange={(e) => set('age', e.target.value ? Number(e.target.value) : null)}
                    />
                  </div>
                  <div>
                    <label className="input-label">Gender</label>
                    <select className="select" value={form.gender || ''} onChange={(e) => set('gender', e.target.value || null)}>
                      <option value="">Select gender</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Marital Status</label>
                    <select className="select" value={form.marital_status || ''} onChange={(e) => set('marital_status', e.target.value || null)}>
                      <option value="">Select status</option>
                      <option>Single</option><option>Married</option><option>Widowed</option><option>Divorced</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Group 2: Location */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 border-l-4 border-l-green-500 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-gray-900 text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" /> Location & Residence
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">State</label>
                    <select className="select" value={form.state || ''} onChange={(e) => set('state', e.target.value || null)}>
                      <option value="">Select state</option>
                      {STATES.filter(Boolean).map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">District</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Coimbatore"
                      value={form.district || ''}
                      onChange={(e) => set('district', e.target.value || null)}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer bg-gray-50 border border-gray-200 p-3 rounded-xl hover:bg-gray-100/70 w-full sm:w-auto inline-flex">
                    <div
                      className={`relative w-10 h-5 rounded-full transition-colors ${form.is_rural ? 'bg-violet-600' : 'bg-gray-300'}`}
                      onClick={() => set('is_rural', !form.is_rural)}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${form.is_rural ? 'left-5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">Rural Area Resident</span>
                  </label>
                </div>
              </div>

              {/* Group 3: Financial & Livelihood */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 border-l-4 border-l-amber-500 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-gray-900 text-base flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-amber-600" /> Financial & Livelihood
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Annual Family Income (₹)</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="Leave empty or enter e.g. 150000"
                      value={form.annual_income ?? ''}
                      onChange={(e) => set('annual_income', e.target.value ? Number(e.target.value) : null)}
                    />
                  </div>
                  <div>
                    <label className="input-label">Occupation</label>
                    <select className="select" value={form.occupation || ''} onChange={(e) => set('occupation', e.target.value || null)}>
                      <option value="">Select occupation</option>
                      {['Farmer', 'Student', 'Salaried', 'Business', 'Self-employed', 'Unemployed', 'Housewife', 'Other'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Social / Caste Category</label>
                    <select className="select" value={form.category || ''} onChange={(e) => set('category', e.target.value || null)}>
                      <option value="">Select category</option>
                      <option>General</option><option>OBC</option><option>SC</option><option>ST</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Agricultural Land Owned (acres)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      placeholder="0.00"
                      value={form.land_ownership_acres ?? ''}
                      onChange={(e) => set('land_ownership_acres', e.target.value ? Number(e.target.value) : null)}
                    />
                  </div>
                </div>
              </div>

              {/* Group 4: Education & Family */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 border-l-4 border-l-violet-500 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-gray-900 text-base flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-violet-600" /> Education & Family
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Highest Education</label>
                    <select className="select" value={form.education || ''} onChange={(e) => set('education', e.target.value || null)}>
                      <option value="">Select education</option>
                      {['No Education', 'Primary', 'Secondary', 'Higher Secondary', 'Graduate', 'Post-Graduate', 'PhD'].map(e => <option key={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Total Family Members</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="e.g. 4"
                      min={1}
                      value={form.family_size ?? ''}
                      onChange={(e) => set('family_size', e.target.value ? Number(e.target.value) : null)}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer bg-gray-50 border border-gray-200 p-3 rounded-xl hover:bg-gray-100/70 w-full sm:w-auto inline-flex">
                    <div
                      className={`relative w-10 h-5 rounded-full transition-colors ${form.is_student ? 'bg-violet-600' : 'bg-gray-300'}`}
                      onClick={() => set('is_student', !form.is_student)}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${form.is_student ? 'left-5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">Currently a Student</span>
                  </label>
                </div>
              </div>

              {/* Group 5: Additional Info */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 border-l-4 border-l-pink-500 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-gray-900 text-base flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" /> Additional Attributes
                </h3>

                <label className="flex items-center gap-3 cursor-pointer bg-gray-50 border border-gray-200 p-4 rounded-2xl hover:bg-gray-100/70">
                  <div
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.disability_status ? 'bg-pink-600' : 'bg-gray-300'}`}
                    onClick={() => set('disability_status', !form.disability_status)}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${form.disability_status ? 'left-6' : 'left-1'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Person with Disability (PwD)</p>
                    <p className="text-xs text-gray-500">Unlocks specialized assistive devices, pensions & 4% reservations</p>
                  </div>
                </label>
              </div>

              {/* Submit Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="btn-primary btn-shine w-full sm:w-auto px-10 py-4 text-base font-bold rounded-2xl shadow-xl shadow-violet-500/25 flex items-center justify-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving Profile Parameters...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Profile Details</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Desktop Sticky Sidebar Stepper */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24 space-y-6">
            
            {/* Completion Overview Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-gray-900 text-sm">Profile Health</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${completionPct === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-violet-100 text-violet-800'}`}>
                  {completionPct}% Complete
                </span>
              </div>

              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${completionPct === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-600 to-fuchsia-500'}`}
                  style={{ width: `${completionPct}%` }}
                />
              </div>

              {/* Vertical Stepper */}
              <div className="space-y-3 pt-2">
                {[
                  { label: 'Personal Information', isDone: isPersonalComplete, icon: User },
                  { label: 'Location & Residence', isDone: isLocationComplete, icon: MapPin },
                  { label: 'Financial & Livelihood', isDone: isFinancialComplete, icon: IndianRupee },
                  { label: 'Education & Family', isDone: isEducationComplete, icon: GraduationCap },
                  { label: 'Additional Attributes', isDone: isAdditionalComplete, icon: Heart },
                ].map((step, i) => {
                  const Icon = step.icon
                  return (
                    <div key={i} className="flex items-center gap-3 text-xs font-medium">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        step.isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {step.isDone ? <CheckCircle2 className="w-4 h-4" /> : <span>{i + 1}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Icon className={`w-3.5 h-3.5 ${step.isDone ? 'text-emerald-600' : 'text-gray-400'}`} />
                        <span className={step.isDone ? 'text-gray-900 font-bold' : 'text-gray-500'}>
                          {step.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {completionPct < 100 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Filling all sections ensures no state subsidies or welfare schemes are missed.</span>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
