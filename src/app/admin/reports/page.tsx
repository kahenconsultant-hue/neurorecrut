import Link from "next/link";
import { getAdminDashboardData } from "@/actions/workflow";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { Badge } from "@/components/ui/badge";
import { getParam, matchesDateRange, matchesQuery, matchesSelect, uniqueOptions, type AdminSearchParams } from "@/lib/admin-filters";

export default async function AdminReportsPage({ searchParams }: { searchParams?: AdminSearchParams }) {
  const data = await getAdminDashboardData();
  const filteredReports = data.reports.filter((report) => {
    return (
      matchesQuery(getParam(searchParams, "q"), [
        report.uid,
        report.code,
        report.company.name,
        report.job.title,
        report.job.code,
        report.evaluation.code,
        report.candidate.code,
        report.candidate.email,
        report.candidate.firstName,
        report.candidate.lastName,
        report.recommendation
      ]) &&
      matchesSelect(getParam(searchParams, "company"), report.company.name ?? report.company.uid) &&
      matchesSelect(getParam(searchParams, "risk"), report.riskLevel) &&
      matchesDateRange(report.createdAt, getParam(searchParams, "from"), getParam(searchParams, "to"))
    );
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-ink">Rapports</h1>

      <AdminFilterBar
        searchParams={searchParams}
        resetHref="/admin/reports"
        totalCount={data.reports.length}
        resultCount={filteredReports.length}
        placeholder="Entreprise, poste, candidat, recommandation..."
        selects={[
          { name: "company", label: "Entreprise", options: uniqueOptions(data.reports.map((report) => report.company.name ?? report.company.uid)) },
          { name: "risk", label: "Risque", options: uniqueOptions(data.reports.map((report) => report.riskLevel)) }
        ]}
      />

      <section className="panel overflow-hidden">
        <table className="responsive-table">
          <thead className="bg-mist text-gray-500">
            <tr>
              <th className="px-5 py-3">Entreprise</th>
              <th className="px-5 py-3">Poste</th>
              <th className="px-5 py-3">Candidat</th>
              <th className="px-5 py-3">Global</th>
              <th className="px-5 py-3">Matching</th>
              <th className="px-5 py-3">Risque</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id} className="border-t border-line">
                <td className="px-5 py-3" data-label="Entreprise"><Link href={`/admin/companies/${report.company.uid}`} className="hover:text-coral">{report.company.name ?? report.company.uid}</Link></td>
                <td className="px-5 py-3" data-label="Poste"><Link href={`/admin/jobs/${report.job.uid}`} className="hover:text-coral">{report.job.title}</Link></td>
                <td className="px-5 py-3" data-label="Candidat">
                  <Link href={`/admin/candidates/${report.candidate.uid}`} className="font-semibold text-ink hover:text-coral">{report.candidate.email}</Link>
                  <p className="font-mono text-xs text-gray-400">{report.code ?? report.uid}</p>
                </td>
                <td className="px-5 py-3" data-label="Global">{Math.round(report.globalScore)}/100</td>
                <td className="px-5 py-3" data-label="Matching">{Math.round(report.matchingScore)}/100</td>
                <td className="px-5 py-3" data-label="Risque"><Badge value={report.riskLevel} /></td>
                <td className="px-5 py-3" data-label="Actions">
                  <div className="flex flex-wrap gap-3">
                    <Link className="text-coral" href={`/admin/reports/${report.uid}`}>Admin</Link>
                    <Link className="text-coral" href={`/company/reports/${report.uid}`}>Vue société</Link>
                  </div>
                </td>
              </tr>
            ))}
            {filteredReports.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-sm text-gray-500" colSpan={7}>Aucun rapport ne correspond aux filtres.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
