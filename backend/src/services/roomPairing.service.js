import prisma from '../db/db.js';

export const BEDS_PER_ROOM = 2;

/**
 * Find rooms with exactly one student and pair them by consecutive serialNo
 * (move the higher/lowest serial into the other's room).
 */
export async function repairSingleOccupancyRooms(genderDesignation) {
  const rooms = await prisma.room.findMany({
    where: {
      hostel: {
        genderDesignation,
        isActive: true,
      },
    },
    include: {
      allotments: {
        include: {
          student: {
            select: { id: true, serialNo: true },
          },
        },
      },
    },
  });

  const singles = rooms
    .filter((room) => room.allotments.length === 1)
    .map((room) => ({
      roomId: room.id,
      allotmentId: room.allotments[0].id,
      studentId: room.allotments[0].student.id,
      serialNo: room.allotments[0].student.serialNo,
    }))
    .filter((entry) => entry.serialNo != null)
    .sort((a, b) => a.serialNo - b.serialNo);

  let pairsMerged = 0;
  const mergedAllotmentIds = new Set();

  for (let i = 0; i < singles.length; i++) {
    const current = singles[i];
    if (mergedAllotmentIds.has(current.allotmentId)) continue;

    const partner = singles.find(
      (candidate, index) =>
        index > i &&
        !mergedAllotmentIds.has(candidate.allotmentId) &&
        candidate.roomId !== current.roomId &&
        candidate.serialNo === current.serialNo + 1
    );

    if (!partner) continue;

    await prisma.hostelAllotmentList.update({
      where: { id: partner.allotmentId },
      data: { roomId: current.roomId },
    });

    mergedAllotmentIds.add(partner.allotmentId);
    pairsMerged += 1;
  }

  return { pairsMerged, remainingSingles: singles.length - pairsMerged };
}

export function buildRoomStates(roomsList) {
  return roomsList.map((room) => ({
    id: room.id,
    occupancy: room.allotments?.length ?? 0,
    occupants: (room.allotments ?? []).map((a) => ({
      studentId: a.student?.id ?? a.studentId,
      serialNo: a.student?.serialNo ?? null,
    })),
  }));
}

export function hasAvailableBed(roomStates) {
  return roomStates.some((room) => room.occupancy < BEDS_PER_ROOM);
}

export function countAvailableBeds(roomStates) {
  return roomStates.reduce(
    (sum, room) => sum + Math.max(0, BEDS_PER_ROOM - room.occupancy),
    0
  );
}

/**
 * Pick a room with a free bed. Prefer a partially filled room where the
 * occupant has a consecutive serialNo (double-bed pairing).
 */
export function pickRoomForStudent(roomStates, student) {
  const withSpace = roomStates.filter((room) => room.occupancy < BEDS_PER_ROOM);
  if (!withSpace.length) return null;

  if (student.serialNo != null) {
    const serialMatch = withSpace.find((room) => {
      if (room.occupancy !== 1) return false;
      const occupantSerial = room.occupants[0]?.serialNo;
      return (
        occupantSerial != null &&
        Math.abs(occupantSerial - student.serialNo) === 1
      );
    });
    if (serialMatch) return serialMatch;
  }

  const partialRoom = withSpace.find((room) => room.occupancy === 1);
  if (partialRoom) return partialRoom;

  return withSpace.find((room) => room.occupancy === 0) ?? null;
}

export function occupyRoom(room, student) {
  room.occupancy += 1;
  room.occupants.push({
    studentId: student.id,
    serialNo: student.serialNo ?? null,
  });
}
