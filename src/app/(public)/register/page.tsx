import { registerCompanyUser } from "@/actions/auth-actions";
import { ChoiceGroup } from "@/components/forms/choice-group";
import { CompanyLegalConsents } from "@/components/legal/legal-consents";
import { PublicNav } from "@/components/layout/public-nav";
import { COMPANY_PROFILE_CHOICE_GROUPS, COMPANY_SECTOR_OPTIONS, COMPANY_SIZE_OPTIONS } from "@/lib/form-options";

const errorMessages: Record<string, string> = {
  exists: "Un compte existe déjà avec cet email.",
  database: "Base de données indisponible. Vérifiez DATABASE_URL puis lancez les migrations Prisma.",
  validation: "Tous les champs obligatoires du compte et du profil entreprise doivent être complétés.",
  password_mismatch: "Les deux mots de passe doivent être identiques.",
  legal: "Vous devez accepter les documents légaux obligatoires pour créer le compte."
};

export default function RegisterPage({ searchParams }: { searchParams?: { error?: string } }) {
  const error = searchParams?.error ? errorMessages[searchParams.error] : null;

  return (
    <>
      <PublicNav />
      <main className="mx-auto min-h-[calc(100vh-73px)] max-w-6xl px-4 py-10">
        <form action={registerCompanyUser.bind(null, null)} className="panel w-full space-y-8 p-6 md:p-8">
          <div>
            <h1 className="text-2xl font-bold text-ink">Créer un compte entreprise</h1>
            <p className="mt-2 text-sm text-gray-600">
              Le profil entreprise est obligatoire dès l&apos;inscription: il sert à contextualiser les postes, les évaluations et les rapports.
            </p>
          </div>
          {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Accès administrateur RH</h2>
              <p className="text-sm text-gray-600">Ces identifiants permettront d&apos;accéder au panel entreprise.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="label" htmlFor="name">
                  Nom complet
                </label>
                <input className="field" id="name" name="name" autoComplete="name" required />
              </div>
              <div>
                <label className="label" htmlFor="email">
                  Email professionnel
                </label>
                <input className="field" id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <div>
                <label className="label" htmlFor="password">
                  Mot de passe
                </label>
                <input className="field" id="password" name="password" type="password" minLength={8} autoComplete="new-password" required />
              </div>
              <div>
                <label className="label" htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </label>
                <input
                  className="field"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Profil entreprise</h2>
              <p className="text-sm text-gray-600">Les champs structurés améliorent la précision du profil cible et des questions générées.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label" htmlFor="companyName">
                  Nom de l&apos;entreprise
                </label>
                <input className="field" id="companyName" name="companyName" required />
              </div>
              <div>
                <label className="label" htmlFor="siretSiren">
                  SIRET / SIREN
                </label>
                <input className="field" id="siretSiren" name="siretSiren" minLength={9} required />
              </div>
              <div>
                <label className="label" htmlFor="sector">
                  Secteur
                </label>
                <select className="field" id="sector" name="sector" required>
                  {COMPANY_SECTOR_OPTIONS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="size">
                  Taille
                </label>
                <select className="field" id="size" name="size" required>
                  {COMPANY_SIZE_OPTIONS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="website">
                  Site web
                </label>
                <input className="field" id="website" name="website" type="url" placeholder="https://..." />
              </div>
              <div>
                <label className="label" htmlFor="address">
                  Adresse
                </label>
                <input className="field" id="address" name="address" required />
              </div>
              <div>
                <label className="label" htmlFor="hrContactName">
                  Contact RH
                </label>
                <input className="field" id="hrContactName" name="hrContactName" required />
              </div>
              <div>
                <label className="label" htmlFor="hrContactEmail">
                  Email RH
                </label>
                <input className="field" id="hrContactEmail" name="hrContactEmail" type="email" required />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Contexte humain et organisationnel</h2>
              <p className="text-sm text-gray-600">Choisissez une ou plusieurs réponses par rubrique, puis ajoutez une précision si besoin.</p>
            </div>
            <div className="grid gap-4">
              {COMPANY_PROFILE_CHOICE_GROUPS.map((group) => (
                <ChoiceGroup key={group.name} {...group} defaultFirst />
              ))}
            </div>
          </section>

          <CompanyLegalConsents />

          <button className="btn-primary w-full" type="submit">
            Créer le compte et le profil entreprise
          </button>
        </form>
      </main>
    </>
  );
}
