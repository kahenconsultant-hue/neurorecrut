import Link from "next/link";
import { getAdminReportDetail } from "@/actions/workflow";
import { AdminJsonBlock, AdminMetaGrid } from "@/components/admin/admin-json";
import { CompatibilityScore } from "@/components/ui/compatibility-score";
import { StatCard } from "@/components/ui/stat-card";
import { formatDate } from "@/lib/format";

export default async function AdminReportDetailPage({ params }: { params: { reportUid: string } }) {
  const report = await getAdminReportDetail(params.reportUid);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-gray-500">{report.code ?? report.uid}</p>
          <h1 className="text-3xl font-bold text-ink">Rapport RH</h1>
          <p className="mt-2 text-sm text-gray-600">
            <Link href={`/admin/candidates/${report.candidate.uid}`} className="font-semibold text-coral">{report.candidate.email}</Link>
            <span> · </span>
            <Link href={`/admin/jobs/${report.job.uid}`} className="font-semibold text-coral">{report.job.title}</Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/api/reports/${report.uid}/pdf`} target="_blank" className="btn-primary">PDF</Link>
          <Link href={`/company/reports/${report.uid}`} className="btn-secondary">Vue société</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Global" value={`${Math.round(report.globalScore)}/100`} />
        <StatCard label="Matching" value={`${Math.round(report.matchingScore)}/100`} />
        <StatCard label="Cohérence" value={`${Math.round(report.coherenceIndex)}/100`} />
        <StatCard label="Sincérité" value={`${Math.round(report.sincerityIndex)}`} />
      </div>

      <AdminMetaGrid
        items={[
          ["Entreprise", <Link key="company" href={`/admin/companies/${report.company.uid}`} className="text-coral">{report.company.name ?? report.company.uid}</Link>],
          ["Code rapport", report.code ?? report.uid],
          ["Code candidat", report.candidate.code ?? report.candidate.uid],
          ["Code poste", report.job.code ?? report.job.uid],
          ["Évaluation", <Link key="evaluation" href={`/admin/evaluations/${report.evaluation.uid}`} className="text-coral">{report.evaluation.version}</Link>],
          ["Réponse", <Link key="response" href={`/admin/responses/${report.response.uid}`} className="text-coral">{report.response.uid}</Link>],
          ["Compatibilité", <CompatibilityScore key="compatibility" score={report.matchingScore} />],
          ["Recommandation", report.recommendation],
          ["Avis final", report.finalOpinion],
          ["PDF", report.pdfFileName ?? "Non généré"],
          ["Créé", formatDate(report.createdAt)]
        ]}
      />

      <section className="panel p-5">
        <h2 className="font-semibold text-ink">Synthèse visible admin</h2>
        <p className="mt-2 text-sm leading-6 text-gray-700">{report.recommendation} · {report.finalOpinion}</p>
      </section>

      <AdminJsonBlock title="Analyse scoring brute" data={report.analysisJson} defaultOpen />
      <AdminJsonBlock title="Rapport HR JSON brut" data={report.reportJson} />
      <AdminJsonBlock title="Réponses candidat liées" data={report.response.answersJson} />
    </div>
  );
}
