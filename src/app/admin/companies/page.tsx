import Link from "next/link";
import { manuallyAddCredits, getAdminDashboardData, toggleCompanyStatus } from "@/actions/workflow";
import { Badge } from "@/components/ui/badge";

export default async function AdminCompaniesPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Entreprises</h1>
        <p className="mt-2 text-sm text-gray-600">Accès complet aux comptes société, jobs, candidats, crédits, achats, évaluations et rapports.</p>
      </div>
      <section className="panel overflow-hidden">
        <table className="w-full text-left text-sm">
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
            {data.companies.map((company) => (
              <tr key={company.id} className="border-t border-line">
                <td className="px-5 py-3">
                  <Link href={`/admin/companies/${company.uid}`} className="font-semibold text-ink hover:text-coral">
                    {company.name ?? company.uid}
                  </Link>
                  <p className="mt-1 font-mono text-xs text-gray-500">{company.uid}</p>
                </td>
                <td className="px-5 py-3">{company.hrContactEmail ?? company.ownerEmail}</td>
                <td className="px-5 py-3 text-xs text-gray-600">
                  {company._count.jobs} postes · {company._count.candidates} candidats · {company._count.reports} rapports
                </td>
                <td className="px-5 py-3"><Badge value={company.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-2">
                    <form action={toggleCompanyStatus.bind(null, company.uid)}>
                      <button className="btn-secondary" type="submit">Activer/désactiver</button>
                    </form>
                    <form action={manuallyAddCredits.bind(null, company.uid, 5)}>
                      <button className="btn-secondary" type="submit">+5 crédits</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
