import Link from "next/link";
import { adminCreatePricingPlan, getAdminDashboardData, updateAdminCreditBalance, updateAdminPricingPlan } from "@/actions/workflow";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export default async function AdminPricingPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Offres & crédits</h1>
        <p className="mt-2 text-sm text-gray-600">Configuration des packages, abonnements, prix Stripe et soldes de crédits actifs.</p>
      </div>

      <section className="grid gap-4 xl:grid-cols-2">
        {data.pricingPlans.map((plan) => (
          <form key={plan.id} action={updateAdminPricingPlan.bind(null, plan.code)} className="panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-ink">{plan.name}</h2>
                <p className="font-mono text-xs text-gray-500">{plan.code}</p>
              </div>
              <Badge value={plan.active ? "ACTIVE" : "INACTIVE"} />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label><span className="label">Nom</span><input className="field" name="name" defaultValue={plan.name} /></label>
              <label><span className="label">Prix EUR</span><input className="field" name="priceEuro" type="number" step="0.01" defaultValue={plan.priceCents / 100} /></label>
              <label><span className="label">Devise</span><input className="field" name="currency" defaultValue={plan.currency} /></label>
              <label><span className="label">Crédits</span><input className="field" name="credits" type="number" defaultValue={plan.credits} /></label>
              <label className="md:col-span-2"><span className="label">Description</span><textarea className="field min-h-20" name="description" defaultValue={plan.description ?? ""} /></label>
              <label className="md:col-span-2"><span className="label">Stripe Price ID</span><input className="field" name="stripePriceId" defaultValue={plan.stripePriceId ?? ""} /></label>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-graphite">
              <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={plan.active} /> Active</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="jobScoped" defaultChecked={plan.jobScoped} /> Liée à un poste</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="monthly" defaultChecked={plan.monthly} /> Mensuelle</label>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500">{plan._count.purchases} achats · {plan._count.creditBalances} soldes</p>
              <button className="btn-primary" type="submit">Enregistrer</button>
            </div>
          </form>
        ))}
      </section>

      <form action={adminCreatePricingPlan} className="panel p-5">
        <h2 className="font-semibold text-ink">Créer une nouvelle offre</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <label><span className="label">Code</span><input className="field" name="code" placeholder="CUSTOM" /></label>
          <label><span className="label">Nom</span><input className="field" name="name" placeholder="Custom Pack" /></label>
          <label><span className="label">Prix EUR</span><input className="field" name="priceEuro" type="number" step="0.01" defaultValue="0" /></label>
          <label><span className="label">Crédits</span><input className="field" name="credits" type="number" defaultValue="1" /></label>
          <label className="md:col-span-2"><span className="label">Description</span><input className="field" name="description" /></label>
          <label><span className="label">Devise</span><input className="field" name="currency" defaultValue="eur" /></label>
          <label><span className="label">Stripe Price ID</span><input className="field" name="stripePriceId" /></label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-4 text-sm text-graphite">
            <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked /> Active</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="jobScoped" defaultChecked /> Liée à un poste</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="monthly" /> Mensuelle</label>
          </div>
          <button className="btn-secondary" type="submit">Créer l&apos;offre</button>
        </div>
      </form>

      <section className="panel overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-semibold text-ink">Soldes de crédits</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="responsive-table">
            <thead className="bg-mist text-gray-500">
              <tr>
                <th className="px-5 py-3">Entreprise</th>
                <th className="px-5 py-3">Poste</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Crédits</th>
                <th className="px-5 py-3">Période</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Modifier</th>
              </tr>
            </thead>
            <tbody>
              {data.creditBalances.map((balance) => (
                <tr key={balance.id} className="border-t border-line align-top">
                  <td className="px-5 py-3" data-label="Entreprise"><Link href={`/admin/companies/${balance.company.uid}`} className="font-semibold text-ink hover:text-coral">{balance.company.name ?? balance.company.uid}</Link></td>
                  <td className="px-5 py-3" data-label="Poste">{balance.job ? <Link href={`/admin/jobs/${balance.job.uid}`} className="hover:text-coral">{balance.job.title}</Link> : "Global"}</td>
                  <td className="px-5 py-3" data-label="Plan">{balance.plan?.name ?? "-"}</td>
                  <td className="px-5 py-3" data-label="Crédits">{balance.creditsPurchased - balance.creditsUsed}/{balance.creditsPurchased}</td>
                  <td className="px-5 py-3 text-xs text-gray-600" data-label="Période">{formatDate(balance.periodStart)} → {formatDate(balance.periodEnd)}</td>
                  <td className="px-5 py-3" data-label="Statut"><Badge value={balance.active ? "ACTIVE" : "INACTIVE"} /></td>
                  <td className="px-5 py-3" data-label="Modifier">
                    <form action={updateAdminCreditBalance.bind(null, balance.uid)} className="grid min-w-[420px] grid-cols-5 gap-2">
                      <input className="field" name="creditsPurchased" type="number" defaultValue={balance.creditsPurchased} aria-label="Crédits achetés" />
                      <input className="field" name="creditsUsed" type="number" defaultValue={balance.creditsUsed} aria-label="Crédits utilisés" />
                      <input className="field" name="monthlyLimit" type="number" defaultValue={balance.monthlyLimit ?? ""} aria-label="Limite mensuelle" />
                      <label className="flex items-center justify-center gap-2 rounded-md border border-line px-2 text-xs"><input type="checkbox" name="active" defaultChecked={balance.active} /> Actif</label>
                      <button className="btn-secondary" type="submit">OK</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
