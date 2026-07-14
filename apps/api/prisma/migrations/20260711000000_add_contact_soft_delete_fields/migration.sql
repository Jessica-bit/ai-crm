-- AlterTable
ALTER TABLE "contacts" ADD COLUMN "position" TEXT;
ALTER TABLE "contacts" ADD COLUMN "notes" TEXT;
ALTER TABLE "contacts" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "contacts_deleted_at_idx" ON "contacts"("deleted_at");
