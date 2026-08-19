import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ChatbotWidget from '@/components/ChatbotWidget'
import MobileStickyCTA from '@/components/MobileStickyCTA'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ProfilePage from '@/pages/ProfilePage'
import SchemesPage from '@/pages/SchemesPage'
import SchemeDetailPage from '@/pages/SchemeDetailPage'
import EligibilityPage from '@/pages/EligibilityPage'
import DashboardPage from '@/pages/DashboardPage'
import BookmarksPage from '@/pages/BookmarksPage'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface-950 text-surface-100 selection:bg-primary-500 selection:text-white">
      <div>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
            <Route path="/schemes" element={<SchemesPage />} />
            <Route path="/schemes/:id" element={<SchemeDetailPage />} />

            {/* Protected */}
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/eligibility" element={<ProtectedRoute><EligibilityPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>

      <Footer />
      <ChatbotWidget />
      <MobileStickyCTA />
    </div>
  )
}
