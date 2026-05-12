-- AlterTable
ALTER TABLE "Furniture" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "StudioProject" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Furniture_sortOrder_idx" ON "Furniture"("sortOrder");

-- CreateIndex
CREATE INDEX "Property_sortOrder_idx" ON "Property"("sortOrder");

-- CreateIndex
CREATE INDEX "StudioProject_sortOrder_idx" ON "StudioProject"("sortOrder");
