import Link from "next/link";
import { getAdminDashboardData } from "@/actions/workflow";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { Badge } from "@/components/ui/badge";
import { getParam, matchesDateRange, matchesQuery, matchesSelect, uniqueOptions, type AdminSearchParams } from "@/lib/admin-filters";
import { formatDate } from "@/lib/format";

export default async function AdminJobsPage({ searchParams }: { searchParams?: AdminSearchParams }) {
  const data = await getAdminDashboardData();
  const filteredJobs = data.jobs.filter((job) => {
    return (
      matchesQuery(getParam(searchParams, "q"), [
        job.title,
        job.code,
        job.uid,
        job.description,
        job.location,
        job.contractType,
        job.seniorityLevel,
        job.company.name,
        job.company.uid
      ]) &&
      matchesSelect(getParam(searchParams, "company"), job.company.name ?? job.company.uid) &&
      matchesSelect(getParam(searchParams, "status"), job.status) &&
      matchesDateRange(job.createdAt, getParam(searchParams, "from"), getParam(searchParams, "to"))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Postes</h1>
        <p className="mt-2 text-sm text-gray-600">Tous les postes, codes candidats, profils cibles, évaluations et résultats par entreprise.</p>
      </div>

      <AdminFilterBar
        searchParams={searchParams}
        resetHref="/admin/jobs"
        totalCount={data.jobs.length}
        resultCount={filteredJobs.length}
        placeholder="Poste, entreprise, lieu, contrat..."
        selects={[
          { name: "company", label: "Entreprise", options: uniqueOptions(data.jobs.map((job) => job.company.name ?? job.company.uid)) },
          { name: "status", label: "Statut", options: uniqueOptions(data.jobs.map((job) => job.status)) }
        ]}
      />

      <section className="panel overflow-hidden">
        <table className="responsive-table">
          <thead className="bg-mist text-gray-500">
            <tr>
              <th className="px-5 py-3">Poste</th>
              <th className="px-5 py-3">Entreprise</th>
              <th className="px-5 py-3">Code candidat</th>
              <th className="px-5 py-3">Pipeline</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Créé</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr key={job.id} className="border-t border-line">
                <td className="px-5 py-3" data-label="Poste">
                  <Link href={`/admin/jobs/${job.uid}`} className="font-semibold text-ink hover:text-coral">
                    {job.title}
                  </Link>
                </td>
                <td className="px-5 py-3" data-label="Entreprise">
                  <Link href={`/admin/companies/${job.company.uid}`} className="hover:text-coral">
                    {job.company.name ?? job.company.uid}
                  </Link>
                </td>
                <td className="px-5 py-3" data-label="Code candidat"><code className="font-mono text-xs">{job.code ?? job.uid}</code></td>
                <td className="px-5 py-3 text-xs text-gray-600" data-label="Pipeline">
                  {job.evaluations.length} eval · {job._count.invitations} invitations · {job._count.reports} rapports
                </td>
                <td className="px-5 py-3" data-label="Statut"><Badge value={job.status} /></td>
                <td className="px-5 py-3" data-label="Créé">{formatDate(job.createdAt)}</td>
              </tr>
            ))}
            {filteredJobs.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-sm text-gray-500" colSpan={6}>Aucun poste ne correspond aux filtres.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
