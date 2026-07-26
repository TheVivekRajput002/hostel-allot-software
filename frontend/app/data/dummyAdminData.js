// Dummy data for Admin Portal (Indian Government Hostel Allocation System)

export const initialMetrics = {
  totalStudentsFilled: 1450,
  totalVerifiedStudents: 1020,
  totalPendingVerification: 430,
  totalCapacity: 1800,
  totalRoomsAvailable: 525,
  lastUpdated: '2026-07-25 18:30 IST',
};

export const initialHostelsData = {
  boysHostels: [
    { id: 'b1', code: 'H1', name: 'Boys Hostel 1 (Tagore Hall)', totalRooms: 100, emptyRooms: 24, capacity: 200, occupied: 152, warden: 'Dr. R. K. Sharma', phone: '+91 98765 43210' },
    { id: 'b2', code: 'H2', name: 'Boys Hostel 2 (Nehru Bhavan)', totalRooms: 120, emptyRooms: 45, capacity: 240, occupied: 150, warden: 'Prof. A. P. Verma', phone: '+91 98765 43211' },
    { id: 'b3', code: 'H3', name: 'Boys Hostel 3 (Patel Block)', totalRooms: 110, emptyRooms: 18, capacity: 220, occupied: 184, warden: 'Dr. Suresh Mehta', phone: '+91 98765 43212' },
  ],
  girlsHostels: [
    { id: 'g1', code: 'H1', name: 'Girls Hostel 1 (Gargi Bhavan)', totalRooms: 120, emptyRooms: 35, capacity: 240, occupied: 170, warden: 'Dr. Sunita Rao', phone: '+91 98765 43218' },
    { id: 'g2', code: 'H2', name: 'Girls Hostel 2 (Kalpana Block)', totalRooms: 110, emptyRooms: 48, capacity: 220, occupied: 124, warden: 'Prof. Meenakshi Sundaram', phone: '+91 98765 43219' },
    { id: 'g3', code: 'H3', name: 'Girls Hostel 3 (Sarojini House)', totalRooms: 125, emptyRooms: 15, capacity: 250, occupied: 220, warden: 'Dr. Ananya Mukherjee', phone: '+91 98765 43220' },
  ],
};

export const initialExcelUploads = [
  { id: 'ex-1', fileName: 'JEE_Main_Admissions_2026_Batch1.xlsx', uploadDate: '2026-07-20 11:45 AM', totalRows: 850, verifiedRows: 842, status: 'Completed', uploadedBy: 'Admin (System Officer)' },
  { id: 'ex-2', fileName: 'MTech_GATE_Admissions_2026.xlsx', uploadDate: '2026-07-22 03:15 PM', totalRows: 320, verifiedRows: 320, status: 'Completed', uploadedBy: 'Academic Cell' },
  { id: 'ex-3', fileName: 'DASA_International_Quota_Admissions.xlsx', uploadDate: '2026-07-24 10:00 AM', totalRows: 60, verifiedRows: 58, status: 'Completed', uploadedBy: 'International Affairs' },
];

export const initialStudentList = [
  {
    id: 'STU-1008',
    applicationNo: 'APP2026008',
    rollNo: '2026MM103',
    name: 'Sneha Chhetri',
    gender: 'Girls',
    category: 'GEN',
    branch: 'Metallurgical Engg',
    program: 'B.Tech',
    year: '1st Year',
    meritRank: 2150,
    homeState: 'Assam',
    homeDistrict: 'Guwahati',
    distanceKm: 1420,
    submissionDate: '2026-07-20',
    status: 'Pending',
    verificationDate: null,
    assignedHostel: 'Unassigned',
    email: 'sneha.chhetri@example.com',
    phone: '+91 98890 12345',
    documents: { aadhaar: true, admissionLetter: true, markSheet: true, incomeCert: false }
  },
  {
    id: 'STU-1009',
    applicationNo: 'APP2026009',
    rollNo: '2026CS188',
    name: 'Mohammed Tariq Khan',
    gender: 'Boys',
    category: 'OBC',
    branch: 'Computer Science & Engg',
    program: 'B.Tech',
    year: '1st Year',
    meritRank: 780,
    homeState: 'Telangana',
    homeDistrict: 'Hyderabad',
    distanceKm: 1100,
    submissionDate: '2026-07-21',
    status: 'Verified',
    verificationDate: '2026-07-23',
    assignedHostel: 'Unassigned',
    email: 'tariq.khan@example.com',
    phone: '+91 98901 23456',
    documents: { aadhaar: true, admissionLetter: true, markSheet: true, incomeCert: true }
  },
  {
    id: 'STU-1010',
    applicationNo: 'APP2026010',
    rollNo: '2026ME144',
    name: 'Aditya Narayan Naik',
    gender: 'Boys',
    category: 'GEN',
    branch: 'Mechanical Engineering',
    program: 'B.Tech',
    year: '1st Year',
    meritRank: 1540,
    homeState: 'Odisha',
    homeDistrict: 'Bhubaneswar',
    distanceKm: 980,
    submissionDate: '2026-07-22',
    status: 'Pending',
    verificationDate: null,
    assignedHostel: 'Unassigned',
    email: 'aditya.naik@example.com',
    phone: '+91 99012 34567',
    documents: { aadhaar: true, admissionLetter: false, markSheet: true, incomeCert: true }
  }
];
