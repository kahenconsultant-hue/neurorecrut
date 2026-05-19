import Link from "next/link";
import { getAdminDashboardData } from "@/actions/workflow";
import { Badge } from "@/components/ui/badge";

export default async function AdminReportsPage() {
  const data = await getAdminDashboardData();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-ink">Rapports</h1>
      <section className="panel overflow-hidden">
        <table className="w-full text-left text-sm">
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
            {data.reports.map((report) => (
              <tr key={report.id} className="border-t border-line">
                <td className="px-5 py-3"><Link href={`/admin/companies/${report.company.uid}`} className="hover:text-coral">{report.company.name ?? report.company.uid}</Link></td>
                <td className="px-5 py-3"><Link href={`/admin/jobs/${report.job.uid}`} className="hover:text-coral">{report.job.title}</Link></td>
                <td className="px-5 py-3"><Link href={`/admin/candidates/${report.candidate.uid}`} className="font-semibold text-ink hover:text-coral">{report.candidate.email}</Link></td>
                <td className="px-5 py-3">{Math.round(report.globalScore)}/100</td>
                <td className="px-5 py-3">{Math.round(report.matchingScore)}/100</td>
                <td className="px-5 py-3"><Badge value={report.riskLevel} /></td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-3">
                    <Link className="text-coral" href={`/admin/reports/${report.uid}`}>Admin</Link>
                    <Link className="text-coral" href={`/company/reports/${report.uid}`}>Vue société</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
