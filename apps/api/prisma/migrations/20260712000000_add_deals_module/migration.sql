-- DropForeignKey
ALTER TABLE "deals" DROP CONSTRAINT "deals_stage_id_fkey";

-- DropIndex
DROP INDEX "deals_stage_id_idx";

-- AlterTable
ALTER TABLE "deals" DROP COLUMN "stage_id";
ALTER TABLE "deals" RENAME COLUMN "expected_close_date" TO "expected_close_at";
ALTER TABLE "deals" ALTER COLUMN "value" SET DEFAULT 0;
ALTER TABLE "deals" ALTER COLUMN "value" SET NOT NULL;
ALTER TABLE "deals" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'OPEN';
ALTER TABLE "deals" ADD COLUMN "notes" TEXT;
ALTER TABLE "deals" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "deals_deleted_at_idx" ON "deals"("deleted_at");
