import prisma from '../db/db.js'
import {allocateHostelSeats} from '../services/hostelAllocation.js'

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
    // Fetch roll numbers of students whose finalStatus is not cancelled
    const students = await prisma.student.findMany({
      where: {
        NOT: {
          finalStatus: {
            equals: 'cancelled',
            mode: 'insensitive',
          },
        },
      },
      select: { rollNo: true },
    });
    const validRollNumbers = students.map((s) => s.rollNo);

    // Update isVerified to true for hostel forms with matching JEE roll numbers
    const verifiedResult = await prisma.hostelForm.updateMany({
      where: {
        jeeRollNumber: {
          in: validRollNumbers,
        },
      },
      data: {
        isVerified: true,
      },
    });

    // Update isVerified to false for hostel forms without matching JEE roll numbers
    const unverifiedResult = await prisma.hostelForm.updateMany({
      where: {
        jeeRollNumber: {
          notIn: validRollNumbers,
        },
      },
      data: {
        isVerified: false,
      },
    });

    return res.status(200).json({
      message: 'Verification process completed successfully.',
      verifiedCount: verifiedResult.count,
      unverifiedCount: unverifiedResult.count,
    });
  } catch (error) {
    console.error('Run Verification Error:', error);
    return res.status(500).json({
      message: 'Failed to run verification process.',
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

    const allotmentList = await prisma.hostelAllotmentList.findMany({
      where: {
        student: {
          gender: normalizedGender,
        },
      },
      include: {
        student: true,
        room: {
          include: {
            hostel: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: `Allotted student list for gender ${normalizedGender} fetched successfully.`,
      count: allotmentList.length,
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
          include: {
            allotments: true,
          },
        },
      },
      orderBy: { hostelNumber: 'asc' },
    });

    const boysHostels = [];
    const girlsHostels = [];

    for (const hostel of hostels) {
      const totalRooms = hostel.rooms.length;
      const occupiedRooms = hostel.rooms.filter(r => r.allotments.length > 0).length;
      const emptyRooms = totalRooms - occupiedRooms;

      const hostelData = {
        id: hostel.id,
        hostelNumber: hostel.hostelNumber,
        genderDesignation: hostel.genderDesignation,
        totalRooms,
        occupiedRooms,
        emptyRooms,
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
    const rollNumbers = await prisma.hostelForm.findMany({
      where: {
        isVerified: true,
      },
    });

    if (rollNumbers.length === 0) {
      return res.status(400).json({ message: "Please verify the students first." });
    }

    const students = await prisma.student.findMany({
      where: {
        rollNo: {
          in: rollNumbers.map((form) => form.jeeRollNumber),
        },
      },
    });

    const studentMale = students.filter((student) => student.gender === 'MALE');
    const studentFemale = students.filter((student) => student.gender === 'FEMALE');

    // Fetch unoccupied rooms belonging to active MALE hostels
    const activeMaleRooms = await prisma.room.findMany({
      where: {
        hostel: {
          genderDesignation: 'MALE',
          isActive: true,
        },
      },
      include: {
        allotments: true,
      },
    });
    const emptyMaleRooms = activeMaleRooms.filter(r => r.allotments.length === 0);

    // Fetch unoccupied rooms belonging to active FEMALE hostels
    const activeFemaleRooms = await prisma.room.findMany({
      where: {
        hostel: {
          genderDesignation: 'FEMALE',
          isActive: true,
        },
      },
      include: {
        allotments: true,
      },
    });
    const emptyFemaleRooms = activeFemaleRooms.filter(r => r.allotments.length === 0);

    const allocatedMaleSeats = allocateHostelSeats(studentMale, emptyMaleRooms);
    const allocatedFemaleSeats = allocateHostelSeats(studentFemale, emptyFemaleRooms);

    // Persist allotments to the database
    const allotmentsToCreate = [];
    const allAllocatedStudents = [...allocatedMaleSeats, ...allocatedFemaleSeats];

    for (const student of allAllocatedStudents) {
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

    return res.status(200).json({
      maleStudentsAllotted: allocatedMaleSeats.length,
      femaleStudentsAllotted: allocatedFemaleSeats.length,
      message: "Hostel Allotment Completed Successfully.",
    });
  } catch (error) {
    console.error('Allotment Run Error:', error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const removeGeneratedList = async (req,res)=>{
  try{

    const generatedStudentList = await prisma.hostelAllotmentList.deleteMany({})
    if(generatedStudentList.count==0){
      return res.status(404).json({message:"List is already Empty."})
    }
    return res.status(200).json({message:"All generated List students are removed from DB."})
  }catch(error){
    console.log('Generated List Removal Error: ',error);
    res.status(500).json({message:"Internal Server Error",error:error.message})
  }
}
