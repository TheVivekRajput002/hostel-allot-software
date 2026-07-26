'use client';

import React, { useState } from 'react';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import DashboardView from './components/DashboardView';
import StudentListView from './components/StudentListView';
import StudentDetailModal from './components/StudentDetailModal';
import AllotmentListView from './components/AllotmentListView';

// Import initial dummy data
import { 
  initialMetrics, 
  initialHostelsData, 
  initialExcelUploads, 
  initialStudentList 
} from '../data/dummyAdminData';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'student-list'

  // Application State backed by dummy data
  const [metrics, setMetrics] = useState(initialMetrics);
  const [hostelsData, setHostelsData] = useState(initialHostelsData);
  const [excelUploads, setExcelUploads] = useState(initialExcelUploads);
  const [studentList, setStudentList] = useState(initialStudentList);

  // Selected student for detail modal
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Handle student record updates from modal
  const handleUpdateStudent = (updatedStudent) => {
    setStudentList(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    
    // Update metric counts dynamically
    const updatedList = studentList.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    const verifiedCount = updatedList.filter(s => s.status === 'Verified').length;
    const pendingCount = updatedList.filter(s => s.status === 'Pending').length;

    setMetrics(prev => ({
      ...prev,
      totalVerifiedStudents: 1000 + verifiedCount,
      totalPendingVerification: 400 + pendingCount,
    }));
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex flex-col font-sans text-slate-900">
      {/* Top Government Banner & Navbar Header */}
      <AdminHeader activeTab={activeTab} />

      {/* Main Admin Body: Left Sidebar + Right Content Area */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1600px] mx-auto">
        
        {/* Left Navbar Sidebar */}
        <AdminSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          metrics={metrics} 
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
  <DashboardView
    metrics={metrics}
    hostelsData={hostelsData}
    setHostelsData={setHostelsData}
    excelUploads={excelUploads}
    setExcelUploads={setExcelUploads}
  />
)}

{activeTab === 'student-list' && (
  <StudentListView
    studentList={studentList}
    setStudentList={setStudentList}
    onSelectStudent={(student) => setSelectedStudent(student)}
  />
)}

{activeTab === 'allotment-list' && (
  <AllotmentListView
    studentList={studentList}
  />
)}
        </main>
      </div>

      {/* Official Footer Banner */}
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

      {/* Student Detail Verification Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onUpdateStudent={handleUpdateStudent}
        />
      )}
    </div>
  );
}
