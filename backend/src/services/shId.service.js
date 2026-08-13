import prisma from '../db/db.js';

/**
 * Generates and assigns sequential student hostel IDs (shId) for a list of students getting hostels.
 * The shId has the format: SH-<Year>-<4-digit sequential index> (e.g., SH-2026-0001, SH-2026-0002, ...)
 * It caches the next sequence number per year to avoid unnecessary database calls and updates the students.
 * 
 * @param {Array} students - List of student objects getting allotted.
 * @param {Object} rollToYearMap - A map of student roll number to their admission year.
 * @returns {Promise<Array>} - List of students updated with their shId.
 */
export async function assignStudentHostelIds(students, rollToYearMap = {}) {
  if (!Array.isArray(students) || students.length === 0) {
    return students;
  }

  const currentYear = new Date().getFullYear();
  const sequenceCounters = {}; // Maps year -> nextSequence

  const studentsWithShId = [];

  for (const student of students) {
    const year = rollToYearMap[student.rollNo] || currentYear;
    
    // Initialize sequence counter for this year if not already cached
    if (sequenceCounters[year] === undefined) {
      const prefix = `SH-${year}-`;
      const lastStudent = await prisma.student.findFirst({
        where: {
          shId: {
            startsWith: prefix,
          },
        },
        orderBy: {
          shId: 'desc',
        },
      });

      let lastSeq = 0;
      if (lastStudent && lastStudent.shId) {
        const parts = lastStudent.shId.split('-');
        const lastSeqStr = parts[parts.length - 1];
        const parsedSeq = parseInt(lastSeqStr, 10);
        if (!isNaN(parsedSeq)) {
          lastSeq = parsedSeq;
        }
      }
      sequenceCounters[year] = lastSeq + 1;
    }

    const nextSeq = sequenceCounters[year];
    const paddedSeq = String(nextSeq).padStart(4, '0');
    const shId = `SH-${year}-${paddedSeq}`;

    // Update local object
    student.shId = shId;
    
    studentsWithShId.push({
      id: student.id,
      shId,
    });

    sequenceCounters[year] = nextSeq + 1;
  }

  // Update student records in the database
  if (studentsWithShId.length > 0) {
    await Promise.all(
      studentsWithShId.map((s) =>
        prisma.student.update({
          where: { id: s.id },
          data: { shId: s.shId },
        })
      )
    );
  }

  return students;
}
