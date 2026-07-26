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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostel_form_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hostel_form_jeeRollNumber_key" ON "hostel_form"("jeeRollNumber");

-- CreateIndex
CREATE UNIQUE INDEX "hostel_form_email_key" ON "hostel_form"("email");
