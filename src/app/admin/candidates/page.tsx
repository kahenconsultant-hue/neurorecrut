import Link from "next/link";
import { getAdminDashboardData } from "@/actions/workflow";
import { formatDate } from "@/lib/format";

export default async function AdminCandidatesPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Candidats</h1>
        <p className="mt-2 text-sm text-gray-600">Profils candidats, CV structuré, invitations, réponses et rapports par poste.</p>
      </div>
      <section className="panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-mist text-gray-500">
            <tr>
              <th className="px-5 py-3">Candidat</th>
              <th className="px-5 py-3">Entreprise</th>
              <th className="px-5 py-3">Profil</th>
              <th className="px-5 py-3">Activité</th>
              <th className="px-5 py-3">Créé</th>
            </tr>
          </thead>
          <tbody>
            {data.candidates.map((candidate) => (
              <tr key={candidate.id} className="border-t border-line">
                <td className="px-5 py-3">
                  <Link href={`/admin/candidates/${candidate.uid}`} className="font-semibold text-ink hover:text-coral">
                    {candidate.firstName ?? ""} {candidate.lastName ?? ""}
                  </Link>
                  <p className="text-xs text-gray-500">{candidate.email}</p>
                </td>
                <td className="px-5 py-3">
                  {candidate.company ? <Link href={`/admin/companies/${candidate.company.uid}`} className="hover:text-coral">{candidate.company.name ?? candidate.company.uid}</Link> : "Multi-entreprises"}
                </td>
                <td className="px-5 py-3 text-xs text-gray-600">
                  {candidate.currentRole ?? "Rôle non renseigné"} · {candidate.experienceYears ?? 0} ans
                </td>
                <td className="px-5 py-3 text-xs text-gray-600">
                  {candidate._count.invitations} invitations · {candidate._count.responses} réponses · {candidate._count.reports} rapports
                </td>
                <td className="px-5 py-3">{formatDate(candidate.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
