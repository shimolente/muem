-- Convert category/topology enum columns to TEXT (admin-managed categories).
-- Cast preserves existing values verbatim; seed.ts normalises labels afterward.
ALTER TABLE "StudioProject" ALTER COLUMN "category" TYPE TEXT USING ("category"::TEXT);
ALTER TABLE "Property"      ALTER COLUMN "topology" TYPE TEXT USING ("topology"::TEXT);
ALTER TABLE "Furniture"     ALTER COLUMN "category" TYPE TEXT USING ("category"::TEXT);

-- Drop now-unused enums (FeaturedCategory + ProjectStatus stay).
DROP TYPE "ProjectCategory";
DROP TYPE "PropertyTopology";
DROP TYPE "FurnitureCategory";

-- CreateEnum
CREATE TYPE "CategoryKind" AS ENUM ('STUDIO', 'PROPERTY', 'FURNITURE');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "kind" "CategoryKind" NOT NULL,
    "label" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "socials" JSONB NOT NULL DEFAULT '[]',
    "coconutsShared" INTEGER NOT NULL DEFAULT 84,
    "aboutStats" JSONB NOT NULL DEFAULT '[]',
    "contactEmail" TEXT,
    "contactWhatsapp" TEXT,
    "contactLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Category_kind_sortOrder_idx" ON "Category"("kind", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Category_kind_slug_key" ON "Category"("kind", "slug");
