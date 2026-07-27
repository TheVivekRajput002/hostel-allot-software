'use client';

import React, { useState, useEffect } from 'react';
import {
    Building2,
    Users,
    BedDouble,
    FileText,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Search
} from 'lucide-react';

export default function AllotmentListView() {
    const [allotmentBoys, setAllotmentBoys] = useState([]);
    const [allotmentGirls, setAllotmentGirls] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [activeTab, setActiveTab] = useState('boys'); // 'boys' | 'girls'
    const [searchTerm, setSearchTerm] = useState('');

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Fetch allotment lists from backend
    const fetchAllotments = async () => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const [boysRes, girlsRes] = await Promise.all([
                fetch(`${apiBaseUrl}/api/admin/allotment/MALE`),
                fetch(`${apiBaseUrl}/api/admin/allotment/FEMALE`)
            ]);

            if (!boysRes.ok || !girlsRes.ok) {
                throw new Error('Failed to fetch allotment data');
            }

            const boysData = await boysRes.json();
            const girlsData = await girlsRes.json();

            setAllotmentBoys(boysData.data || []);
            setAllotmentGirls(girlsData.data || []);
        } catch (err) {
            console.error('Error fetching allotments:', err);
            setErrorMsg('Failed to load live allotment records from server.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllotments();
    }, []);

    // Run allotment algorithm
    const handleGenerateAllotment = async () => {
        setIsGenerating(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const res = await fetch(`${apiBaseUrl}/api/admin/allotment/run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to generate hostel allotment');
            }

            setSuccessMsg(
                `${data.message || 'Allotment generated successfully!'} (Allotted: ${data.maleStudentsAllotted} Boys, ${data.femaleStudentsAllotted} Girls)`
            );
            
            // Refresh lists
            await fetchAllotments();
        } catch (err) {
            console.error('Error generating allotment:', err);
            setErrorMsg(err.message || 'An error occurred while generating allotments.');
        } finally {
            setIsGenerating(false);
        }
    };

    const currentAllotments = activeTab === 'boys' ? allotmentBoys : allotmentGirls;

    // Filtered list based on search term
    const filteredAllotments = currentAllotments.filter(item => {
        const student = item.student || {};
        const room = item.room || {};
        const hostel = room.hostel || {};
        
        const term = searchTerm.toLowerCase();
        return (
            (student.rollNo || '').toLowerCase().includes(term) ||
            (student.name || '').toLowerCase().includes(term) ||
            (room.roomNumber || '').toLowerCase().includes(term) ||
            (hostel.hostelNumber || '').toLowerCase().includes(term)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-[#0b2545] text-white rounded-md p-5 shadow flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Building2 className="text-amber-400"/>
                        Hostel Allotment List
                    </h2>
                    <p className="text-sm text-slate-300 mt-1">
                        Allotted students mapped to their hostels and room numbers.
                    </p>
                </div>
                
                <button
                    onClick={fetchAllotments}
                    disabled={isLoading}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded flex items-center gap-1.5 transition-colors"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Lists
                </button>
            </div>

            {/* Notifications */}
            {successMsg && (
                <div className="p-4 bg-emerald-100 border border-emerald-400 text-emerald-850 rounded-md text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            {errorMsg && (
                <div className="p-4 bg-rose-100 border border-rose-400 text-rose-850 rounded-md text-sm font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="gov-card p-4">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                        Total Allotted Students
                    </p>
                    <h3 className="text-2xl font-bold text-[#0f2c59] mt-1">
                        {allotmentBoys.length + allotmentGirls.length}
                    </h3>
                </div>

                <div className="gov-card p-4">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                        Boys Allotted
                    </p>
                    <h3 className="text-2xl font-bold text-blue-700 mt-1">
                        {allotmentBoys.length}
                    </h3>
                </div>

                <div className="gov-card p-4">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                        Girls Allotted
                    </p>
                    <h3 className="text-2xl font-bold text-pink-700 mt-1">
                        {allotmentGirls.length}
                    </h3>
                </div>

                <div className="gov-card p-4">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                        Total Active Hostels
                    </p>
                    <h3 className="text-2xl font-bold text-emerald-700 mt-1">
                        {isLoading ? '—' : '11'}
                    </h3>
                </div>
            </div>

            {/* Search and Tabs controls */}
            <div className="bg-white p-4 rounded-md shadow border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                {/* Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('boys')}
                        className={`px-4 py-2 text-xs font-bold rounded border transition-colors ${
                            activeTab === 'boys'
                                ? 'bg-[#0f2c59] text-white border-[#0f2c59]'
                                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                    >
                        Boys Hostel List ({allotmentBoys.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('girls')}
                        className={`px-4 py-2 text-xs font-bold rounded border transition-colors ${
                            activeTab === 'girls'
                                ? 'bg-[#0f2c59] text-white border-[#0f2c59]'
                                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                    >
                        Girls Hostel List ({allotmentGirls.length})
                    </button>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Search className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search name, roll number, hostel..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0f2c59]"
                    />
                </div>
            </div>

            {/* Candidate Table */}
            <div className="gov-card p-5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-[#0f2c59] capitalize">
                        {activeTab} Allotment Details
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-300 text-slate-700 font-bold bg-slate-100">
                                <th className="py-3 px-3">Roll No</th>
                                <th className="py-3 px-3">Name</th>
                                <th className="py-3 px-3">Rank</th>
                                <th className="py-3 px-3">Category</th>
                                <th className="py-3 px-3">Hostel</th>
                                <th className="py-3 px-3">Room</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-slate-500 font-semibold">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-[#0f2c59]" />
                                            Loading allotment records...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAllotments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-slate-500 font-semibold">
                                        No allotment records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredAllotments.map((item) => {
                                    const student = item.student || {};
                                    const room = item.room || {};
                                    const hostel = room.hostel || {};
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="py-2.5 px-3 font-semibold text-slate-800">{student.rollNo}</td>
                                            <td className="py-2.5 px-3 font-semibold text-[#0f2c59]">{student.name}</td>
                                            <td className="py-2.5 px-3 text-slate-650">{student.rank ?? '—'}</td>
                                            <td className="py-2.5 px-3">
                                                <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-bold text-slate-700">
                                                    {student.allotedCategory || 'GENERAL'}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-[10px] font-bold text-blue-800">
                                                    {hostel.hostelNumber ? `Hostel ${hostel.hostelNumber}` : '—'}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 font-bold text-slate-800">
                                                {room.roomNumber ?? '—'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Run Button */}
            <div className="flex justify-center pt-4">
                <button
                    onClick={handleGenerateAllotment}
                    disabled={isGenerating || isLoading}
                    className={`px-8 py-3.5 rounded-lg font-bold flex items-center gap-2 shadow-md transition-colors ${
                        isGenerating || isLoading
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed border-slate-300'
                            : 'bg-green-700 hover:bg-green-800 text-white border-green-800'
                    }`}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating Hostel Allotment List...
                        </>
                    ) : (
                        <>
                            <FileText className="w-5 h-5" />
                            Generate Hostel Allotment List
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}