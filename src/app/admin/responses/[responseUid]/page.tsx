import Link from "next/link";
import { getAdminResponseDetail } from "@/actions/workflow";
import { AdminJsonBlock, AdminMetaGrid } from "@/components/admin/admin-json";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatDate } from "@/lib/format";

export default async function AdminResponseDetailPage({ params }: { params: { responseUid: string } }) {
  const response = await getAdminResponseDetail(params.responseUid);
  const answers = response.answersJson as { answers?: unknown[] };
  const draft = response.draftJson as { answers?: unknown[] } | null;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-gray-500">{response.uid}</p>
        <h1 className="text-3xl font-bold text-ink">Réponse candidat</h1>
        <p className="mt-2 text-sm text-gray-600">
          <Link href={`/admin/candidates/${response.candidate.uid}`} className="font-semibold text-coral">{response.candidate.email}</Link>
          <span> · </span>
          <Link href={`/admin/jobs/${response.job.uid}`} className="font-semibold text-coral">{response.job.title}</Link>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Réponses finales" value={answers.answers?.length ?? 0} />
        <StatCard label="Draft autosave" value={draft?.answers?.length ?? 0} />
        <StatCard label="Soumise" value={response.isSubmitted ? "Oui" : "Non"} />
        <StatCard label="Logs IA" value={response.aiLogs.length} />
      </div>

      <AdminMetaGrid
        items={[
          ["Entreprise", <Link key="company" href={`/admin/companies/${response.company.uid}`} className="text-coral">{response.company.name ?? response.company.uid}</Link>],
          ["Évaluation", <Link key="evaluation" href={`/admin/evaluations/${response.evaluation.uid}`} className="text-coral">{response.evaluation.version}</Link>],
          ["Invitation", response.invitation.uid],
          ["Statut", <Badge key="status" value={response.isSubmitted ? "COMPLETED" : "DRAFT"} />],
          ["Créée", formatDate(response.createdAt)],
          ["Soumise", formatDate(response.submittedAt)],
          ["Verrouillée", formatDate(response.lockedAt)],
          ["Rapport", response.report ? <Link key="report" href={`/admin/reports/${response.report.uid}`} className="text-coral">Ouvrir</Link> : "Non généré"]
        ]}
      />

      <AdminJsonBlock title="Réponses finales brutes" data={response.answersJson} defaultOpen />
      <AdminJsonBlock title="Draft autosauvegardé brut" data={response.draftJson} />
      <AdminJsonBlock title="Évaluation utilisée" data={response.evaluation.json} />
      <AdminJsonBlock title="Logs IA liés à cette réponse" data={response.aiLogs} />
    </div>
  );
}
