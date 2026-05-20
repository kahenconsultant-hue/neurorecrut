import Link from "next/link";
import { getAdminDashboardData } from "@/actions/workflow";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { Badge } from "@/components/ui/badge";
import { getParam, matchesDateRange, matchesQuery, matchesSelect, type AdminSearchParams, uniqueOptions } from "@/lib/admin-filters";
import { formatDate } from "@/lib/format";

export default async function AdminResponsesPage({ searchParams }: { searchParams?: AdminSearchParams }) {
  const data = await getAdminDashboardData();
  const filteredResponses = data.responses.filter((response) => {
    return (
      matchesQuery(getParam(searchParams, "q"), [
        response.uid,
        response.company.name,
        response.job.title,
        response.candidate.email,
        response.evaluation.uid,
        response.report?.uid
      ]) &&
      matchesSelect(getParam(searchParams, "company"), response.company.name ?? response.company.uid) &&
      matchesSelect(getParam(searchParams, "submitted"), response.isSubmitted ? "COMPLETED" : "DRAFT") &&
      matchesDateRange(response.updatedAt, getParam(searchParams, "from"), getParam(searchParams, "to"))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Réponses d&apos;évaluation</h1>
        <p className="mt-2 text-sm text-gray-600">Réponses brutes, drafts autosauvegardés, statut de soumission et rapport généré.</p>
      </div>

      <AdminFilterBar
        searchParams={searchParams}
        resetHref="/admin/responses"
        totalCount={data.responses.length}
        resultCount={filteredResponses.length}
        placeholder="Réponse, entreprise, poste, candidat..."
        selects={[
          { name: "company", label: "Entreprise", options: uniqueOptions(data.responses.map((response) => response.company.name ?? response.company.uid)) },
          { name: "submitted", label: "Statut", options: [{ value: "COMPLETED", label: "Soumise" }, { value: "DRAFT", label: "Brouillon" }] }
        ]}
      />

      <section className="panel overflow-hidden">
        <table className="responsive-table">
          <thead className="bg-mist text-gray-500">
            <tr>
              <th className="px-5 py-3">Réponse</th>
              <th className="px-5 py-3">Entreprise</th>
              <th className="px-5 py-3">Poste</th>
              <th className="px-5 py-3">Candidat</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Rapport</th>
              <th className="px-5 py-3">MAJ</th>
            </tr>
          </thead>
          <tbody>
            {filteredResponses.map((response) => (
              <tr key={response.id} className="border-t border-line">
                <td className="px-5 py-3" data-label="Réponse">
                  <Link href={`/admin/responses/${response.uid}`} className="font-semibold text-ink hover:text-coral">
                    {response.uid}
                  </Link>
                </td>
                <td className="px-5 py-3" data-label="Entreprise"><Link href={`/admin/companies/${response.company.uid}`} className="hover:text-coral">{response.company.name ?? response.company.uid}</Link></td>
                <td className="px-5 py-3" data-label="Poste"><Link href={`/admin/jobs/${response.job.uid}`} className="hover:text-coral">{response.job.title}</Link></td>
                <td className="px-5 py-3" data-label="Candidat"><Link href={`/admin/candidates/${response.candidate.uid}`} className="hover:text-coral">{response.candidate.email}</Link></td>
                <td className="px-5 py-3" data-label="Statut"><Badge value={response.isSubmitted ? "COMPLETED" : "DRAFT"} /></td>
                <td className="px-5 py-3" data-label="Rapport">
                  {response.report ? <Link href={`/admin/reports/${response.report.uid}`} className="text-coral">Ouvrir</Link> : "-"}
                </td>
                <td className="px-5 py-3" data-label="MAJ">{formatDate(response.updatedAt)}</td>
              </tr>
            ))}
            {filteredResponses.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-sm text-gray-500" colSpan={7}>Aucune réponse ne correspond aux filtres.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
