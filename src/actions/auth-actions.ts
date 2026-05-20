"use server";

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sendCandidateWelcomeEmail, sendCompanyWelcomeEmail } from "@/lib/email";
import { nextPublicCode } from "@/lib/public-codes";
import { candidateRegisterSchema, companyProfileSchema, registerSchema } from "@/lib/validators";

function formText(formData: FormData, key: string) {
  const selectedValues = formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
  const customValue = String(formData.get(`${key}Other`) ?? "").trim();
  return Array.from(new Set([...selectedValues, customValue].filter(Boolean))).join("\n");
}

function hasPasswordMismatch(result: ReturnType<typeof registerSchema.safeParse> | ReturnType<typeof candidateRegisterSchema.safeParse>) {
  return !result.success && result.error.issues.some((issue) => issue.path.includes("confirmPassword"));
}

function accepted(formData: FormData, key: string) {
  return formData.get(key) === "yes" || formData.get(key) === "on";
}

function normalizeCompanyName(value: string | null | undefined) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSiren(value: string | null | undefined) {
  return String(value ?? "").replace(/\D/g, "");
}

export async function registerCompanyUser(_: unknown, formData: FormData) {
  const accountResult = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });
  const profileResult = companyProfileSchema.safeParse({
    name: formText(formData, "companyName"),
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

  if (!accountResult.success || !profileResult.success) {
    if (hasPasswordMismatch(accountResult)) {
      redirect("/register?error=password_mismatch");
    }
    redirect("/register?error=validation");
  }

  if (!accepted(formData, "acceptCompanyLegal")) {
    redirect("/register?error=legal");
  }

  const parsed = accountResult.data;
  const profile = profileResult.data;

  const email = parsed.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } }).catch(() => null);
  if (existing) {
    redirect("/register?error=exists");
  }

  const companyNameKey = normalizeCompanyName(profile.name);
  const sirenKey = normalizeSiren(profile.siretSiren);
  const existingCompanies = await prisma.company.findMany({
    select: { name: true, siretSiren: true }
  });
  const duplicateCompany = existingCompanies.some((company) => {
    return normalizeCompanyName(company.name) === companyNameKey || normalizeSiren(company.siretSiren) === sirenKey;
  });
  if (duplicateCompany) {
    redirect("/register?error=duplicate_company");
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.password, 12);

    const company = await prisma.$transaction(async (tx) => {
      const code = await nextPublicCode(tx, "company");
      const createdCompany = await tx.company.create({
        data: {
          code,
          ...profile,
          website: profile.website || null,
          ownerEmail: email,
          hrContactEmail: profile.hrContactEmail.toLowerCase()
        }
      });

      await tx.user.create({
        data: {
          email,
          name: parsed.name,
          passwordHash,
          role: Role.COMPANY,
          companyId: createdCompany.id
        }
      });

      await tx.creditBalance.create({
        data: {
          companyId: createdCompany.id,
          creditsPurchased: 1,
          creditsUsed: 0,
          active: true,
          periodStart: new Date()
        }
      });

      return createdCompany;
    });

    await sendCompanyWelcomeEmail({
      to: [email, company.hrContactEmail],
      name: parsed.name,
      companyName: company.name
    });
  } catch {
    redirect("/register?error=database");
  }

  redirect("/login?registered=1");
}

export async function registerCandidateUser(_: unknown, formData: FormData) {
  const result = candidateRegisterSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });
  if (!result.success) {
    if (hasPasswordMismatch(result)) {
      redirect("/candidate/register?error=password_mismatch");
    }
    redirect("/candidate/register?error=validation");
  }

  if (!accepted(formData, "acceptCandidateLegal")) {
    redirect("/candidate/register?error=legal");
  }
  const parsed = result.data;

  const email = parsed.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } }).catch(() => null);
  if (existing) {
    redirect("/candidate/register?error=exists");
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.password, 12);
    const candidate = await prisma.$transaction(async (tx) => {
      const code = await nextPublicCode(tx, "candidate");
      const createdCandidate = await tx.candidate.create({
        data: {
          code,
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          email
        }
      });

      await tx.user.create({
        data: {
          email,
          name: `${parsed.firstName} ${parsed.lastName}`,
          passwordHash,
          role: Role.CANDIDATE,
          candidateId: createdCandidate.id
        }
      });

      return createdCandidate;
    });

    await sendCandidateWelcomeEmail({
      to: email,
      firstName: parsed.firstName
    });
  } catch {
    redirect("/candidate/register?error=database");
  }

  redirect("/login?registered=1&role=candidate");
}
