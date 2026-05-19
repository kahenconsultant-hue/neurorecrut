import { JobForm } from "@/components/company/job-form";
import { CompanyAccessDenied } from "@/components/company/company-access-denied";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/security";

export default async function EditJobPage({ params, searchParams }: { params: { jobUid: string }; searchParams?: { error?: string } }) {
  const { company } = await requireCompanyUser();
  const job = await prisma.jobPosition.findUniqueOrThrow({ where: { uid: params.jobUid } });
  if (job.companyId !== company?.id) return <CompanyAccessDenied />;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-3xl font-bold text-ink">Modifier le poste</h1>
      {searchParams?.error === "validation" ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Vérifiez les champs requis. Les textes doivent être suffisamment détaillés pour générer une évaluation fiable.
        </p>
      ) : null}
      <div className="panel p-6">
        <JobForm job={{ ...job, softSkillMatrix: job.softSkillMatrix as Record<string, number> }} />
      </div>
    </div>
  );
}
