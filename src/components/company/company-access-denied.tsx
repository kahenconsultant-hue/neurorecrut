import Link from "next/link";

export function CompanyAccessDenied() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <section className="panel p-6">
        <p className="text-sm font-semibold uppercase text-coral">Acces limite</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">Ce poste n&apos;est pas accessible depuis ce compte.</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          La page demandee appartient a une autre entreprise ou n&apos;est plus disponible. Revenez a la liste des postes pour continuer.
        </p>
        <Link href="/company/jobs" className="btn-primary mt-5 inline-flex">
          Retour aux postes
        </Link>
      </section>
    </div>
  );
}
