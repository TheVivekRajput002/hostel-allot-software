'use client';

import React, { useState } from 'react';
import { 
  Users, CheckCircle2, Clock, Building2, UploadCloud, 
  FileSpreadsheet, Download, Save, RefreshCw, AlertCircle, Info, Check, ShieldCheck
} from 'lucide-react';

export default function DashboardView({ 
  metrics, 
  hostelsData, 
  setHostelsData, 
  excelUploads, 
  setExcelUploads 
}) {
  const [selectedGenderTab, setSelectedGenderTab] = useState('boys'); // 'boys' or 'girls'
  const [hostelFormState, setHostelFormState] = useState(hostelsData);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  
  // Excel File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // Handle room availability input change
  const handleRoomChange = (gender, hostelId, newEmptyRooms) => {
    const parsed = parseInt(newEmptyRooms) || 0;
    const key = gender === 'boys' ? 'boysHostels' : 'girlsHostels';
    
    setHostelFormState(prev => ({
      ...prev,
      [key]: prev[key].map(h => h.id === hostelId ? { ...h, emptyRooms: parsed } : h)
    }));
  };

  // Save Hostel Room Data
  const handleSaveHostelRooms = (e) => {
    e.preventDefault();
    setHostelsData(hostelFormState);
    setSaveSuccessMsg('Hostel empty room availability data successfully updated and saved!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Handle Excel File Drop/Select
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle Excel Submit
  const handleExcelSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setTimeout(() => {
      const newRecord = {
        id: `ex-${Date.now()}`,
        fileName: selectedFile.name,
        uploadDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        totalRows: Math.floor(Math.random() * 300) + 100,
        verifiedRows: Math.floor(Math.random() * 300) + 95,
        status: 'Completed',
        uploadedBy: 'Chief Warden (Admin)'
      };

      setExcelUploads([newRecord, ...excelUploads]);
      setSelectedFile(null);
      setIsUploading(false);
      setUploadSuccessMsg(`Admission file "${newRecord.fileName}" uploaded and processed successfully!`);
      setTimeout(() => setUploadSuccessMsg(''), 5000);
    }, 1200);
  };

  // Calculate total empty rooms dynamically from form state
  const totalBoysEmpty = hostelFormState.boysHostels.reduce((acc, curr) => acc + (parseInt(curr.emptyRooms) || 0), 0);
  const totalGirlsEmpty = hostelFormState.girlsHostels.reduce((acc, curr) => acc + (parseInt(curr.emptyRooms) || 0), 0);
  const totalEmptyRooms = totalBoysEmpty + totalGirlsEmpty;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-amber-50 border border-amber-300 rounded p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Official Directive:</span> Admin hostel room capacity forms and admission list uploads directly affect the automatic merit allocation process. Ensure all empty room counts are accurate before closing the session.
        </div>
      </div>

      {/* METRIC CARDS */}
      <div>
        <div className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2 border-b border-slate-300 pb-1.5">
          <ShieldCheck className="w-4 h-4 text-[#0f2c59]" />
          <span>Section A: Key Allotment Statistics & Summary</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Total Filled */}
          <div className="gov-card p-4 border-l-4 border-l-[#0f2c59] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Students Filled Form
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {metrics.totalStudentsFilled.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Total Online Applications</div>
            </div>
            <div className="w-12 h-12 rounded bg-slate-100 border border-slate-300 flex items-center justify-center text-[#0f2c59]">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Verified Students */}
          <div className="gov-card p-4 border-l-4 border-l-emerald-600 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Verified Students
              </div>
              <div className="text-2xl font-bold text-emerald-800 mt-1">
                {metrics.totalVerifiedStudents.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">Ready for Hostel Allotment</div>
            </div>
            <div className="w-12 h-12 rounded bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Pending Verification */}
          <div className="gov-card p-4 border-l-4 border-l-amber-600 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                Pending Verification
              </div>
              <div className="text-2xl font-bold text-amber-900 mt-1">
                {metrics.totalPendingVerification.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-amber-700 mt-1">Documents Under Review</div>
            </div>
            <div className="w-12 h-12 rounded bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-700">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: HOSTEL ROOM AVAILABILITY DATA ENTRY FORM */}
      <div className="gov-card overflow-hidden">
        {/* Header */}
        <div className="bg-[#0b2545] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#1e3a8a]">
          <div>
            <h2 className="text-sm md:text-base font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              Section B: Hostel Wise Available Empty Rooms Data Entry
            </h2>
            <p className="text-xs text-slate-300">
              Fill empty room counts for Boys Hostels (H1 to H8) and Girls Hostels (H1 to H3)
            </p>
          </div>

          {/* Save Status alert if any */}
          {saveSuccessMsg && (
            <div className="px-3 py-1 bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 animate-pulse">
              <Check className="w-4 h-4" />
              {saveSuccessMsg}
            </div>
          )}
        </div>

        {/* Gender Tabs */}
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
              Boys Hostels (H1 - H8) — {totalBoysEmpty} Empty Rooms
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
              Girls Hostels (H1 - H3) — {totalGirlsEmpty} Empty Rooms
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveHostelRooms}
            className="px-4 py-2 text-xs font-bold bg-[#166534] hover:bg-[#14532d] text-white rounded border border-[#14532d] flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Room Availability Data
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveHostelRooms} className="p-4">
          {selectedGenderTab === 'boys' ? (
            <div>
              <div className="text-xs font-bold text-slate-700 mb-3 bg-blue-50 border border-blue-200 p-2 rounded flex justify-between items-center">
                <span>Boys Hostels List (H1, H2, H3, H4, H5, H6, H7, H8)</span>
                <span className="text-[11px] text-slate-500 font-normal">Edit empty rooms count directly in the table below</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2.5 border-r border-slate-300">Code</th>
                      <th className="p-2.5 border-r border-slate-300">Hostel Name & Block</th>
                      <th className="p-2.5 border-r border-slate-300">Total Rooms</th>
                      <th className="p-2.5 border-r border-slate-300">Current Occupied</th>
                      <th className="p-2.5 border-r border-slate-300 bg-amber-100 text-amber-900">Available Empty Rooms (Fill Here)</th>
                      <th className="p-2.5">Warden / Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {hostelFormState.boysHostels.map((hostel, index) => (
                      <tr key={hostel.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50 hover:bg-amber-50/50'}>
                        <td className="p-2.5 font-bold text-[#0f2c59] border-r border-slate-300">
                          <span className="px-2 py-0.5 bg-[#0f2c59] text-white rounded text-[11px]">
                            {hostel.code}
                          </span>
                        </td>
                        <td className="p-2.5 font-semibold text-slate-900 border-r border-slate-300">
                          {hostel.name}
                        </td>
                        <td className="p-2.5 border-r border-slate-300 text-slate-700">
                          {hostel.totalRooms} rooms ({hostel.capacity} beds)
                        </td>
                        <td className="p-2.5 border-r border-slate-300 text-slate-700">
                          {hostel.occupied} students
                        </td>
                        <td className="p-2.5 border-r border-slate-300 bg-amber-50/80">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max={hostel.totalRooms}
                              value={hostel.emptyRooms}
                              onChange={(e) => handleRoomChange('boys', hostel.id, e.target.value)}
                              className="w-24 px-2 py-1 border border-slate-400 rounded bg-white text-slate-900 font-bold text-sm focus:ring-2 focus:ring-[#0f2c59] focus:outline-none"
                            />
                            <span className="text-[11px] text-slate-500">Rooms</span>
                          </div>
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
          ) : (
            <div>
              <div className="text-xs font-bold text-slate-700 mb-3 bg-pink-50 border border-pink-200 p-2 rounded flex justify-between items-center">
                <span>Girls Hostels List (H1, H2, H3)</span>
                <span className="text-[11px] text-slate-500 font-normal">Edit empty rooms count directly in the table below</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2.5 border-r border-slate-300">Code</th>
                      <th className="p-2.5 border-r border-slate-300">Hostel Name & Block</th>
                      <th className="p-2.5 border-r border-slate-300">Total Rooms</th>
                      <th className="p-2.5 border-r border-slate-300">Current Occupied</th>
                      <th className="p-2.5 border-r border-slate-300 bg-amber-100 text-amber-900">Available Empty Rooms (Fill Here)</th>
                      <th className="p-2.5">Warden / Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {hostelFormState.girlsHostels.map((hostel, index) => (
                      <tr key={hostel.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50 hover:bg-amber-50/50'}>
                        <td className="p-2.5 font-bold text-[#0f2c59] border-r border-slate-300">
                          <span className="px-2 py-0.5 bg-[#0f2c59] text-white rounded text-[11px]">
                            {hostel.code}
                          </span>
                        </td>
                        <td className="p-2.5 font-semibold text-slate-900 border-r border-slate-300">
                          {hostel.name}
                        </td>
                        <td className="p-2.5 border-r border-slate-300 text-slate-700">
                          {hostel.totalRooms} rooms ({hostel.capacity} beds)
                        </td>
                        <td className="p-2.5 border-r border-slate-300 text-slate-700">
                          {hostel.occupied} students
                        </td>
                        <td className="p-2.5 border-r border-slate-300 bg-amber-50/80">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max={hostel.totalRooms}
                              value={hostel.emptyRooms}
                              onChange={(e) => handleRoomChange('girls', hostel.id, e.target.value)}
                              className="w-24 px-2 py-1 border border-slate-400 rounded bg-white text-slate-900 font-bold text-sm focus:ring-2 focus:ring-[#0f2c59] focus:outline-none"
                            />
                            <span className="text-[11px] text-slate-500">Rooms</span>
                          </div>
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
          )}

          {/* Form Submit Footer */}
          <div className="mt-4 pt-3 border-t border-slate-300 flex justify-end gap-3">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#166534] hover:bg-[#14532d] text-white rounded border border-[#14532d] flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save Hostel Available Rooms Data
            </button>
          </div>
        </form>
      </div>

      {/* SECTION C: ADMISSION DATA SUBMISSION (EXCEL FORMAT) */}
      <div className="gov-card overflow-hidden">
        {/* Header */}
        <div className="bg-[#0b2545] text-white px-4 py-3 border-b border-[#1e3a8a]">
          <h2 className="text-sm md:text-base font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            Section C: Admission Data Submission (Excel Format)
          </h2>
          <p className="text-xs text-slate-300">
            Submit newly admitted students list in official Excel format (.xlsx / .csv) for verification and hostel mapping
          </p>
        </div>

        <div className="p-4 space-y-6">
          {uploadSuccessMsg && (
            <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-800 rounded text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              {uploadSuccessMsg}
            </div>
          )}

          <div>
            {/* Upload Form Area */}
            <form onSubmit={handleExcelSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-slate-400 rounded-md p-6 bg-slate-50 text-center hover:bg-slate-100/80 transition-colors">
                <UploadCloud className="w-10 h-10 text-[#0f2c59] mx-auto mb-2" />
                <div className="text-sm font-bold text-slate-800">
                  Select or Drag Admission Excel File (.xlsx / .csv)
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Upload official merit / admission lists provided by the academic cell containing Roll No, Name, Rank, Category, and Gender.
                </p>

                <div className="mt-4 flex flex-wrap justify-center items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 bg-[#0f2c59] hover:bg-[#1e3a8a] text-white rounded text-xs font-semibold shadow-sm inline-flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                    Browse Computer Files
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {selectedFile && (
                  <div className="mt-4 p-2 bg-amber-50 border border-amber-300 rounded inline-block text-xs font-semibold text-amber-900">
                    Selected File: <span className="font-bold underline">{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => alert("Downloading Standard Admission Excel Template (.xlsx)...")}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-[#0f2c59]" />
                  Download Standard Format Template (.xlsx)
                </button>

                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className={`px-5 py-2 text-xs font-bold rounded border flex items-center gap-2 shadow-sm ${
                    !selectedFile || isUploading
                      ? 'bg-slate-300 text-slate-500 border-slate-300 cursor-not-allowed'
                      : 'bg-[#ea580c] hover:bg-[#c2410c] text-white border-[#c2410c]'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processing Admission Data...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" /> Submit Admission Data File
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
