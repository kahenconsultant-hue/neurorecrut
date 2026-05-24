import { z } from "zod";
import { SOFT_SKILLS } from "@/lib/constants";

const passwordConfirmationSchema = z
  .object({
    password: z.string().min(8, "8 caractères minimum"),
    confirmPassword: z.string().min(8, "Confirmation requise")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"]
  });

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide")
  })
  .and(passwordConfirmationSchema);

export const candidateRegisterSchema = z
  .object({
    firstName: z.string().min(1, "Prénom requis"),
    lastName: z.string().min(1, "Nom requis"),
    email: z.string().email("Email invalide")
  })
  .and(passwordConfirmationSchema);

export const companyProfileSchema = z.object({
  name: z.string().min(2),
  siretSiren: z.string().min(9),
  sector: z.string().min(2),
  size: z.string().min(1),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().min(3),
  hrContactName: z.string().min(2),
  hrContactEmail: z.string().email(),
  culture: z.string().min(10),
  values: z.string().min(5),
  managementStyle: z.string().min(5),
  teamWorkingStyle: z.string().min(5),
  workEnvironment: z.string().min(10)
});

const softSkillMatrixShape = Object.fromEntries(
  SOFT_SKILLS.map((skill) => [skill, z.coerce.number().int().min(0).max(5)])
) as Record<(typeof SOFT_SKILLS)[number], z.ZodNumber>;

export const jobPositionSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(20),
  mainMissions: z.string().min(10),
  hardSkillsRequired: z.string().min(5),
  seniorityLevel: z.string().min(1),
  contractType: z.string().min(1),
  location: z.string().min(2),
  workMode: z.string().min(1),
  teamContext: z.string().min(5),
  managerProfile: z.string().min(5),
  reportingLine: z.string().min(1),
  managementStyle: z.string().min(5),
  workRhythm: z.string().min(5),
  mainConstraints: z.string().min(5),
  expectedPerformanceIndicators: z.string().min(5),
  companySpecificExpectations: z.string().min(5),
  softSkillMatrix: z.object(softSkillMatrixShape)
});

export const inviteCandidateSchema = z.object({
  candidateEmail: z.string().email()
});

export const candidateProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6).optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  cvUrl: z.string().url().optional().or(z.literal("")),
  currentRole: z.string().min(1),
  experienceYears: z.coerce.number().int().min(0).max(60),
  education: z.string().min(1),
  availability: z.string().min(1),
  mobility: z.string().min(1),
  salaryExpectations: z.string().optional(),
  motivation: z.string().optional(),
  workPreferences: z.string().min(1)
});

export const candidateResumeSchema = candidateProfileSchema.extend({
  headline: z.string().optional(),
  professionalSummary: z.string().optional(),
  keySkills: z.string().optional(),
  technicalSkills: z.string().optional(),
  languages: z.string().optional(),
  experienceJson: z.string().optional(),
  educationJson: z.string().optional(),
  certifications: z.string().optional(),
  projects: z.string().optional(),
  achievements: z.string().optional(),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  references: z.string().optional()
});

export const evaluationAccessCodeSchema = z.object({
  accessCode: z.string().min(8).max(80)
});

export const draftAnswerSchema = z.object({
  answers: z.array(
    z.object({
      question_uid: z.string(),
      type: z.enum(["QCM", "FORCED_CHOICE", "OPEN", "ROLE_PLAY", "LIKERT_CONTEXTUAL"]),
      selected_choice_uid: z.string().optional(),
      text_answer: z.string().optional(),
      answered_at: z.string()
    })
  )
});

const optionalText = z.string().trim().optional().or(z.literal(""));

export const contactRequestSchema = z
  .object({
    category: z.enum(["COMPANY", "CANDIDATE", "PARTNERSHIP", "PRESS", "DATA_PRIVACY", "TECHNICAL", "OTHER"]),
    firstName: z.string().trim().min(1, "Prénom requis"),
    lastName: z.string().trim().min(1, "Nom requis"),
    email: z.string().trim().email("Email invalide"),
    phone: optionalText,
    organization: optionalText,
    role: optionalText,
    subject: z.string().trim().min(4, "Objet requis"),
    message: z.string().trim().min(20, "Précisez votre demande"),
    recruitmentNeed: optionalText,
    companySize: optionalText,
    candidateTopic: optionalText,
    evaluationReference: optionalText,
    partnershipType: optionalText,
    website: z.string().trim().url("URL invalide").optional().or(z.literal("")),
    mediaName: optionalText,
    mediaDeadline: optionalText,
    privacyRequest: optionalText,
    accountEmail: z.string().trim().email("Email de compte invalide").optional().or(z.literal("")),
    technicalArea: optionalText
  })
  .superRefine((data, ctx) => {
    if (data.category === "COMPANY" && !data.organization) {
      ctx.addIssue({ code: "custom", path: ["organization"], message: "Nom de l'entreprise requis" });
    }
    if (data.category === "CANDIDATE" && !data.candidateTopic) {
      ctx.addIssue({ code: "custom", path: ["candidateTopic"], message: "Sujet candidat requis" });
    }
    if (data.category === "PARTNERSHIP" && (!data.organization || !data.partnershipType)) {
      ctx.addIssue({ code: "custom", path: ["partnershipType"], message: "Organisation et type de partenariat requis" });
    }
    if (data.category === "PRESS" && (!data.mediaName || !data.mediaDeadline)) {
      ctx.addIssue({ code: "custom", path: ["mediaName"], message: "Média et échéance requis" });
    }
    if (data.category === "DATA_PRIVACY" && !data.privacyRequest) {
      ctx.addIssue({ code: "custom", path: ["privacyRequest"], message: "Type de demande requis" });
    }
    if (data.category === "TECHNICAL" && (!data.accountEmail || !data.technicalArea)) {
      ctx.addIssue({ code: "custom", path: ["technicalArea"], message: "Compte et zone impactée requis" });
    }
  });

export const supportTicketSchema = z.object({
  category: z.enum([
    "EVALUATION",
    "CANDIDATE_INVITATION",
    "REPORT",
    "BILLING",
    "ACCOUNT_ACCESS",
    "DATA_PRIVACY",
    "TECHNICAL",
    "FEATURE_REQUEST",
    "OTHER"
  ]),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  subject: z.string().trim().min(5).max(180),
  message: z.string().trim().min(20).max(6000),
  jobUid: optionalText,
  impact: optionalText,
  relatedUrl: z.string().trim().url("URL invalide").optional().or(z.literal(""))
});

export const supportReplySchema = z.object({
  message: z.string().trim().min(2).max(6000)
});

export const supportTicketAdminSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_COMPANY", "RESOLVED", "CLOSED"]),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"])
});
