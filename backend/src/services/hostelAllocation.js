import { Category } from '@prisma/client';

/**
 * Normalizes category inputs into valid Prisma `Category` enum values.
 * SC, ST, and OBC map to their enums; all other categories (EWS, JK, etc.) default to GENERAL.
 */
function normalizeCategory(categoryStr) {
    if (!categoryStr) return Category.GENERAL;
    const catUpper = String(categoryStr).trim().toUpperCase();

    if (catUpper.includes('SC')) return Category.SC;
    if (catUpper.includes('ST')) return Category.ST;
    if (catUpper.includes('OBC')) return Category.OBC;
    
    // Everything else defaults to Open Merit / General
    return Category.GENERAL; 
}

/**
 * Main Hostel Allocation Function (Prisma Compatible)
 */
function allocateHostelSeats(studentsList, roomsList) {
    if (!Array.isArray(studentsList) || !Array.isArray(roomsList)) {
        throw new TypeError('Both studentsList and roomsList must be arrays.');
    }

    const totalRooms = roomsList.length;
    
    // RETURN AN EMPTY ARRAY IF NO ROOMS
    if (totalRooms === 0) return []; 

    // Shallow copy and sort students by Merit
    const students = studentsList.map(s => ({ ...s }));
    students.sort((a, b) => {
        const marksA = parseFloat(a.marks ?? 0);
        const marksB = parseFloat(b.marks ?? 0);
        if (marksB !== marksA) return marksB - marksA;

        const rankA = parseInt(a.rank ?? 999999, 10);
        const rankB = parseInt(b.rank ?? 999999, 10);
        return rankA - rankB;
    });

    let roomIndex = 0;
    const allocatedStudentIds = new Set();

    function assignRoom(student, enumCategory, note = null) {
        const room = roomsList[roomIndex++];
        
        student.allotedCategory = enumCategory;
        student.status = 'Allocated';
        student.finalStatus = note ? `Hostel Allotted (${note})` : 'Hostel Allotted';
        
        // RE-ADDED: We must attach roomId to the student so the controller can find it
        student.roomId = room.id; 

        allocatedStudentIds.add(student.id);
    }

    // -------------------------------------------------------------
    // Calculate Quotas across total rooms
    // -------------------------------------------------------------
    const aiurRooms = Math.floor(totalRooms * 0.05);
    const stateRooms = totalRooms - aiurRooms;

    let genRooms = Math.round(stateRooms * 0.50);
    let scRooms = Math.round(stateRooms * 0.16);
    let stRooms = Math.round(stateRooms * 0.20);
    let obcRooms = Math.round(stateRooms * 0.14);

    // Adjust for rounding discrepancy
    const totalCalculated = genRooms + scRooms + stRooms + obcRooms;
    if (totalCalculated !== stateRooms) {
        genRooms += (stateRooms - totalCalculated);
    }

    const seatsMatrix = {
        AIUR: aiurRooms,
        [Category.GENERAL]: genRooms,
        [Category.SC]: scRooms,
        [Category.ST]: stRooms,
        [Category.OBC]: obcRooms
    };

    // -------------------------------------------------------------
    // PHASE 1: AIUR Quota (5%)
    // -------------------------------------------------------------
    for (const student of students) {
        if (seatsMatrix.AIUR <= 0 || roomIndex >= totalRooms) break;
        if (!allocatedStudentIds.has(student.id) && student.homeState && student.homeState !== 'MP') {
            assignRoom(student, Category.GENERAL, 'AIUR Quota');
            seatsMatrix.AIUR--;
        }
    }

    // Transfer unfilled AIUR to GENERAL pool
    if (seatsMatrix.AIUR > 0) {
        seatsMatrix[Category.GENERAL] += seatsMatrix.AIUR;
        seatsMatrix.AIUR = 0;
    }

    // -------------------------------------------------------------
    // PHASE 2: General / Open Merit (50%)
    // -------------------------------------------------------------
    for (const student of students) {
        if (seatsMatrix[Category.GENERAL] <= 0 || roomIndex >= totalRooms) break;
        if (allocatedStudentIds.has(student.id)) continue;

        assignRoom(student, Category.GENERAL, 'Open Merit');
        seatsMatrix[Category.GENERAL]--;
    }

    // -------------------------------------------------------------
    // PHASE 3: Reserved Categories (SC 16%, ST 20%, OBC 14%)
    // -------------------------------------------------------------
    [Category.SC, Category.ST, Category.OBC].forEach(catEnum => {
        for (const student of students) {
            if (seatsMatrix[catEnum] <= 0 || roomIndex >= totalRooms) break;
            if (allocatedStudentIds.has(student.id)) continue;

            if (normalizeCategory(student.eligibleCategory) === catEnum) {
                assignRoom(student, catEnum);
                seatsMatrix[catEnum]--;
            }
        }
    });

    // -------------------------------------------------------------
    // PHASE 4: Redistribution of Vacant Reserved Seats
    // -------------------------------------------------------------
    const redistributionPreferences = {
        [Category.ST]: [Category.SC, Category.OBC, Category.GENERAL],
        [Category.SC]: [Category.ST, Category.OBC, Category.GENERAL],
        [Category.OBC]: [Category.SC, Category.ST, Category.GENERAL]
    };

    Object.keys(redistributionPreferences).forEach(reservedCat => {
        while (seatsMatrix[reservedCat] > 0 && roomIndex < totalRooms) {
            let seatFilled = false;

            for (const fallbackCat of redistributionPreferences[reservedCat]) {
                for (const student of students) {
                    if (allocatedStudentIds.has(student.id)) continue;

                    const normCat = normalizeCategory(student.eligibleCategory);
                    if (fallbackCat === Category.GENERAL || normCat === fallbackCat) {
                        assignRoom(student, fallbackCat, `${reservedCat} Shifted to ${normCat}`);
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

    // ONLY RETURN THE ARRAY OF STUDENTS
    const allocatedStudents = students.filter(s => allocatedStudentIds.has(s.id));
    return allocatedStudents; 
}

export { allocateHostelSeats, normalizeCategory };