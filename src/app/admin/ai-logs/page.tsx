import Link from "next/link";
import { getAdminDashboardData } from "@/actions/workflow";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export default async function AdminAiLogsPage() {
  const data = await getAdminDashboardData();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-ink">Logs IA</h1>
      <section className="panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-mist text-gray-500">
            <tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Usage</th><th className="px-5 py-3">Contexte</th><th className="px-5 py-3">Statut</th><th className="px-5 py-3">Modèle</th><th className="px-5 py-3">Erreur</th><th className="px-5 py-3">Détail</th></tr>
          </thead>
          <tbody>
            {data.aiLogs.map((log) => (
              <tr key={log.id} className="border-t border-line">
                <td className="px-5 py-3">{formatDate(log.createdAt)}</td>
                <td className="px-5 py-3">{log.purpose}</td>
                <td className="px-5 py-3 text-xs text-gray-600">
                  {log.company ? <Link href={`/admin/companies/${log.company.uid}`} className="hover:text-coral">{log.company.name ?? log.company.uid}</Link> : "-"}
                  {log.job ? <span> · <Link href={`/admin/jobs/${log.job.uid}`} className="hover:text-coral">{log.job.title}</Link></span> : null}
                </td>
                <td className="px-5 py-3"><Badge value={log.status} /></td>
                <td className="px-5 py-3">{log.model}</td>
                <td className="px-5 py-3">{log.error ?? "-"}</td>
                <td className="px-5 py-3"><Link href={`/admin/ai-logs/${log.uid}`} className="font-semibold text-coral">Ouvrir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
