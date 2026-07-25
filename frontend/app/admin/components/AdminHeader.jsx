'use client';

import React from 'react';
import { Landmark, Bell, UserCheck, ShieldCheck, HelpCircle } from 'lucide-react';

export default function AdminHeader({ activeTab }) {
  return (
    <header className="w-full bg-[#0b2545] text-white border-b border-[#1e3a8a] shadow-sm">
      {/* Tricolor top border ribbon */}
      <div className="gov-top-ribbon" />

      {/* Main header banner */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Portal Title & Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-[#1e3a8a] border border-[#3b82f6]/40 flex items-center justify-center text-amber-400 font-bold shadow-inner">
            <Landmark className="w-6 h-6" />
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

          {/* Quick Help / Info */}
          <button 
            type="button" 
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Helpdesk & Guidelines"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Helpdesk</span>
          </button>

          {/* User Badge */}
          <div className="flex items-center gap-2 pl-2">
            <div className="w-8 h-8 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
              AD
            </div>
            <div className="hidden md:block text-left">
              <div className="font-semibold leading-none text-slate-100">Chief Warden</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Admin ID: ADM-2026</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-bar breadcrumb / state line */}
      <div className="bg-[#0f172a] px-4 py-1.5 text-xs text-slate-300 border-t border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Section: <strong className="text-white capitalize">{activeTab === 'dashboard' ? 'Dashboard & Data Entry' : 'Verified Student Records'}</strong></span>
        </div>
        <div className="text-[11px] text-slate-400 hidden sm:block">
          NIC Hostel Allotment System v2.4 | Server: Normal
        </div>
      </div>
    </header>
  );
}
