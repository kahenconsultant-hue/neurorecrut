import Link from "next/link";
import { getAdminDashboardData } from "@/actions/workflow";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export default async function AdminJobsPage() {
  const data = await getAdminDashboardData();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Postes</h1>
        <p className="mt-2 text-sm text-gray-600">Tous les postes, codes candidats, profils cibles, évaluations et résultats par entreprise.</p>
      </div>
      <section className="panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-mist text-gray-500">
            <tr>
              <th className="px-5 py-3">Poste</th>
              <th className="px-5 py-3">Entreprise</th>
              <th className="px-5 py-3">Code candidat</th>
              <th className="px-5 py-3">Pipeline</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Créé</th>
            </tr>
          </thead>
          <tbody>
            {data.jobs.map((job) => (
              <tr key={job.id} className="border-t border-line">
                <td className="px-5 py-3">
                  <Link href={`/admin/jobs/${job.uid}`} className="font-semibold text-ink hover:text-coral">
                    {job.title}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/admin/companies/${job.company.uid}`} className="hover:text-coral">
                    {job.company.name ?? job.company.uid}
                  </Link>
                </td>
                <td className="px-5 py-3"><code className="font-mono text-xs">{job.uid}</code></td>
                <td className="px-5 py-3 text-xs text-gray-600">
                  {job.evaluations.length} eval · {job._count.invitations} invitations · {job._count.reports} rapports
                </td>
                <td className="px-5 py-3"><Badge value={job.status} /></td>
                <td className="px-5 py-3">{formatDate(job.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
