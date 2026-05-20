import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/security";
import { Badge } from "@/components/ui/badge";

export default async function JobsPage() {
  const { company } = await requireCompanyUser();
  const jobs = await prisma.jobPosition.findMany({
    where: { companyId: company?.id },
    include: { evaluations: true, invitations: true, reports: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">Postes</h1>
          <p className="mt-1 text-gray-600">Créez des postes sans limite; les crédits sont consommés à la soumission candidat.</p>
        </div>
        <Link href="/company/jobs/new" className="btn-primary">Créer un poste</Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {jobs.map((job) => (
          <Link href={`/company/jobs/${job.uid}`} key={job.id} className="panel block p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-gray-500">{job.code ?? job.uid}</p>
                <h2 className="text-lg font-semibold text-ink">{job.title}</h2>
              </div>
              <Badge value={job.status} />
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-gray-600">{job.description}</p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <div><span className="font-semibold">{job.evaluations.length}</span><p className="text-gray-500">Évaluation</p></div>
              <div><span className="font-semibold">{job.invitations.length}</span><p className="text-gray-500">Invitations</p></div>
              <div><span className="font-semibold">{job.reports.length}</span><p className="text-gray-500">Rapports</p></div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
