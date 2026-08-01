'use client';

import React from 'react';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import { AdminMetricsProvider } from './context/AdminMetricsContext';

export default function AdminLayout({ children }) {
  return (
    <AdminMetricsProvider>
      <div className="min-h-screen bg-[#f4f7fa] flex flex-col font-sans text-slate-900">
        <AdminHeader />

        <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1600px] mx-auto">
          <AdminSidebar />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
        </div>

        <footer className="bg-[#0b2545] text-slate-300 border-t border-[#1e3a8a] py-4 text-xs text-center">
          <div className="max-w-6xl mx-auto px-4 space-y-1">
            <p className="font-semibold text-white">
              जबलपुर इंजीनियरिंग कॉलेज | Jabalpur Engineering College, Jabalpur (M.P.) - 482011
            </p>
            <p className="text-[11px] text-slate-400">
              Designed & Maintained by Jabalpur Engineering College.
            </p>
          </div>
        </footer>
      </div>
    </AdminMetricsProvider>
  );
}
