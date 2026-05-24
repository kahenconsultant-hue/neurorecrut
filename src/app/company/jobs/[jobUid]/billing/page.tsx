import { createStripeCheckoutSession } from "@/actions/workflow";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/security";
import { formatCurrency } from "@/lib/format";
import { CompanyAccessDenied } from "@/components/company/company-access-denied";

export default async function JobBillingPage({ params }: { params: { jobUid: string } }) {
  const { company } = await requireCompanyUser();
  const job = await prisma.jobPosition.findUniqueOrThrow({
    where: { uid: params.jobUid },
    include: { creditBalances: true }
  });
  if (job.companyId !== company?.id) return <CompanyAccessDenied />;
  const plans = await prisma.pricingPlan.findMany({ where: { active: true, jobScoped: true }, orderBy: { priceCents: "asc" } });
  const now = new Date();
  const remaining = job.creditBalances
    .filter((item) => !item.periodEnd || item.periodEnd > now)
    .reduce((sum, item) => sum + item.creditsPurchased - item.creditsUsed, 0);

  async function checkout(formData: FormData) {
    "use server";
    await createStripeCheckoutSession(params.jobUid, String(formData.get("planCode")));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Crédits du poste</h1>
        <p className="mt-1 text-gray-600">{remaining} crédit(s) disponible(s) pour {job.title}.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <form key={plan.id} action={checkout} className="panel flex flex-col p-5">
            <input type="hidden" name="planCode" value={plan.code} />
            <h2 className="text-lg font-semibold text-ink">{plan.name}</h2>
            <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
            <p className="mt-5 text-3xl font-bold text-ink">{formatCurrency(plan.priceCents, plan.currency)}</p>
            <p className="mt-2 text-sm font-medium text-graphite">{plan.credits} invitations</p>
            <button className="btn-primary mt-6" type="submit">Payer avec Stripe</button>
          </form>
        ))}
      </div>
    </div>
  );
}
