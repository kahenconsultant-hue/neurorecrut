import Link from "next/link";
import { getAdminCandidateDetail, updateAdminCandidate } from "@/actions/workflow";
import { AdminJsonBlock, AdminMetaGrid } from "@/components/admin/admin-json";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatDate } from "@/lib/format";

const candidateFields = [
  ["firstName", "Prénom"],
  ["lastName", "Nom"],
  ["email", "Email"],
  ["phone", "Téléphone"],
  ["linkedin", "LinkedIn"],
  ["cvUrl", "CV URL"],
  ["currentRole", "Rôle actuel"],
  ["education", "Formation"],
  ["availability", "Disponibilité"],
  ["mobility", "Mobilité"],
  ["salaryExpectations", "Salaire attendu"]
] as const;

export default async function AdminCandidateDetailPage({ params }: { params: { candidateUid: string } }) {
  const candidate = await getAdminCandidateDetail(params.candidateUid);
  const fullName = `${candidate.firstName ?? ""} ${candidate.lastName ?? ""}`.trim() || candidate.email;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-gray-500">{candidate.uid}</p>
        <h1 className="text-3xl font-bold text-ink">{fullName}</h1>
        <p className="mt-2 text-sm text-gray-600">{candidate.email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Invitations" value={candidate.invitations.length} />
        <StatCard label="Réponses" value={candidate.responses.length} />
        <StatCard label="Rapports" value={candidate.reports.length} />
        <StatCard label="Expérience" value={`${candidate.experienceYears ?? 0} ans`} />
      </div>

      <AdminMetaGrid
        items={[
          ["Compte", candidate.user ? "Compte candidat actif" : "Sans compte utilisateur"],
          ["Entreprise principale", candidate.company ? <Link key="company" href={`/admin/companies/${candidate.company.uid}`} className="text-coral">{candidate.company.name ?? candidate.company.uid}</Link> : "Multi-entreprises"],
          ["Créé", formatDate(candidate.createdAt)],
          ["MAJ", formatDate(candidate.updatedAt)]
        ]}
      />

      <form action={updateAdminCandidate.bind(null, candidate.uid)} className="panel space-y-5 p-5">
        <h2 className="font-semibold text-ink">Modifier le profil candidat</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {candidateFields.map(([name, label]) => (
            <label key={name}>
              <span className="label">{label}</span>
              <input className="field" name={name} defaultValue={String(candidate[name] ?? "")} />
            </label>
          ))}
          <label>
            <span className="label">Années d&apos;expérience</span>
            <input className="field" name="experienceYears" type="number" defaultValue={candidate.experienceYears ?? 0} />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label><span className="label">Motivation</span><textarea className="field min-h-24" name="motivation" defaultValue={candidate.motivation ?? ""} /></label>
          <label><span className="label">Préférences de travail</span><textarea className="field min-h-24" name="workPreferences" defaultValue={candidate.workPreferences ?? ""} /></label>
        </div>
        <button className="btn-primary" type="submit">Enregistrer le candidat</button>
      </form>

      <section className="panel overflow-hidden">
        <div className="border-b border-line px-5 py-4"><h2 className="font-semibold text-ink">Évaluations du candidat</h2></div>
        <table className="responsive-table">
          <thead className="bg-mist text-gray-500"><tr><th className="px-5 py-3">Entreprise</th><th className="px-5 py-3">Poste</th><th className="px-5 py-3">Statut</th><th className="px-5 py-3">Réponse</th><th className="px-5 py-3">Rapport</th></tr></thead>
          <tbody>
            {candidate.invitations.map((invitation) => (
              <tr key={invitation.id} className="border-t border-line">
                <td className="px-5 py-3" data-label="Entreprise"><Link href={`/admin/companies/${invitation.company.uid}`} className="hover:text-coral">{invitation.company.name ?? invitation.company.uid}</Link></td>
                <td className="px-5 py-3" data-label="Poste"><Link href={`/admin/jobs/${invitation.job.uid}`} className="font-semibold text-ink hover:text-coral">{invitation.job.title}</Link></td>
                <td className="px-5 py-3" data-label="Statut"><Badge value={invitation.status} /></td>
                <td className="px-5 py-3" data-label="Réponse">{invitation.response ? <Link href={`/admin/responses/${invitation.response.uid}`} className="text-coral">Réponse</Link> : "-"}</td>
                <td className="px-5 py-3" data-label="Rapport">{invitation.response?.report ? <Link href={`/admin/reports/${invitation.response.report.uid}`} className="text-coral">Rapport</Link> : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-line px-5 py-4"><h2 className="font-semibold text-ink">Rapports</h2></div>
        {candidate.reports.map((report) => (
          <Link key={report.id} href={`/admin/reports/${report.uid}`} className="block border-b border-line px-5 py-3 hover:bg-mist">
            <span className="font-semibold text-ink">{report.job.title}</span>
            <span className="ml-2 text-sm text-gray-500">{Math.round(report.matchingScore)}/100 · {report.recommendation}</span>
          </Link>
        ))}
      </section>

      <AdminJsonBlock title="CV structuré brut" data={candidate.resumeJson} defaultOpen />
    </div>
  );
}
