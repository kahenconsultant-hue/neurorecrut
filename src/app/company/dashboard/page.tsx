import Link from "next/link";
import { getCompanyDashboardData } from "@/actions/workflow";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatDate } from "@/lib/format";

export default async function CompanyDashboardPage() {
  const data = await getCompanyDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">Dashboard entreprise</h1>
          <p className="mt-1 text-gray-600">{data.company.name ?? "Profil entreprise à compléter"}</p>
        </div>
        <Link href="/company/jobs/new" className="btn-primary">
          Nouveau poste
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Postes" value={data.kpis.jobsCount} />
        <StatCard label="Évaluations complétées" value={data.kpis.completedEvaluations} />
        <StatCard label="Matching moyen" value={`${data.kpis.averageMatching}/100`} />
        <StatCard label="Crédits restants" value={data.credits.remaining} hint={`${data.credits.used}/${data.credits.purchased} utilisés`} />
      </div>
      <section className="panel overflow-hidden">
        <div className="border-b border-line p-5">
          <h2 className="font-semibold text-ink">Postes récents</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="responsive-table">
            <thead className="bg-mist text-gray-500">
              <tr>
                <th className="px-5 py-3">Poste</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Invitations</th>
                <th className="px-5 py-3">Rapports</th>
                <th className="px-5 py-3">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {data.jobs.map((job) => (
                <tr key={job.id} className="border-t border-line">
                  <td className="px-5 py-3" data-label="Poste">
                    <Link href={`/company/jobs/${job.uid}`} className="font-semibold text-ink hover:text-coral">
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3" data-label="Statut"><Badge value={job.status} /></td>
                  <td className="px-5 py-3" data-label="Invitations">{job.invitations.length}</td>
                  <td className="px-5 py-3" data-label="Rapports">{job.reports.length}</td>
                  <td className="px-5 py-3" data-label="Créé le">{formatDate(job.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
