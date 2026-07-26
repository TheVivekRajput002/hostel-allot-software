'use client';

import React from 'react';
import {
    Building2,
    Users,
    BedDouble,
    Download,
    FileText
} from 'lucide-react';

export default function AllotmentListView() {

    return (

        <div className="space-y-6">

            {/* Header */}

            <div className="bg-[#0b2545] text-white rounded-md p-5 shadow">

                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Building2 className="text-amber-400"/>
                    Hostel Allotment List
                </h2>

                <p className="text-sm text-slate-300 mt-1">
                    Verified students eligible for hostel allotment.
                </p>

            </div>

            {/* Statistics */}

            <div className="grid grid-cols-4 gap-4">

                <div className="gov-card p-4">
                    <p className="text-xs text-slate-500">
                        Verified Students
                    </p>

                    <h3 className="text-2xl font-bold text-[#0f2c59]">
                        245
                    </h3>
                </div>

                <div className="gov-card p-4">
                    <p className="text-xs text-slate-500">
                        Boys
                    </p>

                    <h3 className="text-2xl font-bold text-blue-700">
                        155
                    </h3>
                </div>

                <div className="gov-card p-4">
                    <p className="text-xs text-slate-500">
                        Girls
                    </p>

                    <h3 className="text-2xl font-bold text-pink-700">
                        90
                    </h3>
                </div>

                <div className="gov-card p-4">
                    <p className="text-xs text-slate-500">
                        Hostel Capacity
                    </p>

                    <h3 className="text-2xl font-bold text-green-700">
                        180
                    </h3>
                </div>

            </div>

            {/* Candidate Table */}

            <div className="gov-card p-5">

                <h3 className="font-bold text-[#0f2c59] mb-4">
                    Verified Students
                </h3>

                <table className="w-full text-sm">

                    <thead>

                        <tr className="border-b">

                            <th className="text-left py-3">
                                Roll No
                            </th>

                            <th className="text-left">
                                Name
                            </th>

                            <th>
                                Rank
                            </th>

                            <th>
                                Category
                            </th>

                            <th>
                                Gender
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {/* verified students */}

                    </tbody>

                </table>

            </div>

            {/* Button */}

            <div className="flex justify-center">

                <button
                    className="px-8 py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg font-bold flex items-center gap-2"
                >

                    <FileText className="w-5 h-5"/>

                    Generate Hostel Allotment List

                </button>

            </div>

        </div>

    )

}