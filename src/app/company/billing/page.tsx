import { createStripeCheckoutSession } from "@/actions/workflow";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/security";
import { formatCurrency, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export default async function CompanyBillingPage() {
  const { company } = await requireCompanyUser();
  const [plans, credits, purchases] = await Promise.all([
    prisma.pricingPlan.findMany({ where: { active: true }, orderBy: { priceCents: "asc" } }),
    prisma.creditBalance.findMany({
      where: {
        companyId: company?.id,
        active: true,
        OR: [{ periodEnd: null }, { periodEnd: { gt: new Date() } }]
      },
      include: { job: true, plan: true }
    }),
    prisma.purchase.findMany({ where: { companyId: company?.id }, include: { plan: true, job: true }, orderBy: { createdAt: "desc" } })
  ]);

  async function checkout(formData: FormData) {
    "use server";
    await createStripeCheckoutSession(null, String(formData.get("planCode")));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Crédits & facturation</h1>
        <p className="mt-1 text-gray-600">Les packs poste se prennent depuis la page du poste; Agency est disponible ici.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {plans.map((plan) => (
          <form key={plan.id} action={checkout} className="panel p-5">
            <input type="hidden" name="planCode" value={plan.code} />
            <h2 className="font-semibold text-ink">{plan.name}</h2>
            <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
            <p className="mt-4 text-2xl font-bold">{formatCurrency(plan.priceCents)}</p>
            <button className="btn-primary mt-5 w-full" type="submit" disabled={plan.jobScoped}>Acheter</button>
          </form>
        ))}
      </div>
      <section className="panel overflow-hidden">
        <div className="border-b border-line p-5"><h2 className="font-semibold">Balances actives</h2></div>
        <table className="responsive-table">
          <tbody>
            {credits.map((credit) => (
              <tr key={credit.id} className="border-t border-line">
                <td className="px-5 py-3" data-label="Plan">{credit.plan?.name ?? "Crédits manuels"}</td>
                <td className="px-5 py-3" data-label="Poste">{credit.job?.title ?? "Global entreprise"}</td>
                <td className="px-5 py-3" data-label="Crédits">{credit.creditsPurchased - credit.creditsUsed} restants</td>
                <td className="px-5 py-3" data-label="Validité">{credit.periodEnd ? `Jusqu'au ${formatDate(credit.periodEnd)}` : "Sans limite"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="panel overflow-hidden">
        <div className="border-b border-line p-5"><h2 className="font-semibold">Achats</h2></div>
        <table className="responsive-table">
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="border-t border-line">
                <td className="px-5 py-3" data-label="Offre">{purchase.plan.name}</td>
                <td className="px-5 py-3" data-label="Poste">{purchase.job?.title ?? "Global"}</td>
                <td className="px-5 py-3" data-label="Montant">{formatCurrency(purchase.amountCents)}</td>
                <td className="px-5 py-3" data-label="Statut"><Badge value={purchase.status} /></td>
                <td className="px-5 py-3" data-label="Date">{formatDate(purchase.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
