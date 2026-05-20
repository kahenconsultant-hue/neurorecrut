import Link from "next/link";
import { getAdminDashboardData } from "@/actions/workflow";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();
  const paidRevenue = data.purchases
    .filter((purchase) => purchase.status === "PAID")
    .reduce((sum, purchase) => sum + purchase.amountCents, 0);
  const creditsRemaining = data.creditBalances.reduce((sum, balance) => sum + balance.creditsPurchased - balance.creditsUsed, 0);
  const submittedResponses = data.responses.filter((response) => response.isSubmitted).length;
  const averageMatching =
    data.reports.length > 0
      ? Math.round(data.reports.reduce((sum, report) => sum + report.matchingScore, 0) / data.reports.length)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-coral">Console plateforme</p>
        <h1 className="text-3xl font-bold text-ink">Admin NeuroRecrut</h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600">
          Pilotage global des entreprises, candidats, postes, évaluations, réponses, abonnements, crédits et rapports RH.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Entreprises" value={data.companies.length} />
        <StatCard label="Postes" value={data.jobs.length} />
        <StatCard label="Candidats" value={data.candidates.length} />
        <StatCard label="Réponses soumises" value={submittedResponses} />
        <StatCard label="Rapports" value={data.reports.length} />
        <StatCard label="Matching moyen" value={`${averageMatching}/100`} />
        <StatCard label="Crédits restants" value={creditsRemaining} />
        <StatCard label="CA payé" value={formatCurrency(paidRevenue)} />
      </div>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="panel p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-ink">Dernières entreprises</h2>
            <Link href="/admin/companies" className="text-sm font-semibold text-coral">Tout voir</Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="responsive-table">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-2">Entreprise</th>
                  <th className="py-2">Postes</th>
                  <th className="py-2">Rapports</th>
                  <th className="py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.companies.slice(0, 6).map((company) => (
                  <tr key={company.id} className="border-t border-line">
                    <td className="py-3" data-label="Entreprise">
                      <Link href={`/admin/companies/${company.uid}`} className="font-semibold text-ink hover:text-coral">
                        {company.name ?? company.uid}
                      </Link>
                      <p className="text-xs text-gray-500">{company.ownerEmail ?? company.hrContactEmail ?? "-"}</p>
                      <p className="font-mono text-xs text-gray-400">{company.code ?? company.uid}</p>
                    </td>
                    <td className="py-3" data-label="Postes">{company._count.jobs}</td>
                    <td className="py-3" data-label="Rapports">{company._count.reports}</td>
                    <td className="py-3" data-label="Statut"><Badge value={company.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="font-semibold text-ink">Alertes opérationnelles</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Link href="/admin/purchases" className="block rounded-md border border-line p-3 hover:bg-mist">
              <span className="font-semibold text-ink">{data.purchases.filter((purchase) => purchase.status === "PENDING").length}</span>
              <span className="ml-2 text-gray-600">achats en attente</span>
            </Link>
            <Link href="/admin/evaluations" className="block rounded-md border border-line p-3 hover:bg-mist">
              <span className="font-semibold text-ink">{data.evaluations.filter((evaluation) => evaluation.status === "GENERATED").length}</span>
              <span className="ml-2 text-gray-600">évaluations actives</span>
            </Link>
            <Link href="/admin/ai-logs" className="block rounded-md border border-line p-3 hover:bg-mist">
              <span className="font-semibold text-ink">{data.aiLogs.filter((log) => log.status === "ERROR").length}</span>
              <span className="ml-2 text-gray-600">erreurs IA récentes</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-semibold text-ink">Derniers rapports générés</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="responsive-table">
            <thead className="bg-mist text-gray-500">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Entreprise</th>
                <th className="px-5 py-3">Poste</th>
                <th className="px-5 py-3">Candidat</th>
                <th className="px-5 py-3">Matching</th>
                <th className="px-5 py-3">Risque</th>
              </tr>
            </thead>
            <tbody>
              {data.reports.slice(0, 8).map((report) => (
                <tr key={report.id} className="border-t border-line">
                  <td className="px-5 py-3" data-label="Date">{formatDate(report.createdAt)}</td>
                  <td className="px-5 py-3" data-label="Entreprise">{report.company.name ?? report.company.uid}</td>
                  <td className="px-5 py-3" data-label="Poste">{report.job.title}</td>
                  <td className="px-5 py-3" data-label="Candidat">
                    <Link href={`/admin/reports/${report.uid}`} className="font-semibold text-ink hover:text-coral">
                      {report.candidate.email}
                    </Link>
                    <p className="font-mono text-xs text-gray-400">{report.code ?? report.uid}</p>
                  </td>
                  <td className="px-5 py-3" data-label="Matching">{Math.round(report.matchingScore)}/100</td>
                  <td className="px-5 py-3" data-label="Risque"><Badge value={report.riskLevel} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
