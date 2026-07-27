import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding hostels and their rooms...');

  const boysHostels = [
    { hostelNumber: 'H1', genderDesignation: 'MALE', roomsCount: 100 },
    { hostelNumber: 'H2', genderDesignation: 'MALE', roomsCount: 120 },
    { hostelNumber: 'H3', genderDesignation: 'MALE', roomsCount: 110 },
    { hostelNumber: 'H4', genderDesignation: 'MALE', roomsCount: 90 },
    { hostelNumber: 'H5', genderDesignation: 'MALE', roomsCount: 95 },
    { hostelNumber: 'H6', genderDesignation: 'MALE', roomsCount: 105 },
    { hostelNumber: 'H7', genderDesignation: 'MALE', roomsCount: 115 },
    { hostelNumber: 'H8', genderDesignation: 'MALE', roomsCount: 100 },
  ];

  const girlsHostels = [
    { hostelNumber: 'H1', genderDesignation: 'FEMALE', roomsCount: 120 },
    { hostelNumber: 'H2', genderDesignation: 'FEMALE', roomsCount: 110 },
    { hostelNumber: 'H3', genderDesignation: 'FEMALE', roomsCount: 125 },
  ];

  const allHostels = [...boysHostels, ...girlsHostels];

  for (const h of allHostels) {
    let existing = await prisma.hostel.findFirst({
      where: {
        hostelNumber: h.hostelNumber,
        genderDesignation: h.genderDesignation,
      },
    });

    if (!existing) {
      existing = await prisma.hostel.create({
        data: {
          hostelNumber: h.hostelNumber,
          genderDesignation: h.genderDesignation,
          isActive: false,
        },
      });
      console.log(`  Created ${h.genderDesignation} hostel ${h.hostelNumber}`);
    } else {
      console.log(`  Skipped ${h.genderDesignation} hostel ${h.hostelNumber} (already exists)`);
    }

    // Now seed rooms if they don't exist
    const currentRoomsCount = await prisma.room.count({
      where: { hostelId: existing.id },
    });

    if (currentRoomsCount < h.roomsCount) {
      const roomsToCreate = [];
      for (let i = currentRoomsCount + 1; i <= h.roomsCount; i++) {
        roomsToCreate.push({
          hostelId: existing.id,
          roomNumber: `R${i}`,
        });
      }
      await prisma.room.createMany({
        data: roomsToCreate,
        skipDuplicates: true,
      });
      console.log(`    Added ${roomsToCreate.length} rooms to ${h.genderDesignation} hostel ${h.hostelNumber}`);
    } else {
      console.log(`    Rooms already seeded for ${h.genderDesignation} hostel ${h.hostelNumber} (${currentRoomsCount} rooms)`);
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
