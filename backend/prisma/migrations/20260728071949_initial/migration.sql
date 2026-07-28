-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('GENERAL', 'OBC', 'SC', 'ST', 'EWS', 'JK_MIGRANT_NORTHEAST');

-- CreateTable
CREATE TABLE "hostel_form" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "category" "Category" NOT NULL,
    "jeeRollNumber" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "admissionYear" INTEGER,
    "email" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "homeState" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostel_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student" (
    "id" TEXT NOT NULL,
    "serialNo" INTEGER,
    "rollNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eligibleCategory" "Category",
    "allotedCategory" "Category" NOT NULL,
    "rank" INTEGER,
    "fatherName" TEXT,
    "motherName" TEXT,
    "domicileStatus" TEXT,
    "gender" "Gender" NOT NULL,
    "marks" DOUBLE PRECISION,
    "date" TIMESTAMP(3),
    "allotedRound" INTEGER,
    "phoneNo" TEXT,
    "status" TEXT,
    "finalStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostels" (
    "id" TEXT NOT NULL,
    "hostelNumber" TEXT NOT NULL,
    "genderDesignation" "Gender" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_allotment_list" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hostel_allotment_list_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hostel_form_jeeRollNumber_key" ON "hostel_form"("jeeRollNumber");

-- CreateIndex
CREATE UNIQUE INDEX "hostel_form_email_key" ON "hostel_form"("email");

-- CreateIndex
CREATE UNIQUE INDEX "student_rollNo_key" ON "student"("rollNo");

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "hostels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_allotment_list" ADD CONSTRAINT "hostel_allotment_list_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_allotment_list" ADD CONSTRAINT "hostel_allotment_list_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
