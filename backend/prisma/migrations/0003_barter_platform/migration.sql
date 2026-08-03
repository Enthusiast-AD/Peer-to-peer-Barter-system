
-- CreateEnum
CREATE TYPE "enum_Sessions_mode" AS ENUM ('BARTER', 'CREDITS');

-- CreateEnum
CREATE TYPE "enum_TimeProposals_status" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- AlterTable
ALTER TABLE "Sessions" ADD COLUMN     "actualDurationMinutes" INTEGER,
ADD COLUMN     "creditsReserved" INTEGER DEFAULT 0,
ADD COLUMN     "endedAt" TIMESTAMPTZ(6),
ADD COLUMN     "mode" "enum_Sessions_mode" NOT NULL DEFAULT 'BARTER',
ADD COLUMN     "noShowReportedAt" TIMESTAMPTZ(6),
ADD COLUMN     "noShowReportedById" UUID,
ADD COLUMN     "noShowUserId" UUID,
ADD COLUMN     "startedAt" TIMESTAMPTZ(6),
ALTER COLUMN "scheduledAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bannedAt" TIMESTAMPTZ(6),
ADD COLUMN     "warnings" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ChatMessages" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeProposals" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "proposedById" UUID NOT NULL,
    "proposedAt" TIMESTAMPTZ(6) NOT NULL,
    "status" "enum_TimeProposals_status" NOT NULL DEFAULT 'PENDING',
    "respondedById" UUID,
    "respondedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "TimeProposals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatMessages_sessionId_createdAt_idx" ON "ChatMessages"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "TimeProposals_sessionId_status_idx" ON "TimeProposals"("sessionId", "status");

-- AddForeignKey
ALTER TABLE "ChatMessages" ADD CONSTRAINT "ChatMessages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessages" ADD CONSTRAINT "ChatMessages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeProposals" ADD CONSTRAINT "TimeProposals_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeProposals" ADD CONSTRAINT "TimeProposals_proposedById_fkey" FOREIGN KEY ("proposedById") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeProposals" ADD CONSTRAINT "TimeProposals_respondedById_fkey" FOREIGN KEY ("respondedById") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

