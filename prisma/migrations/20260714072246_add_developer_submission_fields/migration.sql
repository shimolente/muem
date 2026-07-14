-- CreateEnum
CREATE TYPE "SubmissionKind" AS ENUM ('GENERAL', 'DEVELOPER');

-- AlterTable
ALTER TABLE "ContactSubmission" ADD COLUMN     "kind" "SubmissionKind" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "propertySlug" TEXT,
ADD COLUMN     "propertyTitle" TEXT;

-- CreateIndex
CREATE INDEX "ContactSubmission_kind_createdAt_idx" ON "ContactSubmission"("kind", "createdAt");
