-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'COMPANY', 'CANDIDATE');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'TARGET_PROFILE_GENERATED', 'EVALUATION_GENERATED', 'INVITATIONS_SENT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('INVITED', 'STARTED', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('DRAFT', 'GENERATED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AiLogStatus" AS ENUM ('SUCCESS', 'ERROR');

-- CreateEnum
CREATE TYPE "AiPurpose" AS ENUM ('TARGET_PROFILE', 'EVALUATION_GENERATION', 'CANDIDATE_ANALYSIS', 'HR_REPORT');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'COMPANY',
    "companyId" TEXT,
    "candidateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "ownerEmail" TEXT,
    "name" TEXT,
    "siretSiren" TEXT,
    "sector" TEXT,
    "size" TEXT,
    "website" TEXT,
    "address" TEXT,
    "hrContactName" TEXT,
    "hrContactEmail" TEXT,
    "culture" TEXT,
    "values" TEXT,
    "managementStyle" TEXT,
    "teamWorkingStyle" TEXT,
    "workEnvironment" TEXT,
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosition" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mainMissions" TEXT NOT NULL,
    "hardSkillsRequired" TEXT NOT NULL,
    "seniorityLevel" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "workMode" TEXT NOT NULL,
    "teamContext" TEXT NOT NULL,
    "managerProfile" TEXT NOT NULL,
    "managementStyle" TEXT NOT NULL,
    "workRhythm" TEXT NOT NULL,
    "mainConstraints" TEXT NOT NULL,
    "expectedPerformanceIndicators" TEXT NOT NULL,
    "companySpecificExpectations" TEXT NOT NULL,
    "softSkillMatrix" JSONB NOT NULL,
    "targetProfile" JSONB,
    "targetProfileGeneratedAt" TIMESTAMP(3),
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingPlan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "credits" INTEGER NOT NULL,
    "jobScoped" BOOLEAN NOT NULL DEFAULT true,
    "monthly" BOOLEAN NOT NULL DEFAULT false,
    "stripePriceId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT,
    "planId" TEXT NOT NULL,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeSubscriptionId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "creditsPurchased" INTEGER NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditBalance" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT,
    "planId" TEXT,
    "purchaseId" TEXT,
    "creditsPurchased" INTEGER NOT NULL,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "monthlyLimit" INTEGER,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "stripeSubscriptionId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'fr',
    "version" TEXT NOT NULL DEFAULT 'NeuroRecrut Ultra MVP v1',
    "status" "EvaluationStatus" NOT NULL DEFAULT 'GENERATED',
    "json" JSONB NOT NULL,
    "generatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "companyId" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "linkedin" TEXT,
    "cvUrl" TEXT,
    "currentRole" TEXT,
    "experienceYears" INTEGER,
    "education" TEXT,
    "availability" TEXT,
    "mobility" TEXT,
    "salaryExpectations" TEXT,
    "motivation" TEXT,
    "workPreferences" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationInvitation" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "candidateId" TEXT,
    "candidateEmail" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'INVITED',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateResponse" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "answersJson" JSONB NOT NULL,
    "draftJson" JSONB,
    "isSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisReport" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "analysisJson" JSONB NOT NULL,
    "reportJson" JSONB NOT NULL,
    "pdfBuffer" BYTEA,
    "pdfFileName" TEXT,
    "globalScore" DOUBLE PRECISION NOT NULL,
    "matchingScore" DOUBLE PRECISION NOT NULL,
    "coherenceIndex" DOUBLE PRECISION NOT NULL,
    "sincerityIndex" DOUBLE PRECISION NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "recommendation" TEXT NOT NULL,
    "finalOpinion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalysisReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiLog" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "purpose" "AiPurpose" NOT NULL,
    "status" "AiLogStatus" NOT NULL,
    "model" TEXT NOT NULL,
    "companyId" TEXT,
    "jobId" TEXT,
    "responseId" TEXT,
    "prompt" TEXT NOT NULL,
    "requestJson" JSONB,
    "responseJson" JSONB,
    "error" TEXT,
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "userId" TEXT,
    "companyId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "User"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_candidateId_key" ON "User"("candidateId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_uid_key" ON "Company"("uid");

-- CreateIndex
CREATE INDEX "Company_status_idx" ON "Company"("status");

-- CreateIndex
CREATE UNIQUE INDEX "JobPosition_uid_key" ON "JobPosition"("uid");

-- CreateIndex
CREATE INDEX "JobPosition_companyId_idx" ON "JobPosition"("companyId");

-- CreateIndex
CREATE INDEX "JobPosition_status_idx" ON "JobPosition"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PricingPlan_code_key" ON "PricingPlan"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_uid_key" ON "Purchase"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_stripeCheckoutSessionId_key" ON "Purchase"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "Purchase_companyId_idx" ON "Purchase"("companyId");

-- CreateIndex
CREATE INDEX "Purchase_jobId_idx" ON "Purchase"("jobId");

-- CreateIndex
CREATE INDEX "Purchase_status_idx" ON "Purchase"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CreditBalance_uid_key" ON "CreditBalance"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "CreditBalance_purchaseId_key" ON "CreditBalance"("purchaseId");

-- CreateIndex
CREATE INDEX "CreditBalance_companyId_idx" ON "CreditBalance"("companyId");

-- CreateIndex
CREATE INDEX "CreditBalance_jobId_idx" ON "CreditBalance"("jobId");

-- CreateIndex
CREATE INDEX "CreditBalance_active_idx" ON "CreditBalance"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_uid_key" ON "Evaluation"("uid");

-- CreateIndex
CREATE INDEX "Evaluation_companyId_idx" ON "Evaluation"("companyId");

-- CreateIndex
CREATE INDEX "Evaluation_jobId_idx" ON "Evaluation"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_uid_key" ON "Candidate"("uid");

-- CreateIndex
CREATE INDEX "Candidate_email_idx" ON "Candidate"("email");

-- CreateIndex
CREATE INDEX "Candidate_companyId_idx" ON "Candidate"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationInvitation_uid_key" ON "EvaluationInvitation"("uid");

-- CreateIndex
CREATE INDEX "EvaluationInvitation_companyId_idx" ON "EvaluationInvitation"("companyId");

-- CreateIndex
CREATE INDEX "EvaluationInvitation_jobId_idx" ON "EvaluationInvitation"("jobId");

-- CreateIndex
CREATE INDEX "EvaluationInvitation_evaluationId_idx" ON "EvaluationInvitation"("evaluationId");

-- CreateIndex
CREATE INDEX "EvaluationInvitation_status_idx" ON "EvaluationInvitation"("status");

-- CreateIndex
CREATE INDEX "EvaluationInvitation_candidateEmail_idx" ON "EvaluationInvitation"("candidateEmail");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateResponse_uid_key" ON "CandidateResponse"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateResponse_invitationId_key" ON "CandidateResponse"("invitationId");

-- CreateIndex
CREATE INDEX "CandidateResponse_candidateId_idx" ON "CandidateResponse"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateResponse_companyId_idx" ON "CandidateResponse"("companyId");

-- CreateIndex
CREATE INDEX "CandidateResponse_jobId_idx" ON "CandidateResponse"("jobId");

-- CreateIndex
CREATE INDEX "CandidateResponse_evaluationId_idx" ON "CandidateResponse"("evaluationId");

-- CreateIndex
CREATE INDEX "CandidateResponse_isSubmitted_idx" ON "CandidateResponse"("isSubmitted");

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisReport_uid_key" ON "AnalysisReport"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisReport_responseId_key" ON "AnalysisReport"("responseId");

-- CreateIndex
CREATE INDEX "AnalysisReport_companyId_idx" ON "AnalysisReport"("companyId");

-- CreateIndex
CREATE INDEX "AnalysisReport_jobId_idx" ON "AnalysisReport"("jobId");

-- CreateIndex
CREATE INDEX "AnalysisReport_matchingScore_idx" ON "AnalysisReport"("matchingScore");

-- CreateIndex
CREATE INDEX "AnalysisReport_riskLevel_idx" ON "AnalysisReport"("riskLevel");

-- CreateIndex
CREATE UNIQUE INDEX "AiLog_uid_key" ON "AiLog"("uid");

-- CreateIndex
CREATE INDEX "AiLog_purpose_idx" ON "AiLog"("purpose");

-- CreateIndex
CREATE INDEX "AiLog_status_idx" ON "AiLog"("status");

-- CreateIndex
CREATE INDEX "AiLog_companyId_idx" ON "AiLog"("companyId");

-- CreateIndex
CREATE INDEX "AiLog_jobId_idx" ON "AiLog"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditLog_uid_key" ON "AuditLog"("uid");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_idx" ON "AuditLog"("companyId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosition" ADD CONSTRAINT "JobPosition_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PricingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditBalance" ADD CONSTRAINT "CreditBalance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditBalance" ADD CONSTRAINT "CreditBalance_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditBalance" ADD CONSTRAINT "CreditBalance_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PricingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditBalance" ADD CONSTRAINT "CreditBalance_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_generatedByUserId_fkey" FOREIGN KEY ("generatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationInvitation" ADD CONSTRAINT "EvaluationInvitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationInvitation" ADD CONSTRAINT "EvaluationInvitation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationInvitation" ADD CONSTRAINT "EvaluationInvitation_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationInvitation" ADD CONSTRAINT "EvaluationInvitation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationInvitation" ADD CONSTRAINT "EvaluationInvitation_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateResponse" ADD CONSTRAINT "CandidateResponse_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateResponse" ADD CONSTRAINT "CandidateResponse_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateResponse" ADD CONSTRAINT "CandidateResponse_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateResponse" ADD CONSTRAINT "CandidateResponse_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateResponse" ADD CONSTRAINT "CandidateResponse_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "EvaluationInvitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisReport" ADD CONSTRAINT "AnalysisReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisReport" ADD CONSTRAINT "AnalysisReport_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisReport" ADD CONSTRAINT "AnalysisReport_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisReport" ADD CONSTRAINT "AnalysisReport_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisReport" ADD CONSTRAINT "AnalysisReport_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "CandidateResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiLog" ADD CONSTRAINT "AiLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiLog" ADD CONSTRAINT "AiLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiLog" ADD CONSTRAINT "AiLog_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "CandidateResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

