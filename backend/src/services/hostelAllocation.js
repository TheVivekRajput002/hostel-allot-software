/**
 * Hostel Seat Allocation System
 * 
 * Allocation Rules:
 * 1. AIUR Quota: 5% of total rooms allocated to All India Unreserved (AIUR).
 * 2. Main Quota: Remaining 95% rooms treated as 100% pool (R):
 *    - UR (General Merit): 50% of R (Open to all top rankers regardless of category)
 *    - SC Quota: 16% of R
 *    - ST Quota: 20% of R
 *    - OBC Quota: 14% of R
 * 3. Fallback / Redistribution Rules:
 *    - Unfilled AIUR seats -> Transferred to UR (General Merit) pool.
 *    - Unfilled ST seats -> Offered to SC candidates first, then OBC, then General.
 *    - Unfilled SC seats -> Offered to ST candidates first, then OBC, then General.
 *    - Unfilled OBC seats -> Offered to SC candidates first, then ST, then General.
 */

/**
 * Normalizes and determines category key from student category string or Prisma Category Enum.
 * e.g., 'SCFFF' -> 'SC', 'URTSF' -> 'UR', 'OBCXF' -> 'OBC', 'AIUR' -> 'AIUR'
 * @param {string} categoryStr 
 * @returns {string} Normalized category ('AIUR', 'SC', 'ST', 'OBC', or 'UR')
 */
function normalizeCategory(categoryStr) {
    if (!categoryStr) return 'UR';
    const catUpper = String(categoryStr).trim().toUpperCase();

    if (catUpper.includes('AIUR')) return 'AIUR';
    if (catUpper.startsWith('SC') || catUpper.includes('SC')) return 'SC';
    if (catUpper.startsWith('ST') || catUpper.includes('ST')) return 'ST';
    if (catUpper.startsWith('OBC') || catUpper.includes('OBC')) return 'OBC';
    return 'UR';
}

/**
 * Main Hostel Allocation Function
 * 
 * Accepts an array of Student records (Prisma Student model compatible) and
 * an array of Room records (Prisma Room model compatible) or total room count.
 * 
 * Input Models:
 * - Student model fields: id, serialNo, rollNo, name, eligibleCategory, allotedCategory, rank, marks, status, finalStatus, etc.
 * - Room model fields: id, hostelId, roomNumber, etc.
 * 
 * @param {Array<Object>} studentsList - Array of Student model records
 * @param {Array<Object>|number} roomsInput - Array of Room model records OR total number of rooms
 * @returns {Array<Object>} Updated student array with allotment status & room details
 */
function allocateHostelSeats(studentsList, roomsInput) {
    if (!Array.isArray(studentsList)) {
        throw new TypeError('Input students list must be an array.');
    }

    let roomsArray = null;
    let totalRooms = 0;

    if (Array.isArray(roomsInput)) {
        roomsArray = roomsInput;
        totalRooms = roomsInput.length;
    } else if (typeof roomsInput === 'number') {
        if (roomsInput <= 0) {
            throw new Error('Total rooms must be a positive number.');
        }
        totalRooms = roomsInput;
    } else {
        throw new Error('Rooms parameter must be an array of Room objects or a positive number.');
    }

    if (totalRooms <= 0) return [];

    // Deep copy students array to avoid mutating original source data unexpectedly
    const students = studentsList.map(s => ({ ...s }));

    // Sort students by Marks (descending), then Rank (ascending)
    students.sort((a, b) => {
        const marksA = parseFloat(a.marks ?? a.Marks ?? 0);
        const marksB = parseFloat(b.marks ?? b.Marks ?? 0);
        if (marksB !== marksA) return marksB - marksA;

        const rankA = parseInt(a.rank ?? a.Rank ?? 999999, 10);
        const rankB = parseInt(b.rank ?? b.Rank ?? 999999, 10);
        return rankA - rankB;
    });

    // Calculate initial seat matrix
    const aiurRooms = Math.floor(totalRooms * 0.05);
    const remainingRooms = totalRooms - aiurRooms;

    // Remaining percentage distribution (50% UR, 16% SC, 20% ST, 14% OBC)
    let urRooms = Math.round(remainingRooms * 0.50);
    let scRooms = Math.round(remainingRooms * 0.16);
    let stRooms = Math.round(remainingRooms * 0.20);
    let obcRooms = Math.round(remainingRooms * 0.14);

    // Adjust any rounding discrepancy to match total remaining rooms exact count
    const totalCalculated = urRooms + scRooms + stRooms + obcRooms;
    if (totalCalculated !== remainingRooms) {
        urRooms += (remainingRooms - totalCalculated);
    }

    const seatsMatrix = {
        AIUR: aiurRooms,
        UR: urRooms,
        SC: scRooms,
        ST: stRooms,
        OBC: obcRooms
    };

    // Tracking allocations
    let roomIndex = 0;
    let fallbackRoomNo = 1;
    const allocatedStudentIds = new Set();

    // Helper function to extract student category
    function getStudentCategory(student) {
        return student.eligibleCategory || student['Eligebil Category'] || student.EligibleCategory || student.category;
    }

    // Helper function to get unique student identifier
    function getStudentId(student) {
        return student.id || student.rollNo || student.RollNo || student.name || student.Name;
    }

    // Helper function to allocate room to a student
    function assignRoom(student, categoryAllocated) {
        student.allotedCategory = categoryAllocated;
        student['Alloted category'] = categoryAllocated; // backward compatibility
        student.status = 'Allocated';
        student['Status'] = 'Allocated'; // backward compatibility
        student.finalStatus = 'Hostel Allotted';
        student['Final Status'] = 'Hostel Allotted'; // backward compatibility

        if (roomsArray && roomsArray[roomIndex]) {
            const roomObj = roomsArray[roomIndex++];
            student.roomId = roomObj.id;
            student.roomNumber = roomObj.roomNumber;
            student['Room No'] = roomObj.roomNumber; // backward compatibility
            student.room = roomObj;
        } else {
            student.roomNumber = String(fallbackRoomNo);
            student['Room No'] = fallbackRoomNo++;
        }

        allocatedStudentIds.add(getStudentId(student));
    }

    // -------------------------------------------------------------
    // PHASE 1: AIUR Allocation (5% Quota)
    // -------------------------------------------------------------
    for (const student of students) {
        if (seatsMatrix.AIUR <= 0) break;
        const normCat = normalizeCategory(getStudentCategory(student));
        
        if (normCat === 'AIUR') {
            assignRoom(student, 'AIUR');
            seatsMatrix.AIUR--;
        }
    }

    // Fallback: If AIUR seats left unfilled, transfer remaining AIUR seats to General (UR) pool
    if (seatsMatrix.AIUR > 0) {
        seatsMatrix.UR += seatsMatrix.AIUR;
        seatsMatrix.AIUR = 0;
    }

    // -------------------------------------------------------------
    // PHASE 2: General / Open Merit (UR Quota - 50% of remaining pool)
    // -------------------------------------------------------------
    for (const student of students) {
        if (seatsMatrix.UR <= 0) break;
        const studentId = getStudentId(student);
        if (allocatedStudentIds.has(studentId)) continue;

        assignRoom(student, 'UR');
        seatsMatrix.UR--;
    }

    // -------------------------------------------------------------
    // PHASE 3: Reserved Category Allocation (SC 16%, ST 20%, OBC 14%)
    // -------------------------------------------------------------
    ['SC', 'ST', 'OBC'].forEach(category => {
        for (const student of students) {
            if (seatsMatrix[category] <= 0) break;
            const studentId = getStudentId(student);
            if (allocatedStudentIds.has(studentId)) continue;

            const normCat = normalizeCategory(getStudentCategory(student));
            if (normCat === category) {
                assignRoom(student, category);
                seatsMatrix[category]--;
            }
        }
    });

    // -------------------------------------------------------------
    // PHASE 4: Unfilled Reserved Seats Redistribution
    // -------------------------------------------------------------
    const redistributionPreferences = {
        ST: ['SC', 'OBC', 'UR'],
        SC: ['ST', 'OBC', 'UR'],
        OBC: ['SC', 'ST', 'UR']
    };

    Object.keys(redistributionPreferences).forEach(reservedCat => {
        while (seatsMatrix[reservedCat] > 0) {
            let seatFilled = false;

            for (const fallbackCat of redistributionPreferences[reservedCat]) {
                for (const student of students) {
                    const studentId = getStudentId(student);
                    if (allocatedStudentIds.has(studentId)) continue;

                    const normCat = normalizeCategory(getStudentCategory(student));
                    
                    if (fallbackCat === 'UR' || normCat === fallbackCat) {
                        assignRoom(student, `${reservedCat} (Shifted to ${normCat})`);
                        seatsMatrix[reservedCat]--;
                        seatFilled = true;
                        break;
                    }
                }
                if (seatFilled) break;
            }

            if (!seatFilled) break;
        }
    });

    // Return ONLY the students who were allotted a hostel room
    const allottedStudents = students.filter(student => student.status === 'Allocated' || student.Status === 'Allocated');
    return allottedStudents;
}
;
export { allocateHostelSeats, normalizeCategory};