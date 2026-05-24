-- Add structured reporting-line context for job-specific evaluation generation.
ALTER TABLE "JobPosition" ADD COLUMN "reportingLine" TEXT;

-- Existing one-shot free credits remain valid only until the first free-test deadline.
UPDATE "CreditBalance"
SET "periodEnd" = TIMESTAMP '2026-06-15 23:59:59.999'
WHERE "purchaseId" IS NULL
  AND "planId" IS NULL
  AND "creditsPurchased" = 1
  AND "creditsUsed" = 0
  AND "periodEnd" IS NULL;
