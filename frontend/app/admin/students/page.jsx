'use client';

import React, { useState } from 'react';
import StudentListView from '../components/StudentListView';
import StudentDetailModal from '../components/StudentDetailModal';
import { useAdminMetrics } from '../context/AdminMetricsContext';

export default function AdminStudentsPage() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { refresh: refreshMetrics } = useAdminMetrics();

  const handleUpdateStudent = () => {
    refreshMetrics();
  };

  return (
    <>
      <StudentListView
        onSelectStudent={setSelectedStudent}
        onDataChange={refreshMetrics}
      />

      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onUpdateStudent={handleUpdateStudent}
        />
      )}
    </>
  );
}
