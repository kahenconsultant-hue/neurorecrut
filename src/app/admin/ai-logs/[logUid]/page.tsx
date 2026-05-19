import Link from "next/link";
import { getAdminAiLogDetail } from "@/actions/workflow";
import { AdminJsonBlock, AdminMetaGrid } from "@/components/admin/admin-json";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export default async function AdminAiLogDetailPage({ params }: { params: { logUid: string } }) {
  const log = await getAdminAiLogDetail(params.logUid);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-gray-500">{log.uid}</p>
        <h1 className="text-3xl font-bold text-ink">Log IA</h1>
        <p className="mt-2 text-sm text-gray-600">{log.purpose} · {log.model}</p>
      </div>

      <AdminMetaGrid
        items={[
          ["Statut", <Badge key="status" value={log.status} />],
          ["Date", formatDate(log.createdAt)],
          ["Latence", log.latencyMs ? `${log.latencyMs} ms` : "-"],
          ["Entreprise", log.company ? <Link key="company" href={`/admin/companies/${log.company.uid}`} className="text-coral">{log.company.name ?? log.company.uid}</Link> : "-"],
          ["Poste", log.job ? <Link key="job" href={`/admin/jobs/${log.job.uid}`} className="text-coral">{log.job.title}</Link> : "-"],
          ["Réponse", log.response ? <Link key="response" href={`/admin/responses/${log.response.uid}`} className="text-coral">{log.response.uid}</Link> : "-"],
          ["Erreur", log.error ?? "-"],
          ["Usage", log.purpose]
        ]}
      />

      <section className="panel p-5">
        <h2 className="font-semibold text-ink">Prompt envoyé</h2>
        <pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap text-xs leading-5 text-graphite">{log.prompt}</pre>
      </section>

      <AdminJsonBlock title="Request JSON" data={log.requestJson} defaultOpen />
      <AdminJsonBlock title="Response JSON" data={log.responseJson} />
    </div>
  );
}
