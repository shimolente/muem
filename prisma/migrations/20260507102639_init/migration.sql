-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN');

-- CreateEnum
CREATE TYPE "ProjectCategory" AS ENUM ('Residential', 'Hospitality', 'Commercial', 'FoodAndBeverage', 'Retail');

-- CreateEnum
CREATE TYPE "FeaturedCategory" AS ENUM ('Residential', 'Hospitality', 'Commercial');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('Completed', 'InProgress', 'Concept');

-- CreateEnum
CREATE TYPE "PropertyTopology" AS ENUM ('Villa', 'Apartment', 'Townhouse', 'Land', 'Commercial');

-- CreateEnum
CREATE TYPE "FurnitureCategory" AS ENUM ('Chairs', 'Tables', 'Consoles', 'Shelving', 'Sofas', 'Extras');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioProject" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "location" TEXT,
    "topology" TEXT,
    "category" "ProjectCategory",
    "size" TEXT,
    "year" INTEGER,
    "status" "ProjectStatus" NOT NULL DEFAULT 'Completed',
    "images" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "location" TEXT,
    "topology" "PropertyTopology",
    "size" TEXT,
    "year" INTEGER,
    "status" "ProjectStatus" NOT NULL DEFAULT 'Completed',
    "priceFrom" TEXT,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "carPort" INTEGER,
    "unitsTotal" INTEGER,
    "unitsSold" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Furniture" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "collection" TEXT,
    "category" "FurnitureCategory" NOT NULL,
    "material" TEXT,
    "price" TEXT,
    "subtitle" TEXT,
    "description" TEXT,
    "dimensions" TEXT,
    "finish" TEXT,
    "leadTime" TEXT,
    "origin" TEXT,
    "images" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Furniture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturedSlot" (
    "id" TEXT NOT NULL,
    "category" "FeaturedCategory" NOT NULL,
    "projectId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeaturedSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactSubmission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lookingFor" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudioProject_slug_key" ON "StudioProject"("slug");

-- CreateIndex
CREATE INDEX "StudioProject_deletedAt_publishedAt_idx" ON "StudioProject"("deletedAt", "publishedAt");

-- CreateIndex
CREATE INDEX "StudioProject_category_idx" ON "StudioProject"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");

-- CreateIndex
CREATE INDEX "Property_deletedAt_publishedAt_idx" ON "Property"("deletedAt", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Furniture_slug_key" ON "Furniture"("slug");

-- CreateIndex
CREATE INDEX "Furniture_deletedAt_publishedAt_idx" ON "Furniture"("deletedAt", "publishedAt");

-- CreateIndex
CREATE INDEX "Furniture_category_idx" ON "Furniture"("category");

-- CreateIndex
CREATE INDEX "FeaturedSlot_category_sortOrder_idx" ON "FeaturedSlot"("category", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "FeaturedSlot_category_projectId_key" ON "FeaturedSlot"("category", "projectId");

-- CreateIndex
CREATE INDEX "ContactSubmission_read_createdAt_idx" ON "ContactSubmission"("read", "createdAt");

-- AddForeignKey
ALTER TABLE "FeaturedSlot" ADD CONSTRAINT "FeaturedSlot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
