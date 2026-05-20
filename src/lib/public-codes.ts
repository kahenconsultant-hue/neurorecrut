import type { Prisma } from "@prisma/client";

export const PUBLIC_CODE_CONFIG = {
  company: { prefix: "s", label: "Société" },
  candidate: { prefix: "c", label: "Candidat" },
  job: { prefix: "j", label: "Poste" },
  evaluation: { prefix: "e", label: "Évaluation" },
  report: { prefix: "r", label: "Rapport" }
} as const;

export type PublicCodeKey = keyof typeof PUBLIC_CODE_CONFIG;

export function formatPublicCode(key: PublicCodeKey, value: number) {
  return `${PUBLIC_CODE_CONFIG[key].prefix}${String(value).padStart(6, "0")}`;
}

export function parsePublicCodeNumber(key: PublicCodeKey, code: string | null | undefined) {
  const prefix = PUBLIC_CODE_CONFIG[key].prefix;
  const normalized = String(code ?? "").trim().toLowerCase();
  if (!normalized.startsWith(prefix)) return 0;
  const value = Number.parseInt(normalized.slice(prefix.length), 10);
  return Number.isFinite(value) ? value : 0;
}

export async function nextPublicCode(tx: Prisma.TransactionClient, key: PublicCodeKey) {
  const counter = await tx.publicIdCounter.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } }
  });

  return formatPublicCode(key, counter.value);
}

export function publicCodeOrUid(entity: { code?: string | null; uid: string }) {
  return entity.code ?? entity.uid;
}
