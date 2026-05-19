"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { AiPurpose, InvitationStatus, Prisma, PurchaseStatus, RiskLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/app-url";
import { SOFT_SKILLS } from "@/lib/constants";
import { assertRateLimit } from "@/lib/rate-limit";
import { requireAdmin, requireAuth, requireCandidateUser, requireCompanyUser } from "@/lib/security";
import {
  candidateProfileSchema,
  candidateResumeSchema,
  companyProfileSchema,
  draftAnswerSchema,
  evaluationAccessCodeSchema,
  inviteCandidateSchema,
  jobPositionSchema
} from "@/lib/validators";
import { buildCandidateAnalysisPrompt, buildEvaluationGenerationPrompt, buildReportGenerationPrompt, buildTargetProfileGenerationPrompt } from "@/lib/ai/prompts";
import { callJsonAi } from "@/lib/ai/client";
import { fallbackEvaluation, fallbackHrReport, fallbackQualitativeAnalysis, fallbackTargetProfile } from "@/lib/ai/fallbacks";
import { calculateScores } from "@/lib/scoring/scoring-engine";
import { createReportPdfBuffer, type ReportPdfMetadata } from "@/lib/pdf/report-pdf";
import type { CandidateAnswersJson, EvaluationJson } from "@/types/evaluation";

function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function formText(formData: FormData, key: string) {
  const selectedValues = formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
  const customValue = String(formData.get(`${key}Other`) ?? "").trim();
  return Array.from(new Set([...selectedValues, customValue].filter(Boolean))).join("\n");
}

function lower(value: string) {
  return value.trim().toLowerCase();
}

function jsonInput(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function bytesInput(buffer: Buffer): Uint8Array<ArrayBuffer> {
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);
  const view = new Uint8Array(arrayBuffer);
  view.set(buffer);
  return view;
}

function formNumber(formData: FormData, key: string, fallback = 3) {
  const raw = formData.get(key);
  const parsed = Number.parseInt(String(raw ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formFloat(formData: FormData, key: string, fallback = 0) {
  const raw = String(formData.get(key) ?? "").replace(",", ".");
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function nullableFormString(formData: FormData, key: string) {
  const value = formString(formData, key);
  return value.length > 0 ? value : null;
}

function adminDateInput(formData: FormData, key: string) {
  const value = formString(formData, key);
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function revalidateAdminPaths() {
  [
    "/admin/dashboard",
    "/admin/companies",
    "/admin/candidates",
    "/admin/jobs",
    "/admin/purchases",
    "/admin/pricing",
    "/admin/evaluations",
    "/admin/responses",
    "/admin/reports",
    "/admin/ai-logs"
  ].forEach((path) => revalidatePath(path));
}

function extractSoftSkillMatrix(formData: FormData) {
  return Object.fromEntries(
    SOFT_SKILLS.map((skill) => {
      const value = formNumber(formData, `softSkill.${skill}`, 3);
      return [skill, Math.min(5, Math.max(0, value))];
    })
  );
}

function buildJobPayload(formData: FormData) {
  return {
    title: formText(formData, "title"),
    description: formText(formData, "description"),
    mainMissions: formText(formData, "mainMissions"),
    hardSkillsRequired: formText(formData, "hardSkillsRequired"),
    seniorityLevel: formText(formData, "seniorityLevel"),
    contractType: formText(formData, "contractType"),
    location: formText(formData, "location"),
    workMode: formText(formData, "workMode"),
    teamContext: formText(formData, "teamContext"),
    managerProfile: formText(formData, "managerProfile"),
    managementStyle: formText(formData, "managementStyle"),
    workRhythm: formText(formData, "workRhythm"),
    mainConstraints: formText(formData, "mainConstraints"),
    expectedPerformanceIndicators: formText(formData, "expectedPerformanceIndicators"),
    companySpecificExpectations: formText(formData, "companySpecificExpectations"),
    softSkillMatrix: extractSoftSkillMatrix(formData)
  };
}

function buildResumeJson(parsed: ReturnType<typeof candidateResumeSchema.parse>) {
  return {
    headline: parsed.headline || parsed.currentRole || null,
    professional_summary: parsed.professionalSummary || null,
    key_skills: parsed.keySkills || null,
    technical_skills: parsed.technicalSkills || null,
    languages: parsed.languages || null,
    experience: parsed.experienceJson || null,
    education: parsed.educationJson || parsed.education || null,
    certifications: parsed.certifications || null,
    projects: parsed.projects || null,
    achievements: parsed.achievements || null,
    portfolio_url: parsed.portfolioUrl || null,
    references: parsed.references || null,
    updated_at: new Date().toISOString()
  };
}

function buildCandidateProfileData(parsed: ReturnType<typeof candidateResumeSchema.parse>, companyId: string) {
  return {
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    email: lower(parsed.email),
    phone: parsed.phone || null,
    linkedin: parsed.linkedin || null,
    cvUrl: parsed.cvUrl || null,
    currentRole: parsed.currentRole || null,
    experienceYears: parsed.experienceYears,
    education: parsed.education || null,
    availability: parsed.availability || null,
    mobility: parsed.mobility || null,
    salaryExpectations: parsed.salaryExpectations || null,
    motivation: parsed.motivation || null,
    workPreferences: parsed.workPreferences || null,
    resumeJson: jsonInput(buildResumeJson(parsed)),
    companyId
  };
}

async function getCompanyJob(jobUid: string) {
  const { session, company } = await requireCompanyUser();
  const job = await prisma.jobPosition.findUnique({
    where: { uid: jobUid },
    include: { company: true, evaluations: { orderBy: { createdAt: "desc" }, take: 1 } }
  });
  if (!job) throw new Error("Poste introuvable");
  if (session.user.role !== "ADMIN" && job.companyId !== company?.id) {
    throw new Error("Accès refusé");
  }
  return job;
}

async function findCreditBalance(companyId: string, jobId?: string) {
  const balances = await prisma.creditBalance.findMany({
    where: {
      companyId,
      active: true,
      OR: [{ jobId }, { jobId: null }]
    },
    orderBy: [{ jobId: "desc" }, { createdAt: "asc" }]
  });
  return balances.find((balance) => balance.creditsPurchased - balance.creditsUsed > 0);
}

export async function createCompanyProfile(_: unknown, formData: FormData) {
  return updateCompanyProfile(_, formData);
}

export async function updateCompanyProfile(_: unknown, formData: FormData) {
  const { session } = await requireCompanyUser();
  if (!session.user.companyId) throw new Error("Entreprise introuvable");
  const result = companyProfileSchema.safeParse({
    name: formText(formData, "name"),
    siretSiren: formText(formData, "siretSiren"),
    sector: formText(formData, "sector"),
    size: formText(formData, "size"),
    website: formText(formData, "website"),
    address: formText(formData, "address"),
    hrContactName: formText(formData, "hrContactName"),
    hrContactEmail: formText(formData, "hrContactEmail"),
    culture: formText(formData, "culture"),
    values: formText(formData, "values"),
    managementStyle: formText(formData, "managementStyle"),
    teamWorkingStyle: formText(formData, "teamWorkingStyle"),
    workEnvironment: formText(formData, "workEnvironment")
  });
  if (!result.success) {
    redirect("/company/profile?error=validation");
  }
  const parsed = result.data;

  await prisma.company.update({
    where: { id: session.user.companyId },
    data: {
      ...parsed,
      website: parsed.website || null,
      ownerEmail: session.user.email ?? parsed.hrContactEmail
    }
  });

  revalidatePath("/company/profile");
  redirect("/company/dashboard");
}

export async function createJobPosition(_: unknown, formData: FormData) {
  const { session } = await requireCompanyUser();
  if (!session.user.companyId) throw new Error("Entreprise introuvable");

  const result = jobPositionSchema.safeParse(buildJobPayload(formData));
  if (!result.success) {
    redirect("/company/jobs/new?error=validation");
  }
  const parsed = result.data;

  const job = await prisma.jobPosition.create({
    data: {
      ...parsed,
      companyId: session.user.companyId,
      softSkillMatrix: jsonInput(parsed.softSkillMatrix)
    }
  });

  await generateTargetProfile(job.uid);
  await generateEvaluation(job.uid);

  revalidatePath("/company/jobs");
  redirect(`/company/jobs/${job.uid}`);
}

export async function updateJobPosition(jobUid: string, _: unknown, formData: FormData) {
  const job = await getCompanyJob(jobUid);
  const result = jobPositionSchema.safeParse(buildJobPayload(formData));
  if (!result.success) {
    redirect(`/company/jobs/${jobUid}/edit?error=validation`);
  }
  const parsed = result.data;

  await prisma.jobPosition.update({
    where: { id: job.id },
    data: {
      ...parsed,
      softSkillMatrix: jsonInput(parsed.softSkillMatrix)
    }
  });

  revalidatePath(`/company/jobs/${jobUid}`);
  redirect(`/company/jobs/${jobUid}`);
}

export async function generateTargetProfile(jobUid: string) {
  const job = await getCompanyJob(jobUid);
  assertRateLimit(`target:${job.companyId}`);

  const jobProfile = {
    title: job.title,
    description: job.description,
    mainMissions: job.mainMissions,
    hardSkillsRequired: job.hardSkillsRequired,
    seniorityLevel: job.seniorityLevel,
    teamContext: job.teamContext,
    managerProfile: job.managerProfile,
    managementStyle: job.managementStyle,
    workRhythm: job.workRhythm,
    mainConstraints: job.mainConstraints,
    expectedPerformanceIndicators: job.expectedPerformanceIndicators,
    companySpecificExpectations: job.companySpecificExpectations,
    softSkillMatrix: job.softSkillMatrix
  };

  const companyProfile = {
    culture: job.company.culture,
    values: job.company.values,
    managementStyle: job.company.managementStyle,
    teamWorkingStyle: job.company.teamWorkingStyle,
    workEnvironment: job.company.workEnvironment
  };

  const targetProfile = await callJsonAi<Record<string, unknown>>({
    purpose: AiPurpose.TARGET_PROFILE,
    companyId: job.companyId,
    jobId: job.id,
    prompt: buildTargetProfileGenerationPrompt(jobProfile, companyProfile),
    fallback: fallbackTargetProfile(jobProfile, companyProfile)
  });

  await prisma.jobPosition.update({
    where: { id: job.id },
    data: {
      targetProfile: jsonInput(targetProfile),
      targetProfileGeneratedAt: new Date(),
      status: "TARGET_PROFILE_GENERATED"
    }
  });

  revalidatePath(`/company/jobs/${jobUid}/target-profile`);
}

export async function createStripeCheckoutSession(jobUid: string | null, planCode: string) {
  const { session, company } = await requireCompanyUser();
  if (!company || !session.user.companyId) throw new Error("Entreprise introuvable");

  const plan = await prisma.pricingPlan.findUnique({ where: { code: planCode } });
  if (!plan || !plan.active) throw new Error("Offre introuvable");

  const job = jobUid ? await getCompanyJob(jobUid) : null;
  if (plan.jobScoped && !job) throw new Error("Cette offre doit être liée à un poste.");

  const purchase = await prisma.purchase.create({
    data: {
      companyId: company.id,
      jobId: job?.id,
      planId: plan.id,
      amountCents: plan.priceCents,
      currency: plan.currency,
      creditsPurchased: plan.credits,
      status: PurchaseStatus.PENDING
    }
  });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY manquant. Configurez Stripe pour finaliser l'achat.");
  }

  const stripe = new Stripe(stripeKey);
  const appUrl = getAppUrl();
  const checkout = await stripe.checkout.sessions.create({
    mode: plan.monthly ? "subscription" : "payment",
    customer_email: session.user.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: plan.currency,
          unit_amount: plan.priceCents,
          recurring: plan.monthly ? { interval: "month" } : undefined,
          product_data: {
            name: `NeuroRecrut ${plan.name}`,
            description: plan.description ?? undefined
          }
        }
      }
    ],
    success_url: `${appUrl}/company/${jobUid ? `jobs/${jobUid}/billing` : "billing"}?success=1`,
    cancel_url: `${appUrl}/company/${jobUid ? `jobs/${jobUid}/billing` : "billing"}?canceled=1`,
    metadata: {
      purchaseId: purchase.id,
      companyId: company.id,
      jobId: job?.id ?? "",
      planCode: plan.code
    }
  });

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { stripeCheckoutSessionId: checkout.id }
  });

  if (!checkout.url) throw new Error("Stripe n'a pas retourné d'URL Checkout.");
  redirect(checkout.url);
}

export async function activateCreditsAfterPayment(stripeCheckoutSessionId: string, paymentIntentId?: string, subscriptionId?: string) {
  const purchase = await prisma.purchase.findUnique({
    where: { stripeCheckoutSessionId },
    include: { plan: true, creditBalance: true }
  });
  if (!purchase) throw new Error("Achat introuvable");
  if (purchase.status === PurchaseStatus.PAID && purchase.creditBalance) return purchase.creditBalance;

  const now = new Date();
  const periodEnd = purchase.plan.monthly ? new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()) : null;

  return prisma.$transaction(async (tx) => {
    const updatedPurchase = await tx.purchase.update({
      where: { id: purchase.id },
      data: {
        status: PurchaseStatus.PAID,
        stripePaymentIntentId: paymentIntentId,
        stripeSubscriptionId: subscriptionId,
        paidAt: now
      }
    });

    return tx.creditBalance.upsert({
      where: { purchaseId: updatedPurchase.id },
      create: {
        companyId: updatedPurchase.companyId,
        jobId: purchase.plan.jobScoped ? updatedPurchase.jobId : null,
        planId: updatedPurchase.planId,
        purchaseId: updatedPurchase.id,
        creditsPurchased: updatedPurchase.creditsPurchased,
        creditsUsed: 0,
        monthlyLimit: purchase.plan.monthly ? purchase.plan.credits : null,
        periodStart: purchase.plan.monthly ? now : null,
        periodEnd,
        stripeSubscriptionId: subscriptionId,
        active: true
      },
      update: {
        active: true,
        creditsPurchased: updatedPurchase.creditsPurchased,
        stripeSubscriptionId: subscriptionId
      }
    });
  });
}

export async function generateEvaluation(jobUid: string) {
  const job = await getCompanyJob(jobUid);
  assertRateLimit(`evaluation:${job.companyId}`);

  if (!job.targetProfile) {
    await generateTargetProfile(jobUid);
  }
  const freshJob = await prisma.jobPosition.findUniqueOrThrow({
    where: { id: job.id },
    include: { company: true }
  });

  const jobProfile = {
    uid: freshJob.uid,
    companyUid: freshJob.company.uid,
    title: freshJob.title,
    description: freshJob.description,
    mainMissions: freshJob.mainMissions,
    hardSkillsRequired: freshJob.hardSkillsRequired,
    softSkillMatrix: freshJob.softSkillMatrix,
    teamContext: freshJob.teamContext,
    managerProfile: freshJob.managerProfile,
    workConstraints: freshJob.mainConstraints
  };

  const fallback = fallbackEvaluation(freshJob.company.uid, freshJob.uid, freshJob.title);
  const generated = await callJsonAi<EvaluationJson>({
    purpose: AiPurpose.EVALUATION_GENERATION,
    companyId: freshJob.companyId,
    jobId: freshJob.id,
    prompt: buildEvaluationGenerationPrompt(jobProfile, freshJob.targetProfile),
    fallback
  });

  const normalized: EvaluationJson = {
    ...generated,
    evaluation_uid: generated.evaluation_uid || fallback.evaluation_uid,
    company_uid: freshJob.company.uid,
    job_uid: freshJob.uid,
    language: "fr",
    version: "NeuroRecrut Ultra MVP v1"
  };

  await prisma.evaluation.create({
    data: {
      uid: normalized.evaluation_uid,
      companyId: freshJob.companyId,
      jobId: freshJob.id,
      json: jsonInput(normalized),
      generatedByUserId: (await requireAuth()).user.id,
      status: "GENERATED"
    }
  });

  await prisma.jobPosition.update({
    where: { id: freshJob.id },
    data: { status: "EVALUATION_GENERATED" }
  });

  revalidatePath(`/company/jobs/${jobUid}/evaluation`);
}

export async function createCandidateInvitation(jobUid: string, _: unknown, formData: FormData) {
  const job = await getCompanyJob(jobUid);
  const parsed = inviteCandidateSchema.parse({ candidateEmail: formData.get("candidateEmail") });
  const evaluation = await prisma.evaluation.findFirst({
    where: { jobId: job.id },
    orderBy: { createdAt: "desc" }
  });
  if (!evaluation) throw new Error("Générez l'évaluation avant d'inviter un candidat.");

  const balance = await findCreditBalance(job.companyId, job.id);
  if (!balance) throw new Error("Aucun crédit disponible pour ce poste.");

  const candidate = await prisma.candidate.findFirst({
    where: { email: lower(parsed.candidateEmail) }
  });

  const invitation = await prisma.evaluationInvitation.create({
    data: {
      companyId: job.companyId,
      jobId: job.id,
      evaluationId: evaluation.id,
      candidateId: candidate?.id,
      candidateEmail: lower(parsed.candidateEmail),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      createdByUserId: (await requireAuth()).user.id
    }
  });

  await prisma.jobPosition.update({
    where: { id: job.id },
    data: { status: "INVITATIONS_SENT" }
  });

  revalidatePath(`/company/jobs/${jobUid}/invite`);
  return invitation.uid;
}

export async function validateInvitation(invitationUid: string, options?: { allowSubmitted?: boolean }) {
  const invitation = await prisma.evaluationInvitation.findUnique({
    where: { uid: invitationUid },
    include: {
      company: true,
      job: true,
      evaluation: true,
      candidate: true,
      response: { include: { report: true } }
    }
  });
  if (!invitation) throw new Error("Invitation introuvable");
  if (invitation.expiresAt < new Date()) {
    await prisma.evaluationInvitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.EXPIRED }
    });
    throw new Error("Invitation expirée");
  }
  if (!invitation.evaluation) throw new Error("Évaluation introuvable");
  if (invitation.response?.isSubmitted && !options?.allowSubmitted) throw new Error("Évaluation déjà soumise");
  const balance = await findCreditBalance(invitation.companyId, invitation.jobId);
  if (!balance) throw new Error("Aucun crédit disponible. L'entreprise doit recharger ses crédits.");
  return invitation;
}

export async function saveCandidateProfile(invitationUid: string, _: unknown, formData: FormData) {
  const invitation = await validateInvitation(invitationUid);
  const parsed = candidateResumeSchema.parse(Object.fromEntries(formData.entries()));
  if (lower(parsed.email) !== lower(invitation.candidateEmail)) {
    throw new Error("L'email doit correspondre à l'invitation.");
  }

  const candidate = await prisma.candidate.upsert({
    where: { uid: invitation.candidate?.uid ?? `missing_${randomUUID()}` },
    create: buildCandidateProfileData(parsed, invitation.companyId),
    update: buildCandidateProfileData(parsed, invitation.companyId)
  });

  await prisma.evaluationInvitation.update({
    where: { id: invitation.id },
    data: {
      candidateId: candidate.id,
      status: InvitationStatus.STARTED,
      startedAt: invitation.startedAt ?? new Date()
    }
  });

  redirect(`/candidate/evaluation/${invitationUid}`);
}

export async function startEvaluationByAccessCode(_: unknown, formData: FormData) {
  const { session, candidate } = await requireCandidateUser();
  const parsed = evaluationAccessCodeSchema.parse({
    accessCode: formString(formData, "accessCode")
  });
  const accessCode = parsed.accessCode.trim();

  const evaluation = await prisma.evaluation.findFirst({
    where: {
      OR: [{ uid: accessCode }, { job: { uid: accessCode } }]
    },
    include: {
      job: { include: { company: true } },
      invitations: {
        where: { candidateId: candidate.id },
        include: { response: true },
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  });

  if (!evaluation) {
    redirect("/candidate/dashboard?error=code");
  }

  const balance = await findCreditBalance(evaluation.companyId, evaluation.jobId);
  if (!balance) {
    redirect("/candidate/dashboard?error=credits");
  }

  const existingInvitation = evaluation.invitations[0];
  if (existingInvitation?.response?.isSubmitted) {
    redirect("/candidate/dashboard?status=already_completed");
  }

  const invitation =
    existingInvitation ??
    (await prisma.evaluationInvitation.create({
      data: {
        companyId: evaluation.companyId,
        jobId: evaluation.jobId,
        evaluationId: evaluation.id,
        candidateId: candidate.id,
        candidateEmail: lower(session.user.email ?? candidate.email),
        status: InvitationStatus.STARTED,
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21)
      },
      include: { response: true }
    }));

  const hasResumeProfile = Boolean(
    candidate.currentRole &&
      candidate.experienceYears !== null &&
      candidate.education &&
      candidate.availability &&
      candidate.mobility &&
      candidate.workPreferences
  );

  redirect(hasResumeProfile ? `/candidate/evaluation/${invitation.uid}` : `/candidate/profile/${invitation.uid}`);
}

export async function getCandidateDashboardData() {
  const { session, candidate } = await requireCandidateUser();
  const email = lower(session.user.email ?? candidate.email);
  const invitations = await prisma.evaluationInvitation.findMany({
    where: {
      OR: [
        { candidateId: candidate.id },
        { candidateEmail: email }
      ]
    },
    include: {
      job: { include: { company: true } },
      evaluation: true,
      response: { include: { report: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return { candidate, invitations };
}

export async function saveDraftAnswer(invitationUid: string, payload: unknown) {
  const invitation = await validateInvitation(invitationUid);
  if (!invitation.candidateId) throw new Error("Profil candidat requis");
  const parsed = draftAnswerSchema.parse(payload);

  await prisma.candidateResponse.upsert({
    where: { invitationId: invitation.id },
    create: {
      uid: `resp_${randomUUID()}`,
      candidateId: invitation.candidateId,
      companyId: invitation.companyId,
      jobId: invitation.jobId,
      evaluationId: invitation.evaluationId,
      invitationId: invitation.id,
      draftJson: jsonInput(parsed),
      answersJson: jsonInput({ response_uid: "", answers: [] })
    },
    update: {
      draftJson: jsonInput(parsed)
    }
  });

  return { ok: true };
}

export async function submitCandidateResponse(invitationUid: string, payload: unknown) {
  const invitation = await validateInvitation(invitationUid, { allowSubmitted: true });
  if (!invitation.candidateId) throw new Error("Profil candidat requis");
  if (invitation.response?.isSubmitted) {
    if (!invitation.response.report) {
      await analyzeCandidateResponse(invitation.response.uid);
    }
    return { ok: true };
  }
  const parsed = draftAnswerSchema.parse(payload);
  const responseUid = invitation.response?.uid ?? `resp_${randomUUID()}`;
  const answersJson: CandidateAnswersJson = {
    response_uid: responseUid,
    answers: parsed.answers
  };

  const response = await prisma.$transaction(async (tx) => {
    const existing = await tx.candidateResponse.findUnique({ where: { invitationId: invitation.id } });
    if (existing?.isSubmitted) throw new Error("Réponse déjà soumise");

    const balances = await tx.creditBalance.findMany({
      where: {
        companyId: invitation.companyId,
        active: true,
        OR: [{ jobId: invitation.jobId }, { jobId: null }]
      },
      orderBy: [{ jobId: "desc" }, { createdAt: "asc" }]
    });
    const balance = balances.find((item) => item.creditsPurchased - item.creditsUsed > 0);
    if (!balance) throw new Error("Aucun crédit disponible");

    const saved = await tx.candidateResponse.upsert({
      where: { invitationId: invitation.id },
      create: {
        uid: responseUid,
        candidateId: invitation.candidateId!,
        companyId: invitation.companyId,
        jobId: invitation.jobId,
        evaluationId: invitation.evaluationId,
        invitationId: invitation.id,
        answersJson: jsonInput(answersJson),
        draftJson: jsonInput(parsed),
        isSubmitted: true,
        submittedAt: new Date(),
        lockedAt: new Date()
      },
      update: {
        answersJson: jsonInput(answersJson),
        isSubmitted: true,
        submittedAt: new Date(),
        lockedAt: new Date()
      }
    });

    await tx.creditBalance.update({
      where: { id: balance.id },
      data: { creditsUsed: { increment: 1 } }
    });

    await tx.evaluationInvitation.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.COMPLETED,
        completedAt: new Date()
      }
    });

    return saved;
  });

  await analyzeCandidateResponse(response.uid);
  return { ok: true };
}

export async function analyzeCandidateResponse(responseUid: string) {
  const response = await prisma.candidateResponse.findUnique({
    where: { uid: responseUid },
    include: {
      candidate: true,
      job: { include: { company: true } },
      evaluation: true,
      report: true
    }
  });
  if (!response) throw new Error("Réponse introuvable");
  if (response.report) return response.report;

  const evaluationJson = response.evaluation.json as EvaluationJson;
  const answersJson = response.answersJson as CandidateAnswersJson;
  const scores = calculateScores(evaluationJson, answersJson.answers);
  const jobProfile = {
    title: response.job.title,
    description: response.job.description,
    missions: response.job.mainMissions,
    hardSkills: response.job.hardSkillsRequired,
    teamContext: response.job.teamContext,
    managerProfile: response.job.managerProfile
  };
  const candidateProfile = {
    firstName: response.candidate.firstName,
    lastName: response.candidate.lastName,
    currentRole: response.candidate.currentRole,
    experienceYears: response.candidate.experienceYears,
    motivation: response.candidate.motivation,
    workPreferences: response.candidate.workPreferences
  };

  const qualitative = await callJsonAi<Record<string, unknown>>({
    purpose: AiPurpose.CANDIDATE_ANALYSIS,
    companyId: response.companyId,
    jobId: response.jobId,
    responseId: response.id,
    prompt: buildCandidateAnalysisPrompt(jobProfile, response.job.targetProfile, evaluationJson, candidateProfile, answersJson),
    fallback: fallbackQualitativeAnalysis(scores)
  });

  const analysisJson = {
    ...scores,
    qualitative,
    generated_at: new Date().toISOString()
  };

  const reportJson = await generateHrReport(analysisJson, response.companyId, response.jobId, response.id);
  const reportMetadata: ReportPdfMetadata = {
    candidate: {
      nom: [response.candidate.firstName, response.candidate.lastName].filter(Boolean).join(" ") || response.candidate.email,
      email: response.candidate.email,
      poste_actuel: response.candidate.currentRole ?? "-",
      experience: response.candidate.experienceYears != null ? `${response.candidate.experienceYears} ans` : "-",
      disponibilite: response.candidate.availability ?? "-"
    },
    job: {
      poste: response.job.title,
      contrat: response.job.contractType,
      localisation: response.job.location,
      mode: response.job.workMode,
      niveau: response.job.seniorityLevel
    },
    company: {
      entreprise: response.job.company.name ?? "Entreprise",
      secteur: response.job.company.sector ?? "-",
      taille: response.job.company.size ?? "-",
      contact_rh: response.job.company.hrContactName ?? "-",
      email_rh: response.job.company.hrContactEmail ?? "-"
    }
  };
  const pdfBuffer = await generateReportPdf(reportJson, analysisJson, reportMetadata);

  return prisma.analysisReport.create({
    data: {
      uid: `report_${randomUUID()}`,
      companyId: response.companyId,
      jobId: response.jobId,
      evaluationId: response.evaluationId,
      candidateId: response.candidateId,
      responseId: response.id,
      analysisJson: jsonInput(analysisJson),
      reportJson: jsonInput(reportJson),
      pdfBuffer: bytesInput(pdfBuffer),
      pdfFileName: `rapport-neurorecrut-${response.candidate.lastName ?? "candidat"}.pdf`,
      globalScore: scores.global_score,
      matchingScore: scores.job_matching_score,
      coherenceIndex: scores.coherence_index,
      sincerityIndex: scores.sincerity_index,
      riskLevel: scores.risk_level as RiskLevel,
      recommendation: scores.recommendation,
      finalOpinion: scores.final_opinion
    }
  });
}

export async function generateHrReport(analysisJson: Record<string, unknown>, companyId?: string, jobId?: string, responseId?: string) {
  return callJsonAi<Record<string, unknown>>({
    purpose: AiPurpose.HR_REPORT,
    companyId,
    jobId,
    responseId,
    prompt: buildReportGenerationPrompt(analysisJson),
    fallback: fallbackHrReport(analysisJson)
  });
}

export async function generateReportPdf(reportJson: Record<string, unknown>, analysisJson?: Record<string, unknown>, metadata?: ReportPdfMetadata) {
  return createReportPdfBuffer({ reportJson, analysisJson, metadata }, "Rapport NeuroRecrut");
}

export async function getCompanyDashboardData() {
  const { session, company } = await requireCompanyUser();
  if (!company || !session.user.companyId) throw new Error("Entreprise introuvable");
  const [jobs, reports, credits, invitations] = await Promise.all([
    prisma.jobPosition.findMany({
      where: { companyId: company.id },
      include: { invitations: true, reports: true, evaluations: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.analysisReport.findMany({
      where: { companyId: company.id },
      include: { candidate: true, job: true },
      orderBy: { matchingScore: "desc" }
    }),
    prisma.creditBalance.findMany({ where: { companyId: company.id, active: true } }),
    prisma.evaluationInvitation.findMany({ where: { companyId: company.id } })
  ]);

  const creditsPurchased = credits.reduce((sum, item) => sum + item.creditsPurchased, 0);
  const creditsUsed = credits.reduce((sum, item) => sum + item.creditsUsed, 0);
  return {
    company,
    jobs,
    reports,
    invitations,
    credits: {
      purchased: creditsPurchased,
      used: creditsUsed,
      remaining: creditsPurchased - creditsUsed
    },
    kpis: {
      jobsCount: jobs.length,
      completedEvaluations: reports.length,
      averageMatching:
        reports.length > 0 ? Math.round(reports.reduce((sum, report) => sum + report.matchingScore, 0) / reports.length) : 0,
      bestCandidate: reports[0] ?? null
    }
  };
}

export async function getCandidateComparisonData(jobUid: string) {
  const job = await getCompanyJob(jobUid);
  const reports = await prisma.analysisReport.findMany({
    where: { jobId: job.id },
    include: {
      candidate: true,
      response: true
    },
    orderBy: { matchingScore: "desc" }
  });
  return { job, reports };
}

export async function getAdminDashboardData() {
  await requireAdmin();
  const [companies, jobs, purchases, evaluations, reports, aiLogs, candidates, responses, invitations, creditBalances, pricingPlans, users] = await Promise.all([
    prisma.company.findMany({
      include: {
        _count: { select: { jobs: true, candidates: true, reports: true, evaluations: true, purchases: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.jobPosition.findMany({
      include: {
        company: true,
        evaluations: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { invitations: true, responses: true, reports: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.purchase.findMany({ include: { company: true, plan: true, job: true, creditBalance: true }, orderBy: { createdAt: "desc" } }),
    prisma.evaluation.findMany({
      include: {
        company: true,
        job: true,
        _count: { select: { invitations: true, responses: true, reports: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.analysisReport.findMany({
      include: { company: true, job: true, candidate: true, response: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.aiLog.findMany({ include: { company: true, job: true, response: true }, orderBy: { createdAt: "desc" }, take: 150 }),
    prisma.candidate.findMany({
      include: {
        company: true,
        user: true,
        _count: { select: { invitations: true, responses: true, reports: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.candidateResponse.findMany({
      include: {
        company: true,
        job: true,
        candidate: true,
        evaluation: true,
        report: true
      },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.evaluationInvitation.findMany({
      include: {
        company: true,
        job: true,
        evaluation: true,
        candidate: true,
        response: { include: { report: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.creditBalance.findMany({
      include: { company: true, job: true, plan: true, purchase: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.pricingPlan.findMany({
      include: { _count: { select: { purchases: true, creditBalances: true } } },
      orderBy: [{ active: "desc" }, { priceCents: "asc" }]
    }),
    prisma.user.findMany({
      include: { company: true, candidate: true },
      orderBy: { createdAt: "desc" }
    })
  ]);
  return { companies, jobs, purchases, evaluations, reports, aiLogs, candidates, responses, invitations, creditBalances, pricingPlans, users };
}

export async function getAdminCompanyDetail(companyUid: string) {
  await requireAdmin();
  return prisma.company.findUniqueOrThrow({
    where: { uid: companyUid },
    include: {
      users: true,
      jobs: {
        include: {
          evaluations: { orderBy: { createdAt: "desc" } },
          invitations: true,
          responses: true,
          reports: true,
          creditBalances: { include: { plan: true, purchase: true } }
        },
        orderBy: { createdAt: "desc" }
      },
      purchases: { include: { plan: true, job: true, creditBalance: true }, orderBy: { createdAt: "desc" } },
      creditBalances: { include: { job: true, plan: true, purchase: true }, orderBy: { createdAt: "desc" } },
      evaluations: { include: { job: true }, orderBy: { createdAt: "desc" } },
      candidates: { include: { user: true, reports: true, responses: true }, orderBy: { createdAt: "desc" } },
      invitations: { include: { job: true, evaluation: true, candidate: true, response: true }, orderBy: { createdAt: "desc" } },
      responses: { include: { job: true, candidate: true, report: true }, orderBy: { updatedAt: "desc" } },
      reports: { include: { job: true, candidate: true, response: true }, orderBy: { createdAt: "desc" } },
      aiLogs: { include: { job: true, response: true }, orderBy: { createdAt: "desc" }, take: 80 },
      auditLogs: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 80 }
    }
  });
}

export async function getAdminJobDetail(jobUid: string) {
  await requireAdmin();
  return prisma.jobPosition.findUniqueOrThrow({
    where: { uid: jobUid },
    include: {
      company: true,
      evaluations: { include: { generatedBy: true, invitations: true, responses: true, reports: true }, orderBy: { createdAt: "desc" } },
      invitations: { include: { candidate: true, evaluation: true, response: { include: { report: true } } }, orderBy: { createdAt: "desc" } },
      responses: { include: { candidate: true, evaluation: true, report: true }, orderBy: { updatedAt: "desc" } },
      reports: { include: { candidate: true, response: true }, orderBy: { matchingScore: "desc" } },
      creditBalances: { include: { plan: true, purchase: true }, orderBy: { createdAt: "desc" } },
      purchases: { include: { plan: true, creditBalance: true }, orderBy: { createdAt: "desc" } },
      aiLogs: { include: { response: true }, orderBy: { createdAt: "desc" }, take: 80 }
    }
  });
}

export async function getAdminCandidateDetail(candidateUid: string) {
  await requireAdmin();
  return prisma.candidate.findUniqueOrThrow({
    where: { uid: candidateUid },
    include: {
      user: true,
      company: true,
      invitations: { include: { company: true, job: true, evaluation: true, response: { include: { report: true } } }, orderBy: { createdAt: "desc" } },
      responses: { include: { company: true, job: true, evaluation: true, report: true }, orderBy: { updatedAt: "desc" } },
      reports: { include: { company: true, job: true, response: true }, orderBy: { createdAt: "desc" } }
    }
  });
}

export async function getAdminEvaluationDetail(evaluationUid: string) {
  await requireAdmin();
  return prisma.evaluation.findUniqueOrThrow({
    where: { uid: evaluationUid },
    include: {
      company: true,
      job: true,
      generatedBy: true,
      invitations: { include: { candidate: true, response: true }, orderBy: { createdAt: "desc" } },
      responses: { include: { candidate: true, report: true }, orderBy: { updatedAt: "desc" } },
      reports: { include: { candidate: true, response: true }, orderBy: { createdAt: "desc" } }
    }
  });
}

export async function getAdminResponseDetail(responseUid: string) {
  await requireAdmin();
  return prisma.candidateResponse.findUniqueOrThrow({
    where: { uid: responseUid },
    include: {
      company: true,
      job: true,
      candidate: true,
      evaluation: true,
      invitation: true,
      report: true,
      aiLogs: { orderBy: { createdAt: "desc" } }
    }
  });
}

export async function getAdminReportDetail(reportUid: string) {
  await requireAdmin();
  return prisma.analysisReport.findUniqueOrThrow({
    where: { uid: reportUid },
    include: {
      company: true,
      job: true,
      candidate: true,
      evaluation: true,
      response: true
    }
  });
}

export async function getAdminAiLogDetail(logUid: string) {
  await requireAdmin();
  return prisma.aiLog.findUniqueOrThrow({
    where: { uid: logUid },
    include: {
      company: true,
      job: true,
      response: { include: { candidate: true, report: true } }
    }
  });
}

export async function toggleCompanyStatus(companyUid: string) {
  await requireAdmin();
  const company = await prisma.company.findUniqueOrThrow({ where: { uid: companyUid } });
  await prisma.company.update({
    where: { id: company.id },
    data: { status: company.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
  });
  revalidateAdminPaths();
}

export async function manuallyAddCredits(companyUid: string, amount: number) {
  await requireAdmin();
  const company = await prisma.company.findUniqueOrThrow({ where: { uid: companyUid } });
  await prisma.creditBalance.create({
    data: {
      companyId: company.id,
      creditsPurchased: amount,
      creditsUsed: 0,
      active: true
    }
  });
  revalidateAdminPaths();
}

export async function updateAdminCompany(companyUid: string, formData: FormData) {
  await requireAdmin();
  await prisma.company.update({
    where: { uid: companyUid },
    data: {
      name: nullableFormString(formData, "name"),
      siretSiren: nullableFormString(formData, "siretSiren"),
      sector: nullableFormString(formData, "sector"),
      size: nullableFormString(formData, "size"),
      website: nullableFormString(formData, "website"),
      address: nullableFormString(formData, "address"),
      hrContactName: nullableFormString(formData, "hrContactName"),
      hrContactEmail: nullableFormString(formData, "hrContactEmail"),
      ownerEmail: nullableFormString(formData, "ownerEmail"),
      culture: nullableFormString(formData, "culture"),
      values: nullableFormString(formData, "values"),
      managementStyle: nullableFormString(formData, "managementStyle"),
      teamWorkingStyle: nullableFormString(formData, "teamWorkingStyle"),
      workEnvironment: nullableFormString(formData, "workEnvironment"),
      status: formString(formData, "status") === "INACTIVE" ? "INACTIVE" : "ACTIVE"
    }
  });
  revalidateAdminPaths();
  revalidatePath(`/admin/companies/${companyUid}`);
}

export async function updateAdminCandidate(candidateUid: string, formData: FormData) {
  await requireAdmin();
  await prisma.candidate.update({
    where: { uid: candidateUid },
    data: {
      firstName: nullableFormString(formData, "firstName"),
      lastName: nullableFormString(formData, "lastName"),
      email: lower(formString(formData, "email")),
      phone: nullableFormString(formData, "phone"),
      linkedin: nullableFormString(formData, "linkedin"),
      cvUrl: nullableFormString(formData, "cvUrl"),
      currentRole: nullableFormString(formData, "currentRole"),
      experienceYears: formNumber(formData, "experienceYears", 0),
      education: nullableFormString(formData, "education"),
      availability: nullableFormString(formData, "availability"),
      mobility: nullableFormString(formData, "mobility"),
      salaryExpectations: nullableFormString(formData, "salaryExpectations"),
      motivation: nullableFormString(formData, "motivation"),
      workPreferences: nullableFormString(formData, "workPreferences")
    }
  });
  revalidateAdminPaths();
  revalidatePath(`/admin/candidates/${candidateUid}`);
}

export async function updateAdminJob(jobUid: string, formData: FormData) {
  await requireAdmin();
  const result = jobPositionSchema.safeParse(buildJobPayload(formData));
  if (!result.success) {
    redirect(`/admin/jobs/${jobUid}?error=validation`);
  }
  const status = formString(formData, "status");
  const parsed = result.data;

  await prisma.jobPosition.update({
    where: { uid: jobUid },
    data: {
      ...parsed,
      softSkillMatrix: jsonInput(parsed.softSkillMatrix),
      status:
        status === "ARCHIVED"
          ? "ARCHIVED"
          : status === "INVITATIONS_SENT"
            ? "INVITATIONS_SENT"
            : status === "EVALUATION_GENERATED"
              ? "EVALUATION_GENERATED"
              : status === "TARGET_PROFILE_GENERATED"
                ? "TARGET_PROFILE_GENERATED"
                : "DRAFT"
    }
  });
  revalidateAdminPaths();
  revalidatePath(`/admin/jobs/${jobUid}`);
}

export async function updateAdminPricingPlan(planCode: string, formData: FormData) {
  await requireAdmin();
  const priceCents = Math.round(formFloat(formData, "priceEuro", 0) * 100);
  await prisma.pricingPlan.update({
    where: { code: planCode },
    data: {
      name: formString(formData, "name"),
      description: nullableFormString(formData, "description"),
      priceCents,
      currency: lower(formString(formData, "currency") || "eur"),
      credits: formNumber(formData, "credits", 0),
      jobScoped: formBoolean(formData, "jobScoped"),
      monthly: formBoolean(formData, "monthly"),
      stripePriceId: nullableFormString(formData, "stripePriceId"),
      active: formBoolean(formData, "active")
    }
  });
  revalidateAdminPaths();
}

export async function adminCreatePricingPlan(formData: FormData) {
  await requireAdmin();
  const code = formString(formData, "code").toUpperCase().replace(/[^A-Z0-9_-]/g, "_");
  if (!code) redirect("/admin/pricing?error=code");
  await prisma.pricingPlan.create({
    data: {
      code,
      name: formString(formData, "name") || code,
      description: nullableFormString(formData, "description"),
      priceCents: Math.round(formFloat(formData, "priceEuro", 0) * 100),
      currency: lower(formString(formData, "currency") || "eur"),
      credits: formNumber(formData, "credits", 0),
      jobScoped: formBoolean(formData, "jobScoped"),
      monthly: formBoolean(formData, "monthly"),
      stripePriceId: nullableFormString(formData, "stripePriceId"),
      active: formBoolean(formData, "active")
    }
  });
  revalidateAdminPaths();
}

export async function adminAddCredits(companyUid: string, formData: FormData) {
  await requireAdmin();
  const company = await prisma.company.findUniqueOrThrow({ where: { uid: companyUid } });
  const jobUid = formString(formData, "jobUid");
  const planCode = formString(formData, "planCode");
  const job = jobUid ? await prisma.jobPosition.findFirst({ where: { uid: jobUid, companyId: company.id } }) : null;
  const plan = planCode ? await prisma.pricingPlan.findUnique({ where: { code: planCode } }) : null;

  await prisma.creditBalance.create({
    data: {
      companyId: company.id,
      jobId: job?.id ?? null,
      planId: plan?.id ?? null,
      creditsPurchased: Math.max(0, formNumber(formData, "creditsPurchased", 0)),
      creditsUsed: Math.max(0, formNumber(formData, "creditsUsed", 0)),
      monthlyLimit: formNumber(formData, "monthlyLimit", 0) || null,
      active: formBoolean(formData, "active")
    }
  });
  revalidateAdminPaths();
  revalidatePath(`/admin/companies/${companyUid}`);
}

export async function updateAdminCreditBalance(balanceUid: string, formData: FormData) {
  await requireAdmin();
  await prisma.creditBalance.update({
    where: { uid: balanceUid },
    data: {
      creditsPurchased: Math.max(0, formNumber(formData, "creditsPurchased", 0)),
      creditsUsed: Math.max(0, formNumber(formData, "creditsUsed", 0)),
      monthlyLimit: formNumber(formData, "monthlyLimit", 0) || null,
      periodStart: adminDateInput(formData, "periodStart"),
      periodEnd: adminDateInput(formData, "periodEnd"),
      active: formBoolean(formData, "active")
    }
  });
  revalidateAdminPaths();
}

export async function updateAdminPurchaseStatus(purchaseUid: string, formData: FormData) {
  await requireAdmin();
  const status = formString(formData, "status");
  const nextStatus =
    status === "PAID"
      ? PurchaseStatus.PAID
      : status === "FAILED"
        ? PurchaseStatus.FAILED
        : status === "CANCELED"
          ? PurchaseStatus.CANCELED
          : status === "REFUNDED"
            ? PurchaseStatus.REFUNDED
            : PurchaseStatus.PENDING;

  await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.update({
      where: { uid: purchaseUid },
      data: {
        status: nextStatus,
        paidAt: nextStatus === PurchaseStatus.PAID ? new Date() : undefined
      },
      include: { plan: true, creditBalance: true }
    });

    if (nextStatus === PurchaseStatus.PAID && !purchase.creditBalance) {
      const now = new Date();
      await tx.creditBalance.create({
        data: {
          companyId: purchase.companyId,
          jobId: purchase.plan.jobScoped ? purchase.jobId : null,
          planId: purchase.planId,
          purchaseId: purchase.id,
          creditsPurchased: purchase.creditsPurchased,
          creditsUsed: 0,
          monthlyLimit: purchase.plan.monthly ? purchase.plan.credits : null,
          periodStart: purchase.plan.monthly ? now : null,
          periodEnd: purchase.plan.monthly ? new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()) : null,
          stripeSubscriptionId: purchase.stripeSubscriptionId,
          active: true
        }
      });
    }
  });
  revalidateAdminPaths();
}

export async function updateAdminInvitation(invitationUid: string, formData: FormData) {
  await requireAdmin();
  const status = formString(formData, "status");
  await prisma.evaluationInvitation.update({
    where: { uid: invitationUid },
    data: {
      status:
        status === "STARTED"
          ? InvitationStatus.STARTED
          : status === "COMPLETED"
            ? InvitationStatus.COMPLETED
            : status === "EXPIRED"
              ? InvitationStatus.EXPIRED
              : InvitationStatus.INVITED,
      candidateEmail: lower(formString(formData, "candidateEmail")),
      expiresAt: adminDateInput(formData, "expiresAt") ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
    }
  });
  revalidateAdminPaths();
}

export async function toggleAdminEvaluationArchive(evaluationUid: string) {
  await requireAdmin();
  const evaluation = await prisma.evaluation.findUniqueOrThrow({ where: { uid: evaluationUid } });
  await prisma.evaluation.update({
    where: { id: evaluation.id },
    data: { status: evaluation.status === "ARCHIVED" ? "GENERATED" : "ARCHIVED" }
  });
  revalidateAdminPaths();
  revalidatePath(`/admin/evaluations/${evaluationUid}`);
}
