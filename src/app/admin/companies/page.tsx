import Link from "next/link";
import { manuallyAddCredits, getAdminDashboardData, toggleCompanyStatus } from "@/actions/workflow";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { Badge } from "@/components/ui/badge";
import { getParam, matchesDateRange, matchesQuery, matchesSelect, uniqueOptions, type AdminSearchParams } from "@/lib/admin-filters";

export default async function AdminCompaniesPage({ searchParams }: { searchParams?: AdminSearchParams }) {
  const data = await getAdminDashboardData();
  const filteredCompanies = data.companies.filter((company) => {
    return (
      matchesQuery(getParam(searchParams, "q"), [
        company.name,
        company.uid,
        company.ownerEmail,
        company.hrContactEmail,
        company.sector,
        company.siretSiren
      ]) &&
      matchesSelect(getParam(searchParams, "status"), company.status) &&
      matchesDateRange(company.createdAt, getParam(searchParams, "from"), getParam(searchParams, "to"))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Entreprises</h1>
        <p className="mt-2 text-sm text-gray-600">Accès complet aux comptes société, jobs, candidats, crédits, achats, évaluations et rapports.</p>
      </div>

      <AdminFilterBar
        searchParams={searchParams}
        resetHref="/admin/companies"
        totalCount={data.companies.length}
        resultCount={filteredCompanies.length}
        placeholder="Nom, email, SIRET, secteur..."
        selects={[
          { name: "status", label: "Statut", options: uniqueOptions(data.companies.map((company) => company.status)) }
        ]}
      />

      <section className="panel overflow-hidden">
        <table className="responsive-table">
          <thead className="bg-mist text-gray-500">
            <tr>
              <th className="px-5 py-3">Nom</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Activité</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company) => (
              <tr key={company.id} className="border-t border-line">
                <td className="px-5 py-3" data-label="Nom">
                  <Link href={`/admin/companies/${company.uid}`} className="font-semibold text-ink hover:text-coral">
                    {company.name ?? company.uid}
                  </Link>
                  <p className="mt-1 font-mono text-xs text-gray-500">{company.uid}</p>
                </td>
                <td className="px-5 py-3" data-label="Email">{company.hrContactEmail ?? company.ownerEmail}</td>
                <td className="px-5 py-3 text-xs text-gray-600" data-label="Activité">
                  {company._count.jobs} postes · {company._count.candidates} candidats · {company._count.reports} rapports
                </td>
                <td className="px-5 py-3" data-label="Statut"><Badge value={company.status} /></td>
                <td className="px-5 py-3" data-label="Actions">
                  <div className="flex flex-wrap gap-2">
                    <form action={toggleCompanyStatus.bind(null, company.uid)}>
                      <button className="btn-secondary" type="submit">Activer/désactiver</button>
                    </form>
                    <form action={manuallyAddCredits.bind(null, company.uid, 1)}>
                      <button className="btn-secondary" type="submit">+1 crédit</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCompanies.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-sm text-gray-500" colSpan={5}>Aucune entreprise ne correspond aux filtres.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
