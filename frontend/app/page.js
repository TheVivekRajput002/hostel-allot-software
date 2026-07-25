import StudentForm from './components/StudentForm';
import { Building2, Shield, Mail, PhoneCall } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-main)' }}>
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b backdrop-blur-md bg-white/90" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm overflow-hidden bg-white"
>
  <img
    src="/jec_logo.png"
    alt="College Logo"
    className="w-8 h-8 object-contain"
  />
</div>
            <div>
              <span className="font-bold text-base tracking-tight block" style={{ color: 'var(--text-main)' }}>
                Hostel Allotment Portal
              </span>
              <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>
                Student Application Module
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <span className="hidden sm:flex items-center gap-1.5 font-medium px-3 py-1 rounded-full text-xs" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Form Status: Open
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-16">
        <StudentForm />
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-xs mt-auto" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}>
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p>© 2026 Hostel Allotment System — Designed for Admissions & Student Support</p>
          <div className="flex justify-center gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> hostel-helpdesk@institute.ac.in
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Official Portal
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
