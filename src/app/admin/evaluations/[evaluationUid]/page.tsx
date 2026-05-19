import Link from "next/link";
import { getAdminEvaluationDetail, toggleAdminEvaluationArchive } from "@/actions/workflow";
import { AdminJsonBlock, AdminMetaGrid } from "@/components/admin/admin-json";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatDate } from "@/lib/format";

export default async function AdminEvaluationDetailPage({ params }: { params: { evaluationUid: string } }) {
  const evaluation = await getAdminEvaluationDetail(params.evaluationUid);
  const evaluationJson = evaluation.json as { blocks?: Array<{ questions?: unknown[] }> };
  const questionCount = evaluationJson.blocks?.reduce((sum, block) => sum + (block.questions?.length ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-gray-500">{evaluation.uid}</p>
          <h1 className="text-3xl font-bold text-ink">{evaluation.version}</h1>
          <p className="mt-2 text-sm text-gray-600">
            <Link href={`/admin/jobs/${evaluation.job.uid}`} className="font-semibold text-coral">{evaluation.job.title}</Link>
            <span> · </span>
            <Link href={`/admin/companies/${evaluation.company.uid}`} className="font-semibold text-coral">{evaluation.company.name ?? evaluation.company.uid}</Link>
          </p>
        </div>
        <form action={toggleAdminEvaluationArchive.bind(null, evaluation.uid)}>
          <button className="btn-secondary" type="submit">{evaluation.status === "ARCHIVED" ? "Réactiver" : "Archiver"}</button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Questions" value={questionCount} />
        <StatCard label="Invitations" value={evaluation.invitations.length} />
        <StatCard label="Réponses" value={evaluation.responses.length} />
        <StatCard label="Rapports" value={evaluation.reports.length} />
      </div>

      <AdminMetaGrid
        items={[
          ["Statut", <Badge key="status" value={evaluation.status} />],
          ["Langue", evaluation.language],
          ["Générée par", evaluation.generatedBy?.email ?? "Système"],
          ["Créée", formatDate(evaluation.createdAt)]
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="panel overflow-hidden">
          <div className="border-b border-line px-5 py-4"><h2 className="font-semibold text-ink">Invitations</h2></div>
          {evaluation.invitations.map((invitation) => (
            <div key={invitation.id} className="border-b border-line px-5 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-ink">{invitation.candidateEmail}</span>
                <Badge value={invitation.status} />
              </div>
              <p className="mt-1 text-xs text-gray-500">Expire le {formatDate(invitation.expiresAt)}</p>
            </div>
          ))}
        </div>
        <div className="panel overflow-hidden">
          <div className="border-b border-line px-5 py-4"><h2 className="font-semibold text-ink">Réponses & rapports</h2></div>
          {evaluation.responses.map((response) => (
            <div key={response.id} className="border-b border-line px-5 py-3 text-sm">
              <Link href={`/admin/responses/${response.uid}`} className="font-semibold text-ink hover:text-coral">{response.candidate.email}</Link>
              <span className="ml-2 text-xs text-gray-500">{response.isSubmitted ? "Soumise" : "Brouillon"}</span>
              {response.report ? <Link href={`/admin/reports/${response.report.uid}`} className="ml-3 text-coral">Rapport</Link> : null}
            </div>
          ))}
        </div>
      </section>

      <AdminJsonBlock title="Évaluation JSON brute complète" data={evaluation.json} defaultOpen />
    </div>
  );
}
