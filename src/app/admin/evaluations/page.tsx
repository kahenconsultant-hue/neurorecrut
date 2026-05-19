import Link from "next/link";
import { getAdminDashboardData } from "@/actions/workflow";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export default async function AdminEvaluationsPage() {
  const data = await getAdminDashboardData();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Évaluations</h1>
        <p className="mt-2 text-sm text-gray-600">Consultation des tests générés, JSON brut, invitations, réponses et rapports liés.</p>
      </div>
      <section className="panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-mist text-gray-500">
            <tr>
              <th className="px-5 py-3">Évaluation</th>
              <th className="px-5 py-3">Poste</th>
              <th className="px-5 py-3">Entreprise</th>
              <th className="px-5 py-3">Usage</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.evaluations.map((evaluation) => (
              <tr key={evaluation.id} className="border-t border-line">
                <td className="px-5 py-3">
                  <Link href={`/admin/evaluations/${evaluation.uid}`} className="font-semibold text-ink hover:text-coral">
                    {evaluation.version}
                  </Link>
                  <p className="mt-1 font-mono text-xs text-gray-500">{evaluation.uid}</p>
                </td>
                <td className="px-5 py-3"><Link href={`/admin/jobs/${evaluation.job.uid}`} className="hover:text-coral">{evaluation.job.title}</Link></td>
                <td className="px-5 py-3"><Link href={`/admin/companies/${evaluation.company.uid}`} className="hover:text-coral">{evaluation.company.name ?? evaluation.company.uid}</Link></td>
                <td className="px-5 py-3 text-xs text-gray-600">
                  {evaluation._count.invitations} invitations · {evaluation._count.responses} réponses · {evaluation._count.reports} rapports
                </td>
                <td className="px-5 py-3"><Badge value={evaluation.status} /></td>
                <td className="px-5 py-3">{formatDate(evaluation.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
