/*
  Warnings:

  - A unique constraint covering the columns `[name,organizationId]` on the table `brand` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "brand_name_key";

-- AlterTable
ALTER TABLE "brand" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "car" ADD COLUMN     "organizationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "brand_name_organizationId_key" ON "brand"("name", "organizationId");

-- AddForeignKey
ALTER TABLE "brand" ADD CONSTRAINT "brand_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car" ADD CONSTRAINT "car_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
