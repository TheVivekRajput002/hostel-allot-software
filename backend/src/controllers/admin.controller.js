import prisma from '../db/db.js';
import csv from 'csv-parser';
import { Readable } from 'stream';

export const uploadAdmissionData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required.' });
    }

    const rows = [];
    // Convert req.file.buffer into a readable stream
    const stream = Readable.from(req.file.buffer);

    stream
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', async () => {
        try {
          // Format raw CSV string rows into schema data types
          const formattedStudents = rows.map((row) => ({
            serialNo: row.serialNo ? parseInt(row.serialNo, 10) : null,
            rollNo: String(row.rollNo || row.roll_no).trim(),
            name: String(row.name).trim(),
            eligibleCategory: row.eligibleCategory ? row.eligibleCategory.toUpperCase() : null,
            allotedCategory: row.allotedCategory ? row.allotedCategory.toUpperCase() : 'GENERAL',
            rank: row.rank ? parseInt(row.rank, 10) : null,
            fatherName: row.fatherName || null,
            motherName: row.motherName || null,
            domicileStatus: row.domicileStatus || null,
            gender: row.gender ? row.gender.toUpperCase() : 'MALE',
            marks: row.marks ? parseFloat(row.marks) : null,
            date: row.date ? new Date(row.date) : null,
            allotedRound: row.allotedRound ? parseInt(row.allotedRound, 10) : null,
            phoneNo: row.phoneNo || null,
            status: row.status || null,
            finalStatus: row.finalStatus || null,
          }));

          // Fast batch insert into PostgreSQL database
          const count = await prisma.student.createMany({
            data: formattedStudents,
            skipDuplicates: true, // Ignores duplicate rollNo records
          });

          return res.status(200).json({
            message: 'CSV data uploaded and imported successfully.',
            recordsInserted: count.count,
          });

        } catch (dbError) {
          console.error('Database Insertion Error:', dbError);
          return res.status(500).json({
            message: 'Failed to save CSV records to database.',
            error: dbError.message,
          });
        }
      });
  } catch (error) {
    console.error('CSV Upload Controller Error:', error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

export const runVerification = async (req, res) => {
  try {
    // Fetch all roll numbers present in the Student table
    const students = await prisma.student.findMany({
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




