'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useAdminMetrics } from '../context/AdminMetricsContext';

const NAV_ITEMS = [
  {
    href: '/admin',
    label: 'Dashboard',
    description: 'Overview & Room Data',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/admin/students',
    label: 'Student List',
    description: 'Student Cards & Status',
    icon: Users,
    exact: false,
  },
  {
    href: '/admin/allotments',
    label: 'Allotment List',
    description: 'Hostel Allocation',
    icon: Building2,
    exact: false,
  },
];

function isActive(pathname, href, exact) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { metrics, isLoading } = useAdminMetrics();

  return (
    <aside className="w-full md:w-64 bg-[#0b2545] text-slate-200 flex flex-col border-r border-[#1e3a8a] shrink-0">
      <div className="p-4 border-b border-[#1e3a8a] bg-[#0a192f]">
        <div className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">
          Admin Navigation Menu
        </div>
        <div className="text-xs text-slate-400 mt-0.5">Select Page View below</div>
      </div>

      <nav className="p-3 space-y-1.5 flex-1">
        {NAV_ITEMS.map(({ href, label, description, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`w-full flex items-center justify-between px-3 py-3 rounded text-sm font-medium transition-all ${
                active
                  ? 'bg-[#1e3a8a] text-white border-l-4 border-amber-400 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                <div className="text-left leading-tight">
                  <div>{label}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{description}</div>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  active ? 'rotate-90 text-amber-400' : 'text-slate-500'
                }`}
              />
            </Link>
          );
        })}
      </nav>

      <div className="p-3 m-3 bg-[#0a192f] border border-[#1e3a8a] rounded text-xs space-y-2">
        <div className="font-semibold text-amber-300 pb-1 border-b border-slate-800 flex items-center justify-between">
          <span>Portal Summary</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="flex justify-between items-center text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Users className="w-3.5 h-3.5" /> Total Filled:
          </span>
          <span className="font-bold text-white">
            {isLoading ? '…' : metrics.totalStudentsFilled.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-300">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified:
          </span>
          <span className="font-bold text-emerald-400">
            {isLoading ? '…' : metrics.totalVerifiedStudents.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-300">
          <span className="flex items-center gap-1.5 text-amber-400">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Pending:
          </span>
          <span className="font-bold text-amber-400">
            {isLoading ? '…' : metrics.totalPendingVerification.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <div className="p-3 border-t border-[#1e3a8a] bg-[#071326] text-[11px] text-slate-400 text-center space-y-1">
        <div className="font-semibold text-slate-300">Jabalpur Engineering College</div>
        <div className="text-[10px] text-slate-500">
          Hostel Allocation Portal • Department of Information Technology
        </div>
      </div>
    </aside>
  );
}
