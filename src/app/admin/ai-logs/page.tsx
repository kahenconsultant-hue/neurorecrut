import Link from "next/link";
import { getAdminDashboardData } from "@/actions/workflow";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { Badge } from "@/components/ui/badge";
import { getParam, matchesDateRange, matchesQuery, matchesSelect, type AdminSearchParams, uniqueOptions } from "@/lib/admin-filters";
import { formatDate } from "@/lib/format";

export default async function AdminAiLogsPage({ searchParams }: { searchParams?: AdminSearchParams }) {
  const data = await getAdminDashboardData();
  const filteredLogs = data.aiLogs.filter((log) => {
    return (
      matchesQuery(getParam(searchParams, "q"), [
        log.uid,
        log.purpose,
        log.status,
        log.model,
        log.error,
        log.company?.name,
        log.company?.code,
        log.company?.uid,
        log.job?.title,
        log.job?.code,
        log.response?.uid
      ]) &&
      matchesSelect(getParam(searchParams, "company"), log.company?.name ?? "-") &&
      matchesSelect(getParam(searchParams, "status"), log.status) &&
      matchesSelect(getParam(searchParams, "purpose"), log.purpose) &&
      matchesDateRange(log.createdAt, getParam(searchParams, "from"), getParam(searchParams, "to"))
    );
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-ink">Logs IA</h1>

      <AdminFilterBar
        searchParams={searchParams}
        resetHref="/admin/ai-logs"
        totalCount={data.aiLogs.length}
        resultCount={filteredLogs.length}
        placeholder="Usage, entreprise, poste, modèle, erreur..."
        selects={[
          { name: "company", label: "Entreprise", options: uniqueOptions(data.aiLogs.map((log) => log.company?.name ?? "-")) },
          { name: "status", label: "Statut", options: uniqueOptions(data.aiLogs.map((log) => log.status)) },
          { name: "purpose", label: "Usage", options: uniqueOptions(data.aiLogs.map((log) => log.purpose)) }
        ]}
      />

      <section className="panel overflow-hidden">
        <table className="responsive-table">
          <thead className="bg-mist text-gray-500">
            <tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Usage</th><th className="px-5 py-3">Contexte</th><th className="px-5 py-3">Statut</th><th className="px-5 py-3">Modèle</th><th className="px-5 py-3">Erreur</th><th className="px-5 py-3">Détail</th></tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-t border-line">
                <td className="px-5 py-3" data-label="Date">{formatDate(log.createdAt)}</td>
                <td className="px-5 py-3" data-label="Usage">{log.purpose}</td>
                <td className="px-5 py-3 text-xs text-gray-600" data-label="Contexte">
                  {log.company ? <Link href={`/admin/companies/${log.company.uid}`} className="hover:text-coral">{log.company.name ?? log.company.uid}</Link> : "-"}
                  {log.job ? <span> · <Link href={`/admin/jobs/${log.job.uid}`} className="hover:text-coral">{log.job.title}</Link></span> : null}
                </td>
                <td className="px-5 py-3" data-label="Statut"><Badge value={log.status} /></td>
                <td className="px-5 py-3" data-label="Modèle">{log.model}</td>
                <td className="px-5 py-3" data-label="Erreur">{log.error ?? "-"}</td>
                <td className="px-5 py-3" data-label="Détail"><Link href={`/admin/ai-logs/${log.uid}`} className="font-semibold text-coral">Ouvrir</Link></td>
              </tr>
            ))}
            {filteredLogs.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-sm text-gray-500" colSpan={7}>Aucun log IA ne correspond aux filtres.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
