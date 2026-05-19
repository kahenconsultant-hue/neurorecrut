import { updateCompanyProfile } from "@/actions/workflow";
import { ChoiceGroup } from "@/components/forms/choice-group";
import { COMPANY_PROFILE_CHOICE_GROUPS, COMPANY_SECTOR_OPTIONS, COMPANY_SIZE_OPTIONS } from "@/lib/form-options";
import { requireCompanyUser } from "@/lib/security";

const fields = [
  ["name", "Nom de l'entreprise"],
  ["siretSiren", "SIRET / SIREN"],
  ["website", "Site web"],
  ["address", "Adresse"],
  ["hrContactName", "Contact RH"],
  ["hrContactEmail", "Email RH"]
] as const;

const errorMessages: Record<string, string> = {
  validation: "Tous les champs obligatoires doivent être complétés."
};

export default async function CompanyProfilePage({ searchParams }: { searchParams?: { error?: string } }) {
  const { company } = await requireCompanyUser();
  const error = searchParams?.error ? errorMessages[searchParams.error] : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Profil entreprise</h1>
        <p className="mt-1 text-gray-600">Ces informations nourrissent les profils cibles et les évaluations IA.</p>
      </div>
      <form action={updateCompanyProfile.bind(null, null)} className="panel space-y-5 p-6">
        {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map(([name, label]) => (
            <div key={name}>
              <label className="label" htmlFor={name}>{label}</label>
              <input className="field" id={name} name={name} defaultValue={String(company?.[name] ?? "")} required={name !== "website"} />
            </div>
          ))}
          <div>
            <label className="label" htmlFor="sector">
              Secteur
            </label>
            <select className="field" id="sector" name="sector" defaultValue={String(company?.sector ?? COMPANY_SECTOR_OPTIONS[0])} required>
              {COMPANY_SECTOR_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="size">
              Taille
            </label>
            <select className="field" id="size" name="size" defaultValue={String(company?.size ?? COMPANY_SIZE_OPTIONS[0])} required>
              {COMPANY_SIZE_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4">
          {COMPANY_PROFILE_CHOICE_GROUPS.map((group) => (
            <ChoiceGroup key={group.name} {...group} defaultValue={String(company?.[group.name] ?? "")} defaultFirst />
          ))}
        </div>
        <button className="btn-primary" type="submit">Enregistrer</button>
      </form>
    </div>
  );
}
