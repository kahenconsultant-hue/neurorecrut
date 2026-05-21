import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/security";
import { CompatibilityScore } from "@/components/ui/compatibility-score";
import { formatDate } from "@/lib/format";

export default async function CompanyReportsPage() {
  const { company } = await requireCompanyUser();
  if (!company) redirect("/admin/reports");

  const reports = await prisma.analysisReport.findMany({
    where: { companyId: company.id },
    include: {
      candidate: true,
      job: true
    },
    orderBy: [{ createdAt: "desc" }, { matchingScore: "desc" }]
  });

  const averageMatching = reports.length
    ? Math.round(reports.reduce((sum, report) => sum + report.matchingScore, 0) / reports.length)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Rapports</h1>
        <p className="mt-1 text-gray-600">Tous les rapports d&apos;évaluation finalisés pour vos postes.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm text-gray-500">Rapports disponibles</p>
          <p className="mt-2 text-3xl font-bold text-ink">{reports.length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-gray-500">Matching moyen</p>
          <p className="mt-2 text-3xl font-bold text-ink">{averageMatching}/100</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-gray-500">Meilleur matching</p>
          <p className="mt-2 text-3xl font-bold text-ink">{reports[0] ? `${Math.round(Math.max(...reports.map((report) => report.matchingScore)))}/100` : "-"}</p>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-line p-5">
          <h2 className="font-semibold text-ink">Bibliothèque des rapports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="responsive-table">
            <thead className="bg-mist text-gray-500">
              <tr>
                <th className="px-5 py-3">Candidat</th>
                <th className="px-5 py-3">Poste</th>
                <th className="px-5 py-3">Matching</th>
                <th className="px-5 py-3">Compatibilité</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Rapport</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-t border-line">
                  <td className="px-5 py-3" data-label="Candidat">
                    <p className="font-semibold text-ink">{[report.candidate.firstName, report.candidate.lastName].filter(Boolean).join(" ") || report.candidate.email}</p>
                    <p className="text-xs text-gray-500">{report.candidate.email}</p>
                    <p className="font-mono text-xs text-gray-400">{report.code ?? report.uid}</p>
                  </td>
                  <td className="px-5 py-3" data-label="Poste">{report.job.title}</td>
                  <td className="px-5 py-3" data-label="Matching">{Math.round(report.matchingScore)}/100</td>
                  <td className="px-5 py-3" data-label="Compatibilité"><CompatibilityScore score={report.matchingScore} /></td>
                  <td className="px-5 py-3" data-label="Date">{formatDate(report.createdAt)}</td>
                  <td className="px-5 py-3" data-label="Rapport">
                    <Link className="font-semibold text-coral" href={`/company/reports/${report.uid}`}>Ouvrir</Link>
                  </td>
                </tr>
              ))}
              {reports.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-gray-500" colSpan={6}>Aucun rapport disponible pour le moment.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
