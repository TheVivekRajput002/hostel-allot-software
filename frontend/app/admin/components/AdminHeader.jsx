'use client';

import React from 'react';
import { Landmark, Bell, UserCheck, ShieldCheck, HelpCircle } from 'lucide-react';

export default function AdminHeader() {
  return (
    <header className="w-full bg-[#0b2545] text-white border-b border-[#1e3a8a] shadow-sm">
      {/* Tricolor top border ribbon */}
      <div className="gov-top-ribbon" />

      {/* Main header banner */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Portal Title & Emblem */}
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
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                Government of India | भारत सरकार
              </span>
              <span className="hidden md:inline-block px-2 py-0.5 text-[10px] bg-[#166534] text-white rounded font-medium">
                Official Portal
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              National Hostel Allotment Portal
              <span className="text-xs font-normal text-slate-300 hidden lg:inline-block">
                (Admin Management System)
              </span>
            </h1>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3 text-xs">
          {/* Session Tag */}
          <div className="hidden sm:flex flex-col items-end border-r border-slate-700 pr-3">
            <span className="text-slate-400">Academic Session</span>
            <span className="font-semibold text-amber-300">2026 - 2027</span>
          </div>

          {/* User Badge */}
          <div className="flex items-center gap-2 pl-2">
          </div>
        </div>
      </div>

      {/* Sub-bar breadcrumb / state line */}
      <div className="bg-[#0f172a] px-4 py-1.5 text-xs text-slate-300 border-t border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
        </div>
        <div className="text-[11px] text-slate-400 hidden sm:block">
          JEC Hostel Allotment System v1.0
        </div>
      </div>
    </header>
  );
}
