import Link from "next/link";
import { updateAdminPurchaseStatus } from "@/actions/workflow";
import { getAdminDashboardData } from "@/actions/workflow";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function AdminPurchasesPage() {
  const data = await getAdminDashboardData();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Achats</h1>
        <p className="mt-2 text-sm text-gray-600">Suivi Stripe, statut de paiement, plan acheté et crédit activé.</p>
      </div>
      <section className="panel overflow-hidden">
        <table className="w-full text-left text-sm">
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
            {data.purchases.map((purchase) => (
              <tr key={purchase.id} className="border-t border-line">
                <td className="px-5 py-3">
                  <Link href={`/admin/companies/${purchase.company.uid}`} className="font-semibold text-ink hover:text-coral">
                    {purchase.company.name ?? purchase.company.uid}
                  </Link>
                </td>
                <td className="px-5 py-3">{purchase.plan.name}</td>
                <td className="px-5 py-3">{purchase.job ? <Link href={`/admin/jobs/${purchase.job.uid}`} className="hover:text-coral">{purchase.job.title}</Link> : "Global"}</td>
                <td className="px-5 py-3">{formatCurrency(purchase.amountCents)}</td>
                <td className="px-5 py-3">{purchase.creditsPurchased}</td>
                <td className="px-5 py-3"><Badge value={purchase.status} /></td>
                <td className="px-5 py-3">{formatDate(purchase.createdAt)}</td>
                <td className="px-5 py-3">
                  <form action={updateAdminPurchaseStatus.bind(null, purchase.uid)} className="flex gap-2">
                    <select name="status" defaultValue={purchase.status} className="field min-w-28">
                      {["PENDING", "PAID", "FAILED", "CANCELED", "REFUNDED"].map((status) => <option key={status}>{status}</option>)}
                    </select>
                    <button className="btn-secondary" type="submit">OK</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
