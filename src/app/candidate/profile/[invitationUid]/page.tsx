import Image from "next/image";
import { saveCandidateProfile, validateInvitation } from "@/actions/workflow";
import { CandidateLegalConsents } from "@/components/legal/legal-consents";

const roleOptions = [
  "Commercial B2B",
  "Responsable commercial",
  "Account Executive",
  "Business Developer",
  "Customer Success",
  "Manager commercial",
  "Consultant",
  "Autre fonction"
];

const educationOptions = [
  "Bac",
  "Bac+2",
  "Bac+3",
  "Bac+5",
  "École de commerce",
  "École d’ingénieur",
  "Formation professionnelle",
  "Autre"
];

const availabilityOptions = [
  "Immédiate",
  "Sous 2 semaines",
  "Sous 1 mois",
  "Sous 2 mois",
  "À définir"
];

const mobilityOptions = [
  "Sur site",
  "Hybride",
  "Télétravail",
  "Mobilité régionale",
  "Mobilité nationale",
  "À discuter"
];

const workPreferenceOptions = [
  "Autonomie avec points réguliers",
  "Cadre structuré et objectifs précis",
  "Environnement collaboratif",
  "Rythme commercial soutenu",
  "Cycle long et vente conseil",
  "Organisation flexible"
];

const skillOptions = [
  "Prospection",
  "Négociation",
  "Closing",
  "Gestion grands comptes",
  "CRM / pipeline",
  "Relation client",
  "Coordination interne",
  "Analyse commerciale"
];

function SelectField({
  name,
  label,
  options,
  defaultValue,
  required = true
}: {
  name: string;
  label: string;
  options: string[];
  defaultValue?: string | null;
  required?: boolean;
}) {
  const safeDefault = defaultValue && options.includes(defaultValue) ? defaultValue : "";

  return (
    <label>
      <span className="label">{label}</span>
      <select className="field" name={name} defaultValue={safeDefault} required={required}>
        <option value="" disabled={required}>{required ? "Choisir" : "Optionnel"}</option>
        {defaultValue && !options.includes(defaultValue) ? <option value={defaultValue}>{defaultValue}</option> : null}
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

export default async function CandidateProfilePage({ params, searchParams }: { params: { invitationUid: string }; searchParams?: { error?: string } }) {
  const invitation = await validateInvitation(params.invitationUid);
  const candidate = invitation.candidate;
  const resume = (candidate?.resumeJson ?? {}) as Record<string, string | null | undefined>;
  const error = searchParams?.error === "legal" ? "Vous devez accepter les documents légaux obligatoires pour accéder à l’évaluation." : null;

  return (
    <main className="min-h-screen bg-mist px-4 py-8">
      <form action={saveCandidateProfile.bind(null, params.invitationUid, null)} className="mx-auto max-w-3xl panel overflow-hidden">
        <div className="border-b border-line bg-white px-6 py-5">
          <Image src="/neurorecrut-logo.png" alt="NeuroRecrut" width={210} height={74} className="h-auto w-44" priority />
          <h1 className="mt-5 text-2xl font-bold text-ink">Profil rapide candidat</h1>
          <p className="mt-1 text-sm text-gray-600">
            Quelques informations essentielles seulement. L’objectif est de démarrer l’évaluation rapidement.
          </p>
        </div>

        <div className="space-y-5 p-6">
          {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <section>
            <h2 className="font-semibold text-ink">Identité</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label><span className="label">Prénom</span><input className="field" name="firstName" defaultValue={candidate?.firstName ?? ""} required /></label>
              <label><span className="label">Nom</span><input className="field" name="lastName" defaultValue={candidate?.lastName ?? ""} required /></label>
              <label><span className="label">Email</span><input className="field" name="email" type="email" defaultValue={candidate?.email ?? invitation.candidateEmail} required /></label>
              <label><span className="label">Téléphone</span><input className="field" name="phone" defaultValue={candidate?.phone ?? ""} /></label>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-ink">Situation professionnelle</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <SelectField name="currentRole" label="Fonction actuelle ou récente" options={roleOptions} defaultValue={candidate?.currentRole} />
              <label>
                <span className="label">Années d’expérience</span>
                <select className="field" name="experienceYears" defaultValue={String(candidate?.experienceYears ?? "")} required>
                  <option value="" disabled>Choisir</option>
                  {[0, 1, 2, 3, 4, 5, 7, 10, 15, 20].map((year) => (
                    <option key={year} value={year}>{year === 0 ? "Moins d’un an" : `${year}+ ans`}</option>
                  ))}
                </select>
              </label>
              <SelectField name="education" label="Niveau de formation" options={educationOptions} defaultValue={candidate?.education} />
              <SelectField name="availability" label="Disponibilité" options={availabilityOptions} defaultValue={candidate?.availability} />
              <SelectField name="mobility" label="Mobilité / mode souhaité" options={mobilityOptions} defaultValue={candidate?.mobility} />
              <SelectField name="workPreferences" label="Préférence de travail" options={workPreferenceOptions} defaultValue={candidate?.workPreferences} />
            </div>
          </section>

          <section className="rounded-md border border-line bg-mist p-4">
            <h2 className="font-semibold text-ink">Informations optionnelles</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label><span className="label">LinkedIn</span><input className="field" name="linkedin" defaultValue={candidate?.linkedin ?? ""} placeholder="https://linkedin.com/in/..." /></label>
              <SelectField name="keySkills" label="Compétence dominante" options={skillOptions} defaultValue={resume.key_skills} required={false} />
            </div>
          </section>

          <input type="hidden" name="cvUrl" value={candidate?.cvUrl ?? ""} />
          <input type="hidden" name="salaryExpectations" value="" />
          <input type="hidden" name="motivation" value="" />
          <input type="hidden" name="headline" value={candidate?.currentRole ?? ""} />
          <input type="hidden" name="professionalSummary" value="" />
          <input type="hidden" name="technicalSkills" value="" />
          <input type="hidden" name="languages" value="" />
          <input type="hidden" name="experienceJson" value="" />
          <input type="hidden" name="educationJson" value={candidate?.education ?? ""} />
          <input type="hidden" name="certifications" value="" />
          <input type="hidden" name="projects" value="" />
          <input type="hidden" name="achievements" value="" />
          <input type="hidden" name="portfolioUrl" value="" />
          <input type="hidden" name="references" value="" />

          <CandidateLegalConsents />

          <button className="btn-primary w-full md:w-auto" type="submit">Accéder à l’évaluation</button>
        </div>
      </form>
    </main>
  );
}
