'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Info, X, AlertTriangle } from 'lucide-react';

export default function PendingReasonInfo({ reasons }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const displayReasons = reasons?.length
    ? reasons
    : ['Verification has not been run yet. Use "Send For Verification" to evaluate this application.'];

  return (
    <div className="relative inline-flex" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="p-1 rounded-full text-amber-700 hover:bg-amber-100 border border-amber-300 transition-colors"
        aria-label="View pending verification reasons"
        title="Why is this pending?"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-20 w-72 sm:w-80 bg-white border-2 border-amber-300 rounded-lg shadow-xl overflow-hidden">
          <div className="bg-amber-50 px-3 py-2 border-b border-amber-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Pending Verification Reasons
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-amber-700 hover:text-amber-900 p-0.5"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <ul className="p-3 space-y-2 text-[11px] text-slate-700 max-h-48 overflow-y-auto">
            {displayReasons.map((reason, index) => (
              <li key={index} className="flex gap-2 leading-snug">
                <span className="text-amber-600 font-bold shrink-0">{index + 1}.</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
