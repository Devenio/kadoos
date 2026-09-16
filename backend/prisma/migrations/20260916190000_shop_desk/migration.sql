-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'no_show';

-- CreateEnum
CREATE TYPE "AppointmentSource" AS ENUM ('online', 'walk_in');

-- AlterTable
ALTER TABLE "Barber" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "notes" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "source" "AppointmentSource" NOT NULL DEFAULT 'online';

-- CreateIndex
CREATE INDEX "Barber_shopId_active_idx" ON "Barber"("shopId", "active");

-- CreateIndex
CREATE INDEX "Service_shopId_active_idx" ON "Service"("shopId", "active");

-- CreateTable
CREATE TABLE "BarberTimeOff" (
    "id" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BarberTimeOff_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BarberTimeOff_barberId_startsAt_idx" ON "BarberTimeOff"("barberId", "startsAt");
CREATE INDEX "BarberTimeOff_barberId_endsAt_idx" ON "BarberTimeOff"("barberId", "endsAt");

ALTER TABLE "BarberTimeOff" ADD CONSTRAINT "BarberTimeOff_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
