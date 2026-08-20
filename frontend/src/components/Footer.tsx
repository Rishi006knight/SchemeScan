import { Link } from 'react-router-dom'
import { Sparkles, Shield, ArrowUpRight } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-800 pt-16 pb-12 relative overflow-hidden">
      <div className="page-container relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-black text-xl text-white tracking-tight">
                Scheme<span className="gradient-text">Checker</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Empowering 1.4 billion citizens to discover, understand, and claim Central & State Government benefits with zero hassle through explainable AI.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium pt-1">
              <Shield className="w-4 h-4" />
              <span>100% Free & Open Citizen Welfare Initiative</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white text-sm tracking-wider uppercase">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/schemes" className="hover:text-white transition-colors">All 135+ Schemes</Link>
              </li>
              <li>
                <Link to="/eligibility" className="hover:text-white transition-colors">Check Eligibility</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">My Dashboard</Link>
              </li>
              <li>
                <Link to="/bookmarks" className="hover:text-white transition-colors">Saved Schemes</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white text-sm tracking-wider uppercase">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/schemes?category=Agriculture" className="hover:text-white transition-colors">Agriculture & Farming</Link>
              </li>
              <li>
                <Link to="/schemes?category=Education" className="hover:text-white transition-colors">Scholarships & Education</Link>
              </li>
              <li>
                <Link to="/schemes?category=Healthcare" className="hover:text-white transition-colors">Healthcare & Insurance</Link>
              </li>
              <li>
                <Link to="/schemes?category=Women" className="hover:text-white transition-colors">Women & Child Welfare</Link>
              </li>
              <li>
                <Link to="/schemes?category=MSME" className="hover:text-white transition-colors">MSME & Business Loans</Link>
              </li>
              <li>
                <Link to="/schemes?category=Pension" className="hover:text-white transition-colors">Pensions & Senior Citizens</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Portals & Trust */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white text-sm tracking-wider uppercase">Official Portals</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="https://www.myscheme.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white transition-colors">
                  myScheme Portal <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </a>
              </li>
              <li>
                <a href="https://pmkisan.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white transition-colors">
                  PM-KISAN Portal <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </a>
              </li>
              <li>
                <a href="https://nha.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white transition-colors">
                  National Health Authority <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </a>
              </li>
              <li>
                <a href="https://scholarships.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white transition-colors">
                  National Scholarship Portal <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {currentYear} SchemeChecker. Built for Indian Citizens.</p>
          <p className="text-center sm:text-right text-gray-400">
            ⚠️ Disclaimer: Data aggregated from official portals. Always verify terms on the respective government department site before applying.
          </p>
        </div>
      </div>
    </footer>
  )
}
