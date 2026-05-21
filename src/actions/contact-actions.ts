"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendContactConfirmationEmail, sendContactRequestEmail } from "@/lib/email";
import { assertRateLimit } from "@/lib/rate-limit";
import { contactRequestSchema } from "@/lib/validators";

function field(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function asJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function submitContactRequest(formData: FormData) {
  const result = contactRequestSchema.safeParse({
    category: field(formData, "category"),
    firstName: field(formData, "firstName"),
    lastName: field(formData, "lastName"),
    email: field(formData, "email"),
    phone: field(formData, "phone"),
    organization: field(formData, "organization"),
    role: field(formData, "role"),
    subject: field(formData, "subject"),
    message: field(formData, "message"),
    recruitmentNeed: field(formData, "recruitmentNeed"),
    companySize: field(formData, "companySize"),
    candidateTopic: field(formData, "candidateTopic"),
    evaluationReference: field(formData, "evaluationReference"),
    partnershipType: field(formData, "partnershipType"),
    website: field(formData, "website"),
    mediaName: field(formData, "mediaName"),
    mediaDeadline: field(formData, "mediaDeadline"),
    privacyRequest: field(formData, "privacyRequest"),
    accountEmail: field(formData, "accountEmail"),
    technicalArea: field(formData, "technicalArea")
  });

  if (!result.success) {
    redirect("/contact?error=validation");
  }

  const parsed = result.data;
  try {
    assertRateLimit(`contact:${parsed.email.toLowerCase()}`, 4, 15 * 60_000);
  } catch {
    redirect("/contact?error=rate");
  }

  const details = [
    { label: "Fonction", value: parsed.role },
    { label: "Besoin recrutement", value: parsed.recruitmentNeed },
    { label: "Taille entreprise", value: parsed.companySize },
    { label: "Sujet candidat", value: parsed.candidateTopic },
    { label: "Référence évaluation", value: parsed.evaluationReference },
    { label: "Type de partenariat", value: parsed.partnershipType },
    { label: "Site web", value: parsed.website },
    { label: "Média", value: parsed.mediaName },
    { label: "Échéance presse", value: parsed.mediaDeadline },
    { label: "Demande données", value: parsed.privacyRequest },
    { label: "Email de compte concerné", value: parsed.accountEmail },
    { label: "Zone technique impactée", value: parsed.technicalArea }
  ].filter((detail) => detail.value);

  await prisma.contactRequest.create({
    data: {
      category: parsed.category,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email.toLowerCase(),
      phone: parsed.phone || null,
      organization: parsed.organization || null,
      subject: parsed.subject,
      message: parsed.message,
      detailsJson: asJson(details)
    }
  });

  await Promise.all([
    sendContactRequestEmail({
      ...parsed,
      email: parsed.email.toLowerCase(),
      details
    }),
    sendContactConfirmationEmail({
      firstName: parsed.firstName,
      email: parsed.email.toLowerCase(),
      subject: parsed.subject,
      category: parsed.category
    })
  ]);

  redirect("/contact?sent=1");
}
