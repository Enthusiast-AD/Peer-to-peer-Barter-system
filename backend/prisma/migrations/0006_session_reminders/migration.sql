-- Add a tracking field so the reminder scheduler only emails once per session.
ALTER TABLE "Sessions" ADD COLUMN "reminderSentAt" TIMESTAMPTZ(6);
