'use client';

import React, { useState } from 'react';
import { 
  X, CheckCircle2, Clock, ShieldCheck, User, Phone, Mail, MapPin, 
  GraduationCap, Award, FileText, Check, AlertTriangle
} from 'lucide-react';

export default function StudentDetailModal({ student, onClose, onUpdateStudent }) {
  const [currentStatus, setCurrentStatus] = useState(student?.status);
  const [docs, setDocs] = useState(student?.documents ? { ...student.documents } : {});
  const [successMsg, setSuccessMsg] = useState('');

  if (!student) return null;

  const toggleDoc = (docKey) => {
    setDocs(prev => ({ ...prev, [docKey]: !prev[docKey] }));
  };

  const handleSave = () => {
    const updated = {
      ...student,
      status: currentStatus,
      verificationDate: currentStatus === 'Verified' ? new Date().toISOString().split('T')[0] : null,
      documents: docs
    };
    onUpdateStudent(updated);
    setSuccessMsg('Student verification details updated successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-2 border-[#0f2c59] rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Modal Header */}
        <div className="bg-[#0b2545] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#1e3a8a]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold">
              Official Student Application Record
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs text-slate-800">
          
          {/* Student Profile Header Box */}
          <div className="bg-slate-100 border border-slate-300 rounded p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Application ID: <span className="text-[#0f2c59] font-extrabold">{student.applicationNo}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{student.name}</h3>
              <div className="text-slate-600 mt-1 flex flex-wrap items-center gap-4 text-xs">
                <span>Roll No: <strong className="text-slate-900">{student.rollNo}</strong></span>
                <span>Gender: <strong>{student.gender}</strong></span>
                <span>Category: <strong>{student.category}</strong></span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Verification Status</span>
              {student.status === 'Verified' ? (
                <span className="gov-badge-verified text-xs font-bold px-3 py-1 rounded inline-flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-4 h-4" /> Verified (सत्यापित)
                </span>
              ) : (
                <span className="gov-badge-pending text-xs font-bold px-3 py-1 rounded inline-flex items-center gap-1 mt-1">
                  <Clock className="w-4 h-4" /> Pending (लंबित)
                </span>
              )}
            </div>
          </div>

          {/* Academic & Merit Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 border border-slate-300 rounded">
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Academic Program</span>
              <div className="font-semibold text-slate-900 text-xs mt-0.5">{student.branch} ({student.program})</div>
              <div className="text-slate-600 mt-0.5">{student.year}</div>
            </div>

            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase">All India Merit Rank</span>
              <div className="font-bold text-amber-800 text-sm mt-0.5">Rank #{student.meritRank}</div>
              <div className="text-slate-600 mt-0.5">Category Quota: {student.category}</div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Home Location & Distance</span>
              <div className="font-semibold text-slate-900 mt-0.5">{student.homeDistrict}, {student.homeState}</div>
              <div className="text-slate-600 mt-0.5">Distance to Institute: {student.distanceKm} KM</div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Contact Info</span>
              <div className="font-medium text-slate-800 mt-0.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> {student.email}
              </div>
              <div className="font-medium text-slate-800 mt-0.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> {student.phone}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-300 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#0f2c59] hover:bg-[#1e3a8a] text-white rounded text-xs font-bold"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}
