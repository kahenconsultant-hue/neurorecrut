import Link from "next/link";
import { PublicNav } from "@/components/layout/public-nav";
import { PRICING_SEED } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

export default function PricingPage() {
  return (
    <>
      <PublicNav />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold text-ink">Tarifs</h1>
          <p className="mt-3 text-gray-600">
            Les postes sont gratuits. Les invitations candidat consomment des crédits activés uniquement après paiement Stripe confirmé.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {PRICING_SEED.map((plan) => (
            <div key={plan.code} className="panel flex flex-col p-5">
              <h2 className="text-lg font-semibold text-ink">{plan.name}</h2>
              <p className="mt-2 min-h-12 text-sm text-gray-600">{plan.description}</p>
              <p className="mt-5 text-3xl font-bold text-ink">{formatCurrency(plan.priceCents)}</p>
              <p className="mt-1 text-sm text-gray-500">{plan.monthly ? "par mois" : "paiement unique"}</p>
              <p className="mt-5 text-sm font-medium text-graphite">{plan.credits} crédits inclus</p>
              <Link href="/register" className="btn-primary mt-6">
                Choisir
              </Link>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
