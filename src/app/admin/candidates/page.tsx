import Link from "next/link";
import { getAdminDashboardData } from "@/actions/workflow";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { getParam, matchesDateRange, matchesQuery, matchesSelect, uniqueOptions, type AdminSearchParams } from "@/lib/admin-filters";
import { formatDate } from "@/lib/format";

export default async function AdminCandidatesPage({ searchParams }: { searchParams?: AdminSearchParams }) {
  const data = await getAdminDashboardData();
  const filteredCandidates = data.candidates.filter((candidate) => {
    return (
      matchesQuery(getParam(searchParams, "q"), [
        candidate.firstName,
        candidate.lastName,
        candidate.code,
        candidate.email,
        candidate.phone,
        candidate.currentRole,
        candidate.education,
        candidate.company?.name,
        candidate.company?.uid
      ]) &&
      matchesSelect(getParam(searchParams, "company"), candidate.company?.name ?? "Multi-entreprises") &&
      matchesDateRange(candidate.createdAt, getParam(searchParams, "from"), getParam(searchParams, "to"))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Candidats</h1>
        <p className="mt-2 text-sm text-gray-600">Profils candidats, CV structuré, invitations, réponses et rapports par poste.</p>
      </div>

      <AdminFilterBar
        searchParams={searchParams}
        resetHref="/admin/candidates"
        totalCount={data.candidates.length}
        resultCount={filteredCandidates.length}
        placeholder="Nom, email, rôle, entreprise..."
        selects={[
          { name: "company", label: "Entreprise", options: uniqueOptions(data.candidates.map((candidate) => candidate.company?.name ?? "Multi-entreprises")) }
        ]}
      />

      <section className="panel overflow-hidden">
        <table className="responsive-table">
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
            {filteredCandidates.map((candidate) => (
              <tr key={candidate.id} className="border-t border-line">
                <td className="px-5 py-3" data-label="Candidat">
                  <Link href={`/admin/candidates/${candidate.uid}`} className="font-semibold text-ink hover:text-coral">
                    {candidate.firstName ?? ""} {candidate.lastName ?? ""}
                  </Link>
                  <p className="text-xs text-gray-500">{candidate.email}</p>
                  <p className="font-mono text-xs text-gray-400">{candidate.code ?? candidate.uid}</p>
                </td>
                <td className="px-5 py-3" data-label="Entreprise">
                  {candidate.company ? <Link href={`/admin/companies/${candidate.company.uid}`} className="hover:text-coral">{candidate.company.name ?? candidate.company.uid}</Link> : "Multi-entreprises"}
                </td>
                <td className="px-5 py-3 text-xs text-gray-600" data-label="Profil">
                  {candidate.currentRole ?? "Rôle non renseigné"} · {candidate.experienceYears ?? 0} ans
                </td>
                <td className="px-5 py-3 text-xs text-gray-600" data-label="Activité">
                  {candidate._count.invitations} invitations · {candidate._count.responses} réponses · {candidate._count.reports} rapports
                </td>
                <td className="px-5 py-3" data-label="Créé">{formatDate(candidate.createdAt)}</td>
              </tr>
            ))}
            {filteredCandidates.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-sm text-gray-500" colSpan={5}>Aucun candidat ne correspond aux filtres.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
