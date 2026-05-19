import { JobForm } from "@/components/company/job-form";
import { requireCompanyUser } from "@/lib/security";

export default async function NewJobPage({ searchParams }: { searchParams?: { error?: string } }) {
  await requireCompanyUser();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Nouveau poste</h1>
        <p className="mt-1 text-gray-600">Le contexte complet améliore la qualité du profil cible et de l’évaluation.</p>
      </div>
      {searchParams?.error === "validation" ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Vérifiez les champs requis. Les textes doivent être suffisamment détaillés pour générer une évaluation fiable.
        </p>
      ) : null}
      <div className="panel p-6">
        <JobForm />
      </div>
    </div>
  );
}
