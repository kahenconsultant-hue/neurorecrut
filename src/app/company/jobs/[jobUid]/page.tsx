import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/security";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { CompanyAccessDenied } from "@/components/company/company-access-denied";

export default async function JobDetailPage({ params }: { params: { jobUid: string } }) {
  const { company } = await requireCompanyUser();
  const job = await prisma.jobPosition.findUniqueOrThrow({
    where: { uid: params.jobUid },
    include: { evaluations: true, invitations: true, reports: true, creditBalances: true }
  });
  if (job.companyId !== company?.id) return <CompanyAccessDenied />;
  const usableCredits = await prisma.creditBalance.findMany({
    where: {
      companyId: job.companyId,
      active: true,
      OR: [{ periodEnd: null }, { periodEnd: { gt: new Date() } }],
      AND: [
        { OR: [{ jobId: job.id }, { jobId: null }] }
      ]
    }
  });
  const credits = usableCredits.reduce((sum, item) => sum + item.creditsPurchased - item.creditsUsed, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2"><Badge value={job.status} /></div>
          <p className="mb-2 font-mono text-xs text-gray-500">{job.code ?? job.uid}</p>
          <h1 className="text-3xl font-bold text-ink">{job.title}</h1>
          <p className="mt-2 max-w-3xl text-gray-600">{job.description}</p>
        </div>
        <Link href={`/company/jobs/${job.uid}/edit`} className="btn-secondary">Modifier</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Code évaluation" value={job.code ?? job.uid} />
        <StatCard label="Crédits utilisables" value={credits} />
        <StatCard label="Évaluations" value={job.evaluations.length} />
        <StatCard label="Invitations" value={job.invitations.length} />
        <StatCard label="Rapports" value={job.reports.length} />
      </div>
      {job.reportingLine ? (
        <section className="panel p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Circuit de reporting</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{job.reportingLine}</p>
        </section>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Profil cible", `/company/jobs/${job.uid}/target-profile`, "Générer ou consulter les attentes structurées."],
          ["Facturation", `/company/jobs/${job.uid}/billing`, "Acheter des crédits liés au poste."],
          ["Évaluation", `/company/jobs/${job.uid}/evaluation`, "Générer le formulaire interne."],
          ["Inviter", `/company/jobs/${job.uid}/invite`, "Créer un lien candidat sécurisé."],
          ["Candidats", `/company/jobs/${job.uid}/candidates`, "Suivre les statuts et rapports."],
          ["Comparaison", `/company/jobs/${job.uid}/comparison`, "Comparer les scores et risques."]
        ].map(([title, href, text]) => (
          <Link href={href} key={href} className="panel p-5 hover:shadow-lg">
            <h2 className="font-semibold text-ink">{title}</h2>
            <p className="mt-2 text-sm text-gray-600">{text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
