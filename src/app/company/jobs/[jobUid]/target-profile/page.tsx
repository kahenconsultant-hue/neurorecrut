import { generateTargetProfile } from "@/actions/workflow";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/security";
import { CompanyAccessDenied } from "@/components/company/company-access-denied";

const sectionLabels: Record<string, string> = {
  cognitive_expectations: "Attentes cognitives",
  behavioral_expectations: "Attentes comportementales",
  emotional_stress_expectations: "Stress et régulation émotionnelle",
  communication_expectations: "Communication",
  technical_expectations: "Attentes techniques",
  team_compatibility_expectations: "Compatibilité équipe",
  manager_compatibility_expectations: "Compatibilité manager",
  risk_factors_to_detect: "Points de vigilance",
  priority_criteria: "Critères prioritaires"
};

function labelize(key: string) {
  return sectionLabels[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function TextList({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    return (
      <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
        {value.map((item, index) => (
          <li key={index} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
            <span>{typeof item === "object" && item !== null ? Object.values(item).join(" - ") : String(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (value && typeof value === "object") {
    return (
      <div className="mt-3 grid gap-2">
        {Object.entries(value as Record<string, unknown>).map(([key, item]) => (
          <div key={key} className="rounded-md bg-mist p-3">
            <p className="text-xs font-semibold uppercase text-gray-500">{labelize(key)}</p>
            <TextList value={item} />
          </div>
        ))}
      </div>
    );
  }

  return <p className="mt-3 text-sm leading-6 text-gray-700">{String(value ?? "Non renseigné")}</p>;
}

export default async function TargetProfilePage({ params }: { params: { jobUid: string } }) {
  const { company } = await requireCompanyUser();
  const job = await prisma.jobPosition.findUniqueOrThrow({ where: { uid: params.jobUid } });
  if (job.companyId !== company?.id) return <CompanyAccessDenied />;
  const profile = job.targetProfile as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">Profil cible</h1>
          <p className="mt-1 text-gray-600">{job.title}</p>
        </div>
        <form action={generateTargetProfile.bind(null, params.jobUid)}>
          <button className="btn-primary" type="submit">Générer le profil cible</button>
        </form>
      </div>
      {profile ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(profile).map(([key, value]) => (
            <section key={key} className="panel p-5">
              <h2 className="text-lg font-semibold text-ink">{labelize(key)}</h2>
              <TextList value={value} />
            </section>
          ))}
        </div>
      ) : (
        <section className="panel p-6">
          <h2 className="text-lg font-semibold text-ink">Aucun profil cible généré</h2>
          <p className="mt-2 text-sm text-gray-600">Générez le profil cible pour structurer l’évaluation interne du poste.</p>
        </section>
      )}
    </div>
  );
}
