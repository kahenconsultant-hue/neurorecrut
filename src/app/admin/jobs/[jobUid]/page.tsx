import Link from "next/link";
import { generateEvaluation, generateTargetProfile, getAdminJobDetail, updateAdminJob } from "@/actions/workflow";
import { AdminJsonBlock } from "@/components/admin/admin-json";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { SOFT_SKILLS, SOFT_SKILL_SCALE } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";

const jobFields = [
  ["title", "Intitulé", "input"],
  ["description", "Description", "textarea"],
  ["mainMissions", "Missions", "textarea"],
  ["hardSkillsRequired", "Hard skills", "textarea"],
  ["seniorityLevel", "Séniorité", "input"],
  ["contractType", "Contrat", "input"],
  ["location", "Localisation", "input"],
  ["workMode", "Mode de travail", "input"],
  ["teamContext", "Contexte équipe", "textarea"],
  ["managerProfile", "Profil manager", "textarea"],
  ["managementStyle", "Style management", "textarea"],
  ["workRhythm", "Rythme", "textarea"],
  ["mainConstraints", "Contraintes", "textarea"],
  ["expectedPerformanceIndicators", "KPIs attendus", "textarea"],
  ["companySpecificExpectations", "Attentes entreprise", "textarea"]
] as const;

export default async function AdminJobDetailPage({ params, searchParams }: { params: { jobUid: string }; searchParams?: { error?: string } }) {
  const job = await getAdminJobDetail(params.jobUid);
  const softSkillMatrix = job.softSkillMatrix as Record<string, number>;
  const creditsRemaining = job.creditBalances.reduce((sum, balance) => sum + balance.creditsPurchased - balance.creditsUsed, 0);
  const paidRevenue = job.purchases.filter((purchase) => purchase.status === "PAID").reduce((sum, purchase) => sum + purchase.amountCents, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-gray-500">{job.uid}</p>
          <h1 className="text-3xl font-bold text-ink">{job.title}</h1>
          <p className="mt-2 text-sm text-gray-600">
            <Link href={`/admin/companies/${job.company.uid}`} className="font-semibold text-coral">{job.company.name ?? job.company.uid}</Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={generateTargetProfile.bind(null, job.uid)}><button className="btn-secondary" type="submit">Régénérer profil cible</button></form>
          <form action={generateEvaluation.bind(null, job.uid)}><button className="btn-primary" type="submit">Générer évaluation</button></form>
        </div>
      </div>

      {searchParams?.error === "validation" ? <div className="panel border-coral/40 bg-coral/5 p-4 text-sm text-coral">Validation impossible: vérifiez les champs obligatoires et la matrice soft skills.</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Crédits restants" value={creditsRemaining} />
        <StatCard label="Évaluations" value={job.evaluations.length} />
        <StatCard label="Réponses" value={job.responses.length} />
        <StatCard label="Rapports" value={job.reports.length} />
        <StatCard label="Invitations" value={job.invitations.length} />
        <StatCard label="Achats" value={job.purchases.length} />
        <StatCard label="CA payé" value={formatCurrency(paidRevenue)} />
        <StatCard label="Statut" value={job.status} />
      </div>

      <section className="panel p-5">
        <p className="text-sm font-medium text-gray-500">Code unique candidat</p>
        <code className="mt-3 inline-block rounded-md border border-line bg-mist px-3 py-2 font-mono text-sm text-ink">{job.uid}</code>
      </section>

      <form action={updateAdminJob.bind(null, job.uid)} className="panel space-y-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-ink">Modifier le poste</h2>
          <select className="field w-auto" name="status" defaultValue={job.status}>
            {["DRAFT", "TARGET_PROFILE_GENERATED", "EVALUATION_GENERATED", "INVITATIONS_SENT", "ARCHIVED"].map((status) => <option key={status}>{status}</option>)}
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {jobFields.map(([name, label, type]) => (
            <label key={name} className={type === "textarea" ? "md:col-span-2" : ""}>
              <span className="label">{label}</span>
              {type === "textarea" ? (
                <textarea className="field min-h-24" name={name} defaultValue={String(job[name] ?? "")} required />
              ) : (
                <input className="field" name={name} defaultValue={String(job[name] ?? "")} required />
              )}
            </label>
          ))}
        </div>
        <div>
          <h3 className="font-semibold text-ink">Matrice soft skills</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {SOFT_SKILLS.map((skill) => (
              <label key={skill} className="rounded-md border border-line p-3">
                <span className="label">{skill}</span>
                <select className="field" name={`softSkill.${skill}`} defaultValue={softSkillMatrix[skill] ?? 3}>
                  {SOFT_SKILL_SCALE.map((label, index) => <option key={label} value={index}>{index} - {label}</option>)}
                </select>
              </label>
            ))}
          </div>
        </div>
        <button className="btn-primary" type="submit">Enregistrer le poste</button>
      </form>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="panel overflow-hidden">
          <div className="border-b border-line px-5 py-4"><h2 className="font-semibold text-ink">Évaluations</h2></div>
          {job.evaluations.map((evaluation) => (
            <Link key={evaluation.id} href={`/admin/evaluations/${evaluation.uid}`} className="block border-b border-line px-5 py-3 hover:bg-mist">
              <span className="font-semibold text-ink">{evaluation.version}</span>
              <span className="ml-2 text-xs text-gray-500">{formatDate(evaluation.createdAt)} · {evaluation.responses.length} réponses</span>
            </Link>
          ))}
        </div>
        <div className="panel overflow-hidden">
          <div className="border-b border-line px-5 py-4"><h2 className="font-semibold text-ink">Rapports classés</h2></div>
          {job.reports.map((report) => (
            <Link key={report.id} href={`/admin/reports/${report.uid}`} className="block border-b border-line px-5 py-3 hover:bg-mist">
              <span className="font-semibold text-ink">{report.candidate.email}</span>
              <span className="ml-2 text-xs text-gray-500">{Math.round(report.matchingScore)}/100 · {report.recommendation}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-line px-5 py-4"><h2 className="font-semibold text-ink">Réponses candidates</h2></div>
        <table className="responsive-table">
          <tbody>
            {job.responses.map((response) => (
              <tr key={response.id} className="border-t border-line">
                <td className="px-5 py-3" data-label="Réponse"><Link href={`/admin/responses/${response.uid}`} className="font-semibold text-ink hover:text-coral">{response.uid}</Link></td>
                <td className="px-5 py-3" data-label="Candidat"><Link href={`/admin/candidates/${response.candidate.uid}`} className="hover:text-coral">{response.candidate.email}</Link></td>
                <td className="px-5 py-3" data-label="Statut"><Badge value={response.isSubmitted ? "COMPLETED" : "DRAFT"} /></td>
                <td className="px-5 py-3" data-label="Rapport">{response.report ? <Link href={`/admin/reports/${response.report.uid}`} className="text-coral">Rapport</Link> : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <AdminJsonBlock title="Profil cible brut" data={job.targetProfile} />
      <AdminJsonBlock title="Matrice soft skills brute" data={job.softSkillMatrix} />
      <AdminJsonBlock title="Logs IA liés au poste" data={job.aiLogs} />
    </div>
  );
}
