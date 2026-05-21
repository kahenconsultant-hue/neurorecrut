-- Contact requests and company support tickets.
CREATE TYPE "ContactRequestCategory" AS ENUM ('COMPANY', 'CANDIDATE', 'PARTNERSHIP', 'PRESS', 'DATA_PRIVACY', 'TECHNICAL', 'OTHER');
CREATE TYPE "SupportTicketCategory" AS ENUM ('EVALUATION', 'CANDIDATE_INVITATION', 'REPORT', 'BILLING', 'ACCOUNT_ACCESS', 'DATA_PRIVACY', 'TECHNICAL', 'FEATURE_REQUEST', 'OTHER');
CREATE TYPE "SupportTicketPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_COMPANY', 'RESOLVED', 'CLOSED');
CREATE TYPE "SupportMessageAuthorRole" AS ENUM ('COMPANY', 'ADMIN');

CREATE TABLE "ContactRequest" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "category" "ContactRequestCategory" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "organization" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "detailsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "code" TEXT,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT,
    "createdByUserId" TEXT,
    "assignedToUserId" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "category" "SupportTicketCategory" NOT NULL,
    "priority" "SupportTicketPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
    "impact" TEXT,
    "relatedUrl" TEXT,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportTicketMessage" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "authorRole" "SupportMessageAuthorRole" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportTicketMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContactRequest_uid_key" ON "ContactRequest"("uid");
CREATE INDEX "ContactRequest_category_idx" ON "ContactRequest"("category");
CREATE INDEX "ContactRequest_email_idx" ON "ContactRequest"("email");
CREATE INDEX "ContactRequest_createdAt_idx" ON "ContactRequest"("createdAt");

CREATE UNIQUE INDEX "SupportTicket_uid_key" ON "SupportTicket"("uid");
CREATE UNIQUE INDEX "SupportTicket_code_key" ON "SupportTicket"("code");
CREATE INDEX "SupportTicket_companyId_idx" ON "SupportTicket"("companyId");
CREATE INDEX "SupportTicket_jobId_idx" ON "SupportTicket"("jobId");
CREATE INDEX "SupportTicket_category_idx" ON "SupportTicket"("category");
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");
CREATE INDEX "SupportTicket_priority_idx" ON "SupportTicket"("priority");
CREATE INDEX "SupportTicket_lastActivityAt_idx" ON "SupportTicket"("lastActivityAt");

CREATE UNIQUE INDEX "SupportTicketMessage_uid_key" ON "SupportTicketMessage"("uid");
CREATE INDEX "SupportTicketMessage_ticketId_idx" ON "SupportTicketMessage"("ticketId");
CREATE INDEX "SupportTicketMessage_createdAt_idx" ON "SupportTicketMessage"("createdAt");

ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SupportTicketMessage" ADD CONSTRAINT "SupportTicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportTicketMessage" ADD CONSTRAINT "SupportTicketMessage_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
