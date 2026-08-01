import { Category } from '@prisma/client';
import {
  BEDS_PER_ROOM,
  buildRoomStates,
  countAvailableBeds,
  hasAvailableBed,
  occupyRoom,
  pickRoomForStudent,
} from './roomPairing.service.js';

/**
 * Normalizes category inputs into valid Prisma `Category` enum values.
 */
function normalizeCategory(categoryStr) {
  if (!categoryStr) return Category.GENERAL;
  const catUpper = String(categoryStr).trim().toUpperCase();

  if (catUpper.includes('SC')) return Category.SC;
  if (catUpper.includes('ST')) return Category.ST;
  if (catUpper.includes('OBC')) return Category.OBC;

  return Category.GENERAL;
}

/**
 * Hostel allocation with double-bed rooms (2 students per room).
 * Quotas are calculated on total bed capacity (rooms × 2).
 * Roommates are preferentially paired by consecutive serialNo.
 */
function allocateHostelSeats(studentsList, roomsList) {
  if (!Array.isArray(studentsList) || !Array.isArray(roomsList)) {
    throw new TypeError('Both studentsList and roomsList must be arrays.');
  }

  const roomStates = buildRoomStates(roomsList);
  const totalRooms = roomStates.length;

  if (totalRooms === 0 || !hasAvailableBed(roomStates)) return [];

  const totalSeats = countAvailableBeds(roomStates);

  const students = studentsList.map((s) => ({ ...s }));
  students.sort((a, b) => {
    const marksA = parseFloat(a.marks ?? 0);
    const marksB = parseFloat(b.marks ?? 0);
    if (marksB !== marksA) return marksB - marksA;

    const rankA = parseInt(a.rank ?? 999999, 10);
    const rankB = parseInt(b.rank ?? 999999, 10);
    if (rankA !== rankB) return rankA - rankB;

    const serialA = parseInt(a.serialNo ?? 999999, 10);
    const serialB = parseInt(b.serialNo ?? 999999, 10);
    return serialA - serialB;
  });

  const allocatedStudentIds = new Set();
  let seatsRemaining = totalSeats;

  function assignSeat(student, enumCategory, note = null) {
    if (seatsRemaining <= 0) return false;

    const room = pickRoomForStudent(roomStates, student);
    if (!room) return false;

    student.allotedCategory = enumCategory;
    student.status = 'Allocated';
    student.finalStatus = note ? `Hostel Allotted (${note})` : 'Hostel Allotted';
    student.roomId = room.id;

    occupyRoom(room, student);
    allocatedStudentIds.add(student.id);
    seatsRemaining -= 1;
    return true;
  }

  const aiurSeats = Math.floor(totalSeats * 0.05);
  const stateSeats = totalSeats - aiurSeats;

  let genSeats = Math.round(stateSeats * 0.5);
  let scSeats = Math.round(stateSeats * 0.16);
  let stSeats = Math.round(stateSeats * 0.2);
  let obcSeats = Math.round(stateSeats * 0.14);

  const totalCalculated = genSeats + scSeats + stSeats + obcSeats;
  if (totalCalculated !== stateSeats) {
    genSeats += stateSeats - totalCalculated;
  }

  const seatsMatrix = {
    AIUR: aiurSeats,
    [Category.GENERAL]: genSeats,
    [Category.SC]: scSeats,
    [Category.ST]: stSeats,
    [Category.OBC]: obcSeats,
  };

  // PHASE 1: AIUR Quota (5%)
  for (const student of students) {
    if (seatsMatrix.AIUR <= 0 || seatsRemaining <= 0) break;
    if (!allocatedStudentIds.has(student.id) && student.homeState && student.homeState !== 'MP') {
      if (assignSeat(student, Category.GENERAL, 'AIUR Quota')) {
        seatsMatrix.AIUR -= 1;
      }
    }
  }

  if (seatsMatrix.AIUR > 0) {
    seatsMatrix[Category.GENERAL] += seatsMatrix.AIUR;
    seatsMatrix.AIUR = 0;
  }

  // PHASE 2: General / Open Merit (50%)
  for (const student of students) {
    if (seatsMatrix[Category.GENERAL] <= 0 || seatsRemaining <= 0) break;
    if (allocatedStudentIds.has(student.id)) continue;

    if (assignSeat(student, Category.GENERAL, 'Open Merit')) {
      seatsMatrix[Category.GENERAL] -= 1;
    }
  }

  // PHASE 3: Reserved Categories
  [Category.SC, Category.ST, Category.OBC].forEach((catEnum) => {
    for (const student of students) {
      if (seatsMatrix[catEnum] <= 0 || seatsRemaining <= 0) break;
      if (allocatedStudentIds.has(student.id)) continue;

      if (normalizeCategory(student.eligibleCategory) === catEnum) {
        if (assignSeat(student, catEnum)) {
          seatsMatrix[catEnum] -= 1;
        }
      }
    }
  });

  // PHASE 4: Redistribution of vacant reserved seats
  const redistributionPreferences = {
    [Category.ST]: [Category.SC, Category.OBC, Category.GENERAL],
    [Category.SC]: [Category.ST, Category.OBC, Category.GENERAL],
    [Category.OBC]: [Category.SC, Category.ST, Category.GENERAL],
  };

  Object.keys(redistributionPreferences).forEach((reservedCat) => {
    while (seatsMatrix[reservedCat] > 0 && seatsRemaining > 0) {
      let seatFilled = false;

      for (const fallbackCat of redistributionPreferences[reservedCat]) {
        for (const student of students) {
          if (allocatedStudentIds.has(student.id)) continue;

          const normCat = normalizeCategory(student.eligibleCategory);
          if (fallbackCat === Category.GENERAL || normCat === fallbackCat) {
            if (assignSeat(student, fallbackCat, `${reservedCat} Shifted to ${normCat}`)) {
              seatsMatrix[reservedCat] -= 1;
              seatFilled = true;
              break;
            }
          }
        }
        if (seatFilled) break;
      }

      if (!seatFilled) break;
    }
  });

  return students.filter((student) => allocatedStudentIds.has(student.id));
}

export { allocateHostelSeats, normalizeCategory, BEDS_PER_ROOM };
