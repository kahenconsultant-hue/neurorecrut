import Link from "next/link";
import { getAdminDashboardData } from "@/actions/workflow";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { Badge } from "@/components/ui/badge";
import { getParam, matchesDateRange, matchesQuery, matchesSelect, type AdminSearchParams, uniqueOptions } from "@/lib/admin-filters";
import { formatDate } from "@/lib/format";

export default async function AdminEvaluationsPage({ searchParams }: { searchParams?: AdminSearchParams }) {
  const data = await getAdminDashboardData();
  const filteredEvaluations = data.evaluations.filter((evaluation) => {
    return (
      matchesQuery(getParam(searchParams, "q"), [
        evaluation.uid,
        evaluation.version,
        evaluation.job.title,
        evaluation.company.name,
        evaluation.company.uid
      ]) &&
      matchesSelect(getParam(searchParams, "company"), evaluation.company.name ?? evaluation.company.uid) &&
      matchesSelect(getParam(searchParams, "status"), evaluation.status) &&
      matchesDateRange(evaluation.createdAt, getParam(searchParams, "from"), getParam(searchParams, "to"))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Évaluations</h1>
        <p className="mt-2 text-sm text-gray-600">Consultation des tests générés, JSON brut, invitations, réponses et rapports liés.</p>
      </div>

      <AdminFilterBar
        searchParams={searchParams}
        resetHref="/admin/evaluations"
        totalCount={data.evaluations.length}
        resultCount={filteredEvaluations.length}
        placeholder="Évaluation, poste, entreprise..."
        selects={[
          { name: "company", label: "Entreprise", options: uniqueOptions(data.evaluations.map((evaluation) => evaluation.company.name ?? evaluation.company.uid)) },
          { name: "status", label: "Statut", options: uniqueOptions(data.evaluations.map((evaluation) => evaluation.status)) }
        ]}
      />

      <section className="panel overflow-hidden">
        <table className="responsive-table">
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
            {filteredEvaluations.map((evaluation) => (
              <tr key={evaluation.id} className="border-t border-line">
                <td className="px-5 py-3" data-label="Évaluation">
                  <Link href={`/admin/evaluations/${evaluation.uid}`} className="font-semibold text-ink hover:text-coral">
                    {evaluation.version}
                  </Link>
                  <p className="mt-1 font-mono text-xs text-gray-500">{evaluation.uid}</p>
                </td>
                <td className="px-5 py-3" data-label="Poste"><Link href={`/admin/jobs/${evaluation.job.uid}`} className="hover:text-coral">{evaluation.job.title}</Link></td>
                <td className="px-5 py-3" data-label="Entreprise"><Link href={`/admin/companies/${evaluation.company.uid}`} className="hover:text-coral">{evaluation.company.name ?? evaluation.company.uid}</Link></td>
                <td className="px-5 py-3 text-xs text-gray-600" data-label="Usage">
                  {evaluation._count.invitations} invitations · {evaluation._count.responses} réponses · {evaluation._count.reports} rapports
                </td>
                <td className="px-5 py-3" data-label="Statut"><Badge value={evaluation.status} /></td>
                <td className="px-5 py-3" data-label="Date">{formatDate(evaluation.createdAt)}</td>
              </tr>
            ))}
            {filteredEvaluations.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-sm text-gray-500" colSpan={6}>Aucune évaluation ne correspond aux filtres.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
