export function mapFormToStudent(student) {
  const studentInfo = student.studentInfo;

  return {
    id: student.id,
    applicationNo: student.id,
    rollNo: student.jeeRollNumber,
    name: student.fullName,
    gender: studentInfo
      ? studentInfo.gender === 'FEMALE'
        ? 'Girls'
        : 'Boys'
      : student.gender === 'FEMALE'
        ? 'Girls'
        : 'Boys',
    category: studentInfo
      ? studentInfo.allotedCategory === 'GENERAL'
        ? 'GEN'
        : studentInfo.allotedCategory
      : student.category === 'GENERAL'
        ? 'GEN'
        : student.category,
    branch: student.branch,
    program: 'B.Tech',
    year: student.admissionYear ? `${student.admissionYear} Year` : '1st Year',
    meritRank: studentInfo ? studentInfo.rank : 'N/A',
    marks: studentInfo?.marks ?? null,
    homeState: student.homeState,
    homeDistrict: studentInfo ? studentInfo.domicileStatus || 'N/A' : 'N/A',
    distanceKm: 0,
    submissionDate: new Date(student.createdAt).toISOString().split('T')[0],
    status: student.isVerified ? 'Verified' : 'Pending',
    verificationReason: student.verificationReason || null,
    unverifiedReasons: student.verificationReason
      ? student.verificationReason.split(' | ').filter(Boolean)
      : [],
    verificationDate: studentInfo?.date
      ? new Date(studentInfo.date).toISOString().split('T')[0]
      : null,
    assignedHostel: 'Unassigned',
    email: student.email,
    phone: studentInfo
      ? studentInfo.phoneNo || student.mobileNumber
      : student.mobileNumber,
    documents: {
      aadhaar: true,
      admissionLetter: true,
      markSheet: true,
      incomeCert: true,
    },
  };
}
