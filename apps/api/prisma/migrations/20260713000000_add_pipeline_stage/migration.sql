-- AlterTable
ALTER TABLE "stages" ADD COLUMN "color" TEXT;
ALTER TABLE "stages" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "deals" ADD COLUMN "stage_id" TEXT;

-- CreateIndex
CREATE INDEX "stages_deleted_at_idx" ON "stages"("deleted_at");

-- CreateIndex
CREATE INDEX "deals_stage_id_idx" ON "deals"("stage_id");

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
