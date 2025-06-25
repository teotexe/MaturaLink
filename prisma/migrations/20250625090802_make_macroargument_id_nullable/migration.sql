-- DropForeignKey
ALTER TABLE "LinkElement" DROP CONSTRAINT "LinkElement_macroargumentId_fkey";

-- AlterTable
ALTER TABLE "LinkElement" ALTER COLUMN "macroargumentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "LinkElement" ADD CONSTRAINT "LinkElement_macroargumentId_fkey" FOREIGN KEY ("macroargumentId") REFERENCES "Macroargument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
