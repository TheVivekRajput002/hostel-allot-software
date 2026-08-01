import prisma from '../db/db.js';
import csv from 'csv-parser';
import { Readable } from 'stream';
import xlsx from 'xlsx';
import { allocateHostelSeats } from '../services/hostelAllocation.js'
import {
  evaluateHostelFormVerification,
  formatVerificationReasons,
} from '../services/verification.service.js'
import { repairSingleOccupancyRooms } from '../services/roomPairing.service.js'
import { BEDS_PER_ROOM } from '../services/hostelAllocation.js'

const getRowVal = (row, possibleKeys) => {
  for (const k of Object.keys(row)) {
    const normalizedKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (possibleKeys.includes(normalizedKey)) {
      return row[k];
    }
  }
  return undefined;
};

const normalizeCategory = (cat) => {
  if (!cat) return null;
  const upper = String(cat).trim().toUpperCase();
  if (upper === 'GENERAL' || upper === 'GEN' || upper === 'UR') return 'GENERAL';
  if (upper === 'OBC' || upper === 'OBC-NCL' || upper === 'OBCNCL') return 'OBC';
  if (upper === 'SC') return 'SC';
  if (upper === 'ST') return 'ST';
  if (upper === 'EWS') return 'EWS';
  if (upper === 'JK_MIGRANT_NORTHEAST' || upper.includes('JK') || upper.includes('MIGRANT') || upper.includes('NORTHEAST')) return 'JK_MIGRANT_NORTHEAST';
  return 'GENERAL';
};

const normalizeGender = (g) => {
  if (!g) return 'MALE';
  const upper = String(g).trim().toUpperCase();
  if (upper === 'FEMALE' || upper === 'F' || upper === 'GIRL' || upper === 'GIRLS') return 'FEMALE';
  return 'MALE';
};

export const uploadAdmissionData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Excel or CSV file is required.' });
    }

    // Read workbook synchronously using xlsx library (handles CSV, XLS, XLSX)
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    const formattedStudents = [];
    for (const row of rows) {
      const rollNo = getRowVal(row, ['rollno', 'rollnumber', 'jeerollno', 'jeerollnumber', 'roll']);
      const name = getRowVal(row, ['name', 'fullname', 'studentname', 'candidate']);

      if (!rollNo || !name) {
        continue; // Skip rows that don't have basic required fields
      }

      const serialNoVal = getRowVal(row, ['serialno', 'sno', 'srno', 'slno', 'serialnumber']);
      const rankVal = getRowVal(row, ['rank', 'jeerank', 'meritrank']);
      const marksVal = getRowVal(row, ['marks', 'jeemarks', 'score', 'percentile']);
      const dateVal = getRowVal(row, ['date', 'admissiondate', 'dateofadmission']);
      const roundVal = getRowVal(row, ['allotedround', 'allottedround', 'round', 'allotround']);

      let dateParsed = null;
      if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          dateParsed = d;
        }
      }

      formattedStudents.push({
        serialNo: serialNoVal ? parseInt(serialNoVal, 10) : null,
        rollNo: String(rollNo).trim(),
        name: String(name).trim(),
        eligibleCategory: normalizeCategory(getRowVal(row, ['eligiblecategory', 'eligcategory', 'category'])),
        allotedCategory: normalizeCategory(getRowVal(row, ['allotedcategory', 'allottedcategory', 'allotcategory'])) || 'GENERAL',
        rank: rankVal ? parseInt(rankVal, 10) : null,
        fatherName: getRowVal(row, ['fathername', 'fathersname', 'father']) ? String(getRowVal(row, ['fathername', 'fathersname', 'father'])).trim() : null,
        motherName: getRowVal(row, ['mothername', 'mothersname', 'mother']) ? String(getRowVal(row, ['mothername', 'mothersname', 'mother'])).trim() : null,
        domicileStatus: getRowVal(row, ['domicilestatus', 'domicile', 'homestate']) ? String(getRowVal(row, ['domicilestatus', 'domicile', 'homestate'])).trim() : null,
        gender: normalizeGender(getRowVal(row, ['gender', 'sex'])),
        marks: marksVal ? parseFloat(marksVal) : null,
        date: dateParsed,
        allotedRound: roundVal ? parseInt(roundVal, 10) : null,
        phoneNo: getRowVal(row, ['phoneno', 'phone', 'contact', 'contactno', 'mobileno', 'mobile']) ? String(getRowVal(row, ['phoneno', 'phone', 'contact', 'contactno', 'mobileno', 'mobile'])).trim() : null,
        status: getRowVal(row, ['status']) ? String(getRowVal(row, ['status'])).trim() : null,
        finalStatus: getRowVal(row, ['finalstatus']) ? String(getRowVal(row, ['finalstatus'])).trim() : null,
      });
    }

    if (formattedStudents.length === 0) {
      return res.status(400).json({
        message: 'No valid student records found. Please check that your file contains Name and Roll Number columns.'
      });
    }

    // Fast batch insert into PostgreSQL database
    const count = await prisma.student.createMany({
      data: formattedStudents,
      skipDuplicates: true, // Ignores duplicate rollNo records
    });

    return res.status(200).json({
      message: 'Admission data uploaded and imported successfully.',
      recordsInserted: count.count,
    });

  } catch (error) {
    console.error('File Upload Controller Error:', error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

export const runVerification = async (req, res) => {
  try {
    const forms = await prisma.hostelForm.findMany();
    const rollNumbers = forms.map((form) => form.jeeRollNumber);

    const students = rollNumbers.length
      ? await prisma.student.findMany({
          where: { rollNo: { in: rollNumbers } },
        })
      : [];

    const studentMap = {};
    students.forEach((student) => {
      studentMap[student.rollNo] = student;
    });

    let verifiedCount = 0;
    let unverifiedCount = 0;

    await prisma.$transaction(
      forms.map((form) => {
        const student = studentMap[form.jeeRollNumber] || null;
        const { isVerified, reasons } = evaluateHostelFormVerification(form, student);

        if (isVerified) verifiedCount += 1;
        else unverifiedCount += 1;

        return prisma.hostelForm.update({
          where: { id: form.id },
          data: {
            isVerified,
            verificationReason: isVerified ? null : formatVerificationReasons(reasons),
          },
        });
      })
    );

    return res.status(200).json({
      message: 'Verification process completed successfully.',
      verifiedCount,
      unverifiedCount,
    });
  } catch (error) {
    console.error('Run Verification Error:', error);
    return res.status(500).json({
      message: 'Failed to run verification process.',
      error: error.message,
    });
  }
};

export const getAdminMetrics = async (req, res) => {
  try {
    const [
      totalStudentsFilled,
      totalVerifiedStudents,
      boysAllotted,
      girlsAllotted,
      activeHostels,
    ] = await Promise.all([
      prisma.hostelForm.count(),
      prisma.hostelForm.count({ where: { isVerified: true } }),
      prisma.hostelAllotmentList.count({ where: { student: { gender: 'MALE' } } }),
      prisma.hostelAllotmentList.count({ where: { student: { gender: 'FEMALE' } } }),
      prisma.hostel.count({ where: { isActive: true } }),
    ]);

    return res.status(200).json({
      message: 'Admin metrics fetched successfully.',
      data: {
        totalStudentsFilled,
        totalVerifiedStudents,
        totalPendingVerification: totalStudentsFilled - totalVerifiedStudents,
        totalAllotted: boysAllotted + girlsAllotted,
        boysAllotted,
        girlsAllotted,
        activeHostels,
      },
    });
  } catch (error) {
    console.error('Get Admin Metrics Error:', error);
    return res.status(500).json({
      message: 'Failed to fetch admin metrics.',
      error: error.message,
    });
  }
};

export const getAllotedStudentsByGender = async (req, res) => {
  try {
    const { gender } = req.params;
    const normalizedGender = gender ? gender.toUpperCase() : '';

    if (!['MALE', 'FEMALE'].includes(normalizedGender)) {
      return res.status(400).json({
        message: 'Invalid gender parameter. Must be MALE or FEMALE.',
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();

    const where = {
      AND: [
        { student: { gender: normalizedGender } },
        ...(search
          ? [{
              OR: [
                { student: { name: { contains: search, mode: 'insensitive' } } },
                { student: { rollNo: { contains: search, mode: 'insensitive' } } },
                { room: { roomNumber: { contains: search, mode: 'insensitive' } } },
                { room: { hostel: { hostelNumber: { contains: search, mode: 'insensitive' } } } },
              ],
            }]
          : []),
      ],
    };

    const [total, allotmentList] = await Promise.all([
      prisma.hostelAllotmentList.count({ where }),
      prisma.hostelAllotmentList.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: {
              rollNo: true,
              name: true,
              rank: true,
              allotedCategory: true,
              gender: true,
            },
          },
          room: {
            select: {
              roomNumber: true,
              hostel: {
                select: { hostelNumber: true },
              },
            },
          },
        },
      }),
    ]);

    return res.status(200).json({
      message: `Allotted student list for gender ${normalizedGender} fetched successfully.`,
      count: total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      data: allotmentList,
    });
  } catch (error) {
    console.error('Get Alloted Students Error:', error);
    return res.status(500).json({
      message: 'Failed to fetch allotted student list.',
      error: error.message,
    });
  }
};

// ─── INVENTORY: Get all hostels with room counts ───
export const getHostelInventory = async (req, res) => {
  try {
    const hostels = await prisma.hostel.findMany({
      include: {
        rooms: {
          select: {
            id: true,
            _count: { select: { allotments: true } },
          },
        },
      },
      orderBy: { hostelNumber: 'asc' },
    });

    const boysHostels = [];
    const girlsHostels = [];

    for (const hostel of hostels) {
      const totalRooms = hostel.rooms.length;
      const occupiedBeds = hostel.rooms.reduce(
        (sum, room) => sum + room._count.allotments,
        0
      );
      const totalBeds = totalRooms * BEDS_PER_ROOM;
      const emptyBeds = totalBeds - occupiedBeds;
      const fullyOccupiedRooms = hostel.rooms.filter(
        (room) => room._count.allotments >= BEDS_PER_ROOM
      ).length;

      const hostelData = {
        id: hostel.id,
        hostelNumber: hostel.hostelNumber,
        genderDesignation: hostel.genderDesignation,
        totalRooms,
        occupiedRooms: fullyOccupiedRooms,
        occupiedBeds,
        emptyRooms: Math.ceil(emptyBeds / BEDS_PER_ROOM),
        emptyBeds,
        isActive: hostel.isActive,
      };

      if (hostel.genderDesignation === 'MALE') {
        boysHostels.push(hostelData);
      } else {
        girlsHostels.push(hostelData);
      }
    }

    return res.status(200).json({
      message: 'Hostel inventory fetched successfully.',
      data: { boysHostels, girlsHostels },
    });
  } catch (error) {
    console.error('Get Hostel Inventory Error:', error);
    return res.status(500).json({
      message: 'Failed to fetch hostel inventory.',
      error: error.message,
    });
  }
};

// ─── INVENTORY: Update active/empty state for hostels ───
export const updateHostelInventory = async (req, res) => {
  try {
    const { hostels } = req.body;
    // hostels: [{ id: hostelId, isActive: boolean }]

    if (!hostels || !Array.isArray(hostels)) {
      return res.status(400).json({
        message: 'Invalid request. Expected { hostels: [{ id, isActive }] }',
      });
    }

    const results = [];

    for (const entry of hostels) {
      const { id: hostelId, isActive } = entry;

      if (!hostelId) continue;

      // Update isActive state in DB
      await prisma.hostel.update({
        where: { id: hostelId },
        data: { isActive: !!isActive },
      });

      // If marked as isActive (meaning it is selected as empty for allotment),
      // we empty all of its rooms by removing their allotments.
      if (isActive) {
        // Find all rooms in this hostel
        const rooms = await prisma.room.findMany({
          where: { hostelId },
          select: { id: true },
        });
        const roomIds = rooms.map(r => r.id);

        if (roomIds.length > 0) {
          // Delete allotments for these rooms
          await prisma.hostelAllotmentList.deleteMany({
            where: { roomId: { in: roomIds } },
          });
        }
      }

      results.push({ hostelId, isActive: !!isActive, emptied: !!isActive });
    }

    return res.status(200).json({
      message: 'Hostel room inventory updated successfully.',
      results,
    });
  } catch (error) {
    console.error('Update Hostel Inventory Error:', error);
    return res.status(500).json({
      message: 'Failed to update hostel inventory.',
      error: error.message,
    });
  }
};

// ─── RUN HOSTEL ALLOTMENT ALGORITHM ───
export const allotmentRun = async (req, res) => {
  try {
    const verifiedForms = await prisma.hostelForm.findMany({
      where: { isVerified: true },
    });

    if (verifiedForms.length === 0) {
      return res.status(400).json({ message: 'Please verify the students first.' });
    }

    // Pair existing single-occupancy rooms by consecutive serialNo
    const maleRepair = await repairSingleOccupancyRooms('MALE');
    const femaleRepair = await repairSingleOccupancyRooms('FEMALE');

    const alreadyAllotted = await prisma.hostelAllotmentList.findMany({
      select: { studentId: true },
    });
    const allottedStudentIds = new Set(alreadyAllotted.map((a) => a.studentId));

    const studentWhere = {
      rollNo: { in: verifiedForms.map((form) => form.jeeRollNumber) },
    };
    if (allottedStudentIds.size > 0) {
      studentWhere.id = { notIn: [...allottedStudentIds] };
    }

    const students = await prisma.student.findMany({
      where: studentWhere,
    });

    const studentMale = students.filter((student) => student.gender === 'MALE');
    const studentFemale = students.filter((student) => student.gender === 'FEMALE');

    const fetchAvailableRooms = (genderDesignation) =>
      prisma.room.findMany({
        where: {
          hostel: { genderDesignation, isActive: true },
        },
        include: {
          allotments: {
            include: {
              student: { select: { id: true, serialNo: true } },
            },
          },
        },
      }).then((rooms) => rooms.filter((room) => room.allotments.length < BEDS_PER_ROOM));

    const availableMaleRooms = await fetchAvailableRooms('MALE');
    const availableFemaleRooms = await fetchAvailableRooms('FEMALE');

    const allocatedMaleSeats = allocateHostelSeats(studentMale, availableMaleRooms);
    const allocatedFemaleSeats = allocateHostelSeats(studentFemale, availableFemaleRooms);

    const allotmentsToCreate = [];
    for (const student of [...allocatedMaleSeats, ...allocatedFemaleSeats]) {
      if (student.roomId) {
        allotmentsToCreate.push({
          studentId: student.id,
          roomId: student.roomId,
        });
      }
    }

    if (allotmentsToCreate.length > 0) {
      await prisma.hostelAllotmentList.createMany({
        data: allotmentsToCreate,
        skipDuplicates: true,
      });
    }

    // Run repair again so newly allotted singles can pair up
    const maleRepairAfter = await repairSingleOccupancyRooms('MALE');
    const femaleRepairAfter = await repairSingleOccupancyRooms('FEMALE');

    return res.status(200).json({
      maleStudentsAllotted: allocatedMaleSeats.length,
      femaleStudentsAllotted: allocatedFemaleSeats.length,
      roomsPaired: {
        male: maleRepair.pairsMerged + maleRepairAfter.pairsMerged,
        female: femaleRepair.pairsMerged + femaleRepairAfter.pairsMerged,
      },
      message: 'Hostel Allotment Completed Successfully.',
    });
  } catch (error) {
    console.error('Allotment Run Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


