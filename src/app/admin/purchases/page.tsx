import Link from "next/link";
import { updateAdminPurchaseStatus } from "@/actions/workflow";
import { getAdminDashboardData } from "@/actions/workflow";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { Badge } from "@/components/ui/badge";
import { getParam, matchesDateRange, matchesQuery, matchesSelect, type AdminSearchParams, uniqueOptions } from "@/lib/admin-filters";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function AdminPurchasesPage({ searchParams }: { searchParams?: AdminSearchParams }) {
  const data = await getAdminDashboardData();
  const filteredPurchases = data.purchases.filter((purchase) => {
    return (
      matchesQuery(getParam(searchParams, "q"), [
        purchase.uid,
        purchase.company.name,
        purchase.company.code,
        purchase.company.uid,
        purchase.plan.name,
        purchase.plan.code,
        purchase.job?.title,
        purchase.job?.code,
        purchase.stripeCheckoutSessionId,
        purchase.stripePaymentIntentId,
        purchase.stripeSubscriptionId
      ]) &&
      matchesSelect(getParam(searchParams, "company"), purchase.company.name ?? purchase.company.uid) &&
      matchesSelect(getParam(searchParams, "status"), purchase.status) &&
      matchesSelect(getParam(searchParams, "plan"), purchase.plan.name) &&
      matchesDateRange(purchase.createdAt, getParam(searchParams, "from"), getParam(searchParams, "to"))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Achats</h1>
        <p className="mt-2 text-sm text-gray-600">Suivi Stripe, statut de paiement, plan acheté et crédit activé.</p>
      </div>

      <AdminFilterBar
        searchParams={searchParams}
        resetHref="/admin/purchases"
        totalCount={data.purchases.length}
        resultCount={filteredPurchases.length}
        placeholder="Entreprise, offre, poste, session Stripe..."
        selects={[
          { name: "company", label: "Entreprise", options: uniqueOptions(data.purchases.map((purchase) => purchase.company.name ?? purchase.company.uid)) },
          { name: "status", label: "Statut", options: uniqueOptions(data.purchases.map((purchase) => purchase.status)) },
          { name: "plan", label: "Offre", options: uniqueOptions(data.purchases.map((purchase) => purchase.plan.name)) }
        ]}
      />

      <section className="panel overflow-hidden">
        <table className="responsive-table">
          <thead className="bg-mist text-gray-500">
            <tr>
              <th className="px-5 py-3">Entreprise</th>
              <th className="px-5 py-3">Offre</th>
              <th className="px-5 py-3">Poste</th>
              <th className="px-5 py-3">Montant</th>
              <th className="px-5 py-3">Crédits</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Admin</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.map((purchase) => (
              <tr key={purchase.id} className="border-t border-line">
                <td className="px-5 py-3" data-label="Entreprise">
                  <Link href={`/admin/companies/${purchase.company.uid}`} className="font-semibold text-ink hover:text-coral">
                    {purchase.company.name ?? purchase.company.uid}
                  </Link>
                </td>
                <td className="px-5 py-3" data-label="Offre">{purchase.plan.name}</td>
                <td className="px-5 py-3" data-label="Poste">{purchase.job ? <Link href={`/admin/jobs/${purchase.job.uid}`} className="hover:text-coral">{purchase.job.title}</Link> : "Global"}</td>
                <td className="px-5 py-3" data-label="Montant">{formatCurrency(purchase.amountCents)}</td>
                <td className="px-5 py-3" data-label="Crédits">{purchase.creditsPurchased}</td>
                <td className="px-5 py-3" data-label="Statut"><Badge value={purchase.status} /></td>
                <td className="px-5 py-3" data-label="Date">{formatDate(purchase.createdAt)}</td>
                <td className="px-5 py-3" data-label="Admin">
                  <form action={updateAdminPurchaseStatus.bind(null, purchase.uid)} className="flex gap-2">
                    <select name="status" defaultValue={purchase.status} className="field min-w-28">
                      {["PENDING", "PAID", "FAILED", "CANCELED", "REFUNDED"].map((status) => <option key={status}>{status}</option>)}
                    </select>
                    <button className="btn-secondary" type="submit">OK</button>
                  </form>
                </td>
              </tr>
            ))}
            {filteredPurchases.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-sm text-gray-500" colSpan={8}>Aucun achat ne correspond aux filtres.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
