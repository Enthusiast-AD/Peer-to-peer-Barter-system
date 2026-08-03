
-- CreateEnum
CREATE TYPE "enum_NoShowReports_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "NoShowReports" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "reportedBy" UUID NOT NULL,
    "reportedUser" UUID NOT NULL,
    "reason" TEXT,
    "status" "enum_NoShowReports_status" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" UUID,
    "reviewedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "NoShowReports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NoShowReports_sessionId_key" ON "NoShowReports"("sessionId");

-- CreateIndex
CREATE INDEX "NoShowReports_status_idx" ON "NoShowReports"("status");

-- AddForeignKey
ALTER TABLE "NoShowReports" ADD CONSTRAINT "NoShowReports_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

