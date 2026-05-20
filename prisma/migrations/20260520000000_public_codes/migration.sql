-- Human-readable sequential identifiers by entity type.
CREATE TABLE "PublicIdCounter" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicIdCounter_pkey" PRIMARY KEY ("key")
);

ALTER TABLE "Company" ADD COLUMN "code" TEXT;
ALTER TABLE "JobPosition" ADD COLUMN "code" TEXT;
ALTER TABLE "Evaluation" ADD COLUMN "code" TEXT;
ALTER TABLE "Candidate" ADD COLUMN "code" TEXT;
ALTER TABLE "AnalysisReport" ADD COLUMN "code" TEXT;

CREATE UNIQUE INDEX "Company_code_key" ON "Company"("code");
CREATE UNIQUE INDEX "JobPosition_code_key" ON "JobPosition"("code");
CREATE UNIQUE INDEX "Evaluation_code_key" ON "Evaluation"("code");
CREATE UNIQUE INDEX "Candidate_code_key" ON "Candidate"("code");
CREATE UNIQUE INDEX "AnalysisReport_code_key" ON "AnalysisReport"("code");
