'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, CheckCircle2, Clock, Building2, UploadCloud,
  FileSpreadsheet, Save, RefreshCw, AlertCircle, Check, ShieldCheck, Loader2
} from 'lucide-react';
import { fetchJson } from '../lib/api';
import { useAdminMetrics } from '../context/AdminMetricsContext';

const HOSTEL_DISPLAY_MAP = {
  'MALE-H1': { name: 'Boys Hostel 1 (Tagore Hall)', capacity: 200, warden: 'Dr. R. K. Sharma', phone: '+91 98765 43210' },
  'MALE-H2': { name: 'Boys Hostel 2 (Nehru Bhavan)', capacity: 240, warden: 'Prof. A. P. Verma', phone: '+91 98765 43211' },
  'MALE-H3': { name: 'Boys Hostel 3 (Patel Block)', capacity: 220, warden: 'Dr. Suresh Mehta', phone: '+91 98765 43212' },
  'MALE-H4': { name: 'Boys Hostel 4 (Bose Block)', capacity: 180, warden: 'Dr. Vinay Pandey', phone: '+91 98765 43213' },
  'MALE-H5': { name: 'Boys Hostel 5 (Raman Block)', capacity: 190, warden: 'Prof. M. L. Gupta', phone: '+91 98765 43214' },
  'MALE-H6': { name: 'Boys Hostel 6 (Bhagat Block)', capacity: 210, warden: 'Dr. Ashok Tiwari', phone: '+91 98765 43215' },
  'MALE-H7': { name: 'Boys Hostel 7 (Shastri Block)', capacity: 230, warden: 'Prof. R. N. Singh', phone: '+91 98765 43216' },
  'MALE-H8': { name: 'Boys Hostel 8 (Ambedkar Block)', capacity: 200, warden: 'Dr. Prakash Jain', phone: '+91 98765 43217' },
  'FEMALE-H1': { name: 'Girls Hostel 1 (Gargi Bhavan)', capacity: 240, warden: 'Dr. Sunita Rao', phone: '+91 98765 43218' },
  'FEMALE-H2': { name: 'Girls Hostel 2 (Kalpana Block)', capacity: 220, warden: 'Prof. Meenakshi Sundaram', phone: '+91 98765 43219' },
  'FEMALE-H3': { name: 'Girls Hostel 3 (Sarojini House)', capacity: 250, warden: 'Dr. Ananya Mukherjee', phone: '+91 98765 43220' },
};

export default function DashboardView() {
  const { metrics, isLoading: metricsLoading, refresh: refreshMetrics } = useAdminMetrics();

  const [selectedGenderTab, setSelectedGenderTab] = useState('boys');
  const [hostelFormState, setHostelFormState] = useState({ boysHostels: [], girlsHostels: [] });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveErrorMsg, setSaveErrorMsg] = useState('');
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [inventoryErrorMsg, setInventoryErrorMsg] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadErrorMsg, setUploadErrorMsg] = useState('');
  const [excelUploads, setExcelUploads] = useState([]);

  const fetchInventory = async () => {
    setIsLoadingInventory(true);
    setInventoryErrorMsg('');
    try {
      const resData = await fetchJson('/api/admin/inventory');

      const mapHostels = (hostels, gender) =>
        hostels.map((h) => {
          const displayKey = `${gender}-${h.hostelNumber}`;
          const display = HOSTEL_DISPLAY_MAP[displayKey] || {};
          return {
            id: h.id,
            code: h.hostelNumber,
            name: display.name || `${gender === 'MALE' ? 'Boys' : 'Girls'} Hostel ${h.hostelNumber}`,
            totalRooms: h.totalRooms,
            emptyRooms: h.emptyRooms,
            capacity: display.capacity || h.totalRooms * 2,
            occupied: h.occupiedRooms,
            warden: display.warden || '—',
            phone: display.phone || '—',
            isActive: h.isActive,
          };
        });

      const inventoryData = {
        boysHostels: mapHostels(resData.data.boysHostels, 'MALE'),
        girlsHostels: mapHostels(resData.data.girlsHostels, 'FEMALE'),
      };
      setHostelFormState(inventoryData);
    } catch (err) {
      console.error('Inventory fetch error:', err);
      setInventoryErrorMsg('Failed to load hostel data from server.');
    } finally {
      setIsLoadingInventory(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleActiveToggle = (gender, hostelId) => {
    const key = gender === 'boys' ? 'boysHostels' : 'girlsHostels';
    setHostelFormState((prev) => ({
      ...prev,
      [key]: prev[key].map((h) =>
        h.id === hostelId ? { ...h, isActive: !h.isActive } : h
      ),
    }));
  };

  const handleSaveHostelRooms = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      const allHostels = [
        ...hostelFormState.boysHostels.map((h) => ({ id: h.id, isActive: h.isActive })),
        ...hostelFormState.girlsHostels.map((h) => ({ id: h.id, isActive: h.isActive })),
      ];

      const data = await fetchJson('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostels: allHostels }),
      });

      setSaveSuccessMsg(data.message || 'Selected hostels marked as empty/active successfully!');
      await fetchInventory();
      await refreshMetrics();
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (error) {
      setSaveErrorMsg(error.message || 'Failed to save hostel room data.');
      setTimeout(() => setSaveErrorMsg(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleExcelSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadSuccessMsg('');
    setUploadErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('csvFile', selectedFile);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/admission-data`,
        { method: 'POST', body: formData }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to upload admission data');

      const newRecord = {
        id: `ex-${Date.now()}`,
        fileName: selectedFile.name,
        uploadDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        totalRows: data.recordsInserted || 0,
        status: 'Completed',
      };

      setExcelUploads((prev) => [newRecord, ...prev]);
      setSelectedFile(null);
      setUploadSuccessMsg(data.message || `Admission file "${newRecord.fileName}" uploaded successfully!`);
      await refreshMetrics();
      setTimeout(() => setUploadSuccessMsg(''), 5000);
    } catch (error) {
      setUploadErrorMsg(error.message || 'Failed to upload admission data.');
      setTimeout(() => setUploadErrorMsg(''), 6000);
    } finally {
      setIsUploading(false);
    }
  };

  const totalBoysRooms = hostelFormState.boysHostels.reduce(
    (acc, curr) => acc + (parseInt(curr.totalRooms, 10) || 0), 0
  );
  const totalGirlsRooms = hostelFormState.girlsHostels.reduce(
    (acc, curr) => acc + (parseInt(curr.totalRooms, 10) || 0), 0
  );

  const renderHostelTable = (hostels, gender, label, headerClass) => (
    <div>
      <div className={`text-xs font-bold text-slate-700 mb-3 ${headerClass} p-2 rounded flex justify-between items-center`}>
        <span>{label}</span>
        <span className="text-[11px] text-slate-500 font-normal">
          Select which hostels are empty/available for allotment below
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse border border-slate-300">
          <thead className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
            <tr>
              <th className="p-2.5 border-r border-slate-300">Select</th>
              <th className="p-2.5 border-r border-slate-300">Code</th>
              <th className="p-2.5 border-r border-slate-300">Hostel Name & Block</th>
              <th className="p-2.5 border-r border-slate-300">Total Rooms</th>
              <th className="p-2.5 border-r border-slate-300">Occupied Rooms</th>
              <th className="p-2.5 border-r border-slate-300 text-emerald-800 bg-emerald-50">Empty Rooms</th>
              <th className="p-2.5">Warden / Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {hostels.map((hostel, index) => (
              <tr key={hostel.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50 hover:bg-amber-50/50'}>
                <td className="p-2.5 border-r border-slate-300 text-center">
                  <input
                    type="checkbox"
                    checked={hostel.isActive || false}
                    onChange={() => handleActiveToggle(gender, hostel.id)}
                    className="w-4 h-4 rounded text-[#0f2c59] focus:ring-[#0f2c59] border-slate-300 cursor-pointer"
                  />
                </td>
                <td className="p-2.5 font-bold text-[#0f2c59] border-r border-slate-300">
                  <span className="px-2 py-0.5 bg-[#0f2c59] text-white rounded text-[11px]">{hostel.code}</span>
                </td>
                <td className="p-2.5 font-semibold text-slate-900 border-r border-slate-300">{hostel.name}</td>
                <td className="p-2.5 border-r border-slate-300 text-slate-700">{hostel.totalRooms} rooms</td>
                <td className="p-2.5 border-r border-slate-300 text-slate-700">
                  {hostel.isActive ? '0 (Marked Empty)' : `${hostel.occupied} students`}
                </td>
                <td className="p-2.5 border-r border-slate-300 bg-emerald-50/50">
                  <span className="font-bold text-emerald-700">
                    {hostel.isActive ? hostel.totalRooms : hostel.totalRooms - hostel.occupied}
                  </span>
                  <span className="text-[11px] text-slate-500 ml-1">rooms</span>
                </td>
                <td className="p-2.5 text-slate-600">
                  <div>{hostel.warden}</div>
                  <div className="text-[10px] text-slate-400">{hostel.phone}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2 border-b border-slate-300 pb-1.5">
          <ShieldCheck className="w-4 h-4 text-[#0f2c59]" />
          <span>Key Allotment Statistics & Summary</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Students Filled Form', value: metrics.totalStudentsFilled, sub: 'Total Online Applications', icon: Users, color: 'border-l-[#0f2c59]', iconBg: 'bg-slate-100 border-slate-300 text-[#0f2c59]' },
            { label: 'Verified Students', value: metrics.totalVerifiedStudents, sub: 'Ready for Hostel Allotment', icon: CheckCircle2, color: 'border-l-emerald-600', iconBg: 'bg-emerald-50 border-emerald-300 text-emerald-700', textColor: 'text-emerald-700', valueColor: 'text-emerald-800' },
            { label: 'Pending Verification', value: metrics.totalPendingVerification, sub: 'Documents Under Review', icon: Clock, color: 'border-l-amber-600', iconBg: 'bg-amber-50 border-amber-300 text-amber-700', textColor: 'text-amber-800', valueColor: 'text-amber-900' },
          ].map(({ label, value, sub, icon: Icon, color, iconBg, textColor, valueColor }) => (
            <div key={label} className={`gov-card p-4 border-l-4 ${color} flex items-center justify-between`}>
              <div>
                <div className={`text-xs font-semibold uppercase tracking-wider ${textColor || 'text-slate-500'}`}>{label}</div>
                <div className={`text-2xl font-bold mt-1 ${valueColor || 'text-slate-900'}`}>
                  {metricsLoading ? '…' : value.toLocaleString('en-IN')}
                </div>
                <div className={`text-[11px] mt-1 ${textColor ? textColor.replace('800', '600').replace('700', '600') : 'text-slate-500'}`}>{sub}</div>
              </div>
              <div className={`w-12 h-12 rounded border flex items-center justify-center ${iconBg}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="gov-card overflow-hidden">
        <div className="bg-[#0b2545] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#1e3a8a]">
          <h2 className="text-sm md:text-base font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            Hostel Wise Empty Status & Allotment Selection
          </h2>
          {saveSuccessMsg && (
            <div className="px-3 py-1 bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 animate-pulse">
              <Check className="w-4 h-4" /> {saveSuccessMsg}
            </div>
          )}
          {saveErrorMsg && (
            <div className="px-3 py-1 bg-rose-700 text-white rounded text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {saveErrorMsg}
            </div>
          )}
        </div>

        <div className="bg-slate-100 border-b border-slate-300 p-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedGenderTab('boys')}
              className={`px-4 py-2 text-xs font-bold rounded border transition-colors ${
                selectedGenderTab === 'boys'
                  ? 'bg-[#0f2c59] text-white border-[#0f2c59] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              Boys Hostels (H1 - H8) — {totalBoysRooms} Total Rooms
            </button>
            <button
              type="button"
              onClick={() => setSelectedGenderTab('girls')}
              className={`px-4 py-2 text-xs font-bold rounded border transition-colors ${
                selectedGenderTab === 'girls'
                  ? 'bg-[#0f2c59] text-white border-[#0f2c59] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              Girls Hostels (H1 - H3) — {totalGirlsRooms} Total Rooms
            </button>
          </div>
          <button
            type="button"
            onClick={fetchInventory}
            disabled={isLoadingInventory}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-200 rounded flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInventory ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {inventoryErrorMsg && (
          <div className="mx-4 mt-3 p-2 bg-amber-50 border border-amber-300 text-amber-800 rounded text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {inventoryErrorMsg}
          </div>
        )}

        {isLoadingInventory ? (
          <div className="p-8 flex flex-col items-center justify-center text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#0f2c59]" />
            <span className="text-sm font-semibold">Loading hostel inventory...</span>
          </div>
        ) : (
          <form onSubmit={handleSaveHostelRooms} className="p-4">
            {selectedGenderTab === 'boys'
              ? renderHostelTable(hostelFormState.boysHostels, 'boys', 'Boys Hostels List (H1 - H8)', 'bg-blue-50 border border-blue-200')
              : renderHostelTable(hostelFormState.girlsHostels, 'girls', 'Girls Hostels List (H1 - H3)', 'bg-pink-50 border border-pink-200')}
            <div className="mt-4 pt-3 border-t border-slate-300 flex justify-end gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className={`px-5 py-2 text-xs font-bold rounded border flex items-center gap-2 shadow-sm ${
                  isSaving
                    ? 'bg-slate-300 text-slate-500 border-slate-300 cursor-not-allowed'
                    : 'bg-[#166534] hover:bg-[#14532d] text-white border-[#14532d]'
                }`}
              >
                {isSaving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Active Status to Database</>}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="gov-card overflow-hidden">
        <div className="bg-[#0b2545] text-white px-4 py-3 border-b border-[#1e3a8a]">
          <h2 className="text-sm md:text-base font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            Admission Data Submission (Excel Format)
          </h2>
        </div>
        <div className="p-4 space-y-6">
          {uploadSuccessMsg && (
            <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-800 rounded text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" /> {uploadSuccessMsg}
            </div>
          )}
          {uploadErrorMsg && (
            <div className="p-3 bg-rose-100 border border-rose-400 text-rose-800 rounded text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700" /> {uploadErrorMsg}
            </div>
          )}
          <form onSubmit={handleExcelSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-slate-400 rounded-md p-6 bg-slate-50 text-center hover:bg-slate-100/80 transition-colors">
              <UploadCloud className="w-10 h-10 text-[#0f2c59] mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-800">Select or Drag Admission Excel File (.xlsx / .csv)</div>
              <div className="mt-4 flex flex-wrap justify-center items-center gap-3">
                <label className="cursor-pointer px-4 py-2 bg-[#0f2c59] hover:bg-[#1e3a8a] text-white rounded text-xs font-semibold shadow-sm inline-flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  Browse Computer Files
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileSelect} className="hidden" />
                </label>
              </div>
              {selectedFile && (
                <div className="mt-4 p-2 bg-amber-50 border border-amber-300 rounded inline-block text-xs font-semibold text-amber-900">
                  Selected File: <span className="font-bold underline">{selectedFile.name}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className={`px-5 py-2 text-xs font-bold rounded border flex items-center gap-2 shadow-sm ${
                  !selectedFile || isUploading
                    ? 'bg-slate-300 text-slate-500 border-slate-300 cursor-not-allowed'
                    : 'bg-[#ea580c] hover:bg-[#c2410c] text-white border-[#c2410c]'
                }`}
              >
                {isUploading ? 'Processing...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
