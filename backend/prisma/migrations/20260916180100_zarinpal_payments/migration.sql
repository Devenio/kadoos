-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('requested', 'paid', 'failed', 'cancelled');

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN "iban" TEXT;
ALTER TABLE "Shop" ADD COLUMN "payoutReady" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "status" SET DEFAULT 'pending_payment';

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "authority" TEXT,
    "amount" INTEGER NOT NULL,
    "shopShare" INTEGER NOT NULL,
    "platformShare" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'requested',
    "refId" TEXT,
    "cardPan" TEXT,
    "fee" INTEGER,
    "feeType" TEXT,
    "rawVerify" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Payment_appointmentId_key" ON "Payment"("appointmentId");
CREATE UNIQUE INDEX "Payment_authority_key" ON "Payment"("authority");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
CREATE INDEX "Appointment_status_createdAt_idx" ON "Appointment"("status", "createdAt");

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
