import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(roles: Role[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    redirect("/");
  }
  return session;
}

export async function requireCompanyUser() {
  const session = await requireRole([Role.COMPANY, Role.ADMIN]);
  if (session.user.role === Role.ADMIN) {
    return { session, company: null };
  }
  if (!session.user.companyId) {
    redirect("/company/profile");
  }
  const company = await prisma.company.findUnique({ where: { id: session.user.companyId } });
  if (!company || company.status !== "ACTIVE") {
    redirect("/login");
  }
  return { session, company };
}

export async function requireAdmin() {
  return requireRole([Role.ADMIN]);
}

export async function requireCandidateUser() {
  const session = await requireRole([Role.CANDIDATE]);
  if (!session.user.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { candidate: true }
  });

  if (!user?.candidate) {
    redirect("/candidate/register");
  }

  return { session, candidate: user.candidate };
}

export async function assertCompanyAccess(companyId: string) {
  const session = await requireRole([Role.COMPANY, Role.ADMIN]);
  if (session.user.role !== Role.ADMIN && session.user.companyId !== companyId) {
    throw new Error("Accès refusé");
  }
  return session;
}
