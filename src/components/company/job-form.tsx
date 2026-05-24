import { SOFT_SKILLS, SOFT_SKILL_SCALE } from "@/lib/constants";
import { createJobPosition, updateJobPosition } from "@/actions/workflow";
import { ChoiceGroup } from "@/components/forms/choice-group";
import { JOB_CHOICE_GROUPS } from "@/lib/form-options";

type JobDefaults = {
  uid?: string;
  title?: string;
  description?: string;
  mainMissions?: string;
  hardSkillsRequired?: string;
  seniorityLevel?: string;
  contractType?: string;
  location?: string;
  workMode?: string;
  teamContext?: string;
  managerProfile?: string;
  reportingLine?: string | null;
  managementStyle?: string;
  workRhythm?: string;
  mainConstraints?: string;
  expectedPerformanceIndicators?: string;
  companySpecificExpectations?: string;
  softSkillMatrix?: Record<string, number>;
};

const fields: Array<[keyof JobDefaults, string, "input" | "textarea" | "select", string[]?]> = [
  ["title", "Intitulé du poste", "input"],
  ["description", "Description du poste", "textarea"],
  ["seniorityLevel", "Niveau de séniorité", "select", ["Junior", "Confirmé", "Senior", "Lead", "Direction"]],
  ["contractType", "Type de contrat", "select", ["CDI", "CDD", "Freelance", "Stage", "Alternance"]],
  ["location", "Localisation", "input"],
  ["workMode", "Mode de travail", "select", ["Présentiel", "Hybride", "Télétravail"]]
];

export function JobForm({ job }: { job?: JobDefaults }) {
  const action = job?.uid ? updateJobPosition.bind(null, job.uid, null) : createJobPosition.bind(null, null);

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map(([name, label, type, options]) => (
          <div key={name} className={type === "textarea" ? "md:col-span-2" : ""}>
            <label className="label" htmlFor={name}>
              {label}
            </label>
            {type === "textarea" ? (
              <textarea className="field min-h-28" id={name} name={name} defaultValue={String(job?.[name] ?? "")} required />
            ) : type === "select" ? (
              <select className="field" id={name} name={name} defaultValue={String(job?.[name] ?? "")} required>
                <option value="">Sélectionner</option>
                {options?.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input className="field" id={name} name={name} defaultValue={String(job?.[name] ?? "")} required />
            )}
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Contexte structuré du poste</h2>
          <p className="text-sm text-gray-600">
            Sélectionnez une ou plusieurs options par rubrique. Ces choix rendent le profil cible et le test plus précis.
          </p>
        </div>
        <div className="grid gap-4">
          {JOB_CHOICE_GROUPS.map((group) => (
            <ChoiceGroup
              key={group.name}
              {...group}
              defaultValue={String(job?.[group.name as keyof JobDefaults] ?? "")}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-ink">Matrice soft skills</h2>
          <p className="text-sm text-gray-600">0 = sans importance, 5 = indispensable.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {SOFT_SKILLS.map((skill) => (
            <div key={skill} className="rounded-md border border-line bg-white p-3">
              <label className="label" htmlFor={`softSkill.${skill}`}>
                {skill}
              </label>
              <select
                className="field"
                id={`softSkill.${skill}`}
                name={`softSkill.${skill}`}
                defaultValue={job?.softSkillMatrix?.[skill] ?? 3}
              >
                {SOFT_SKILL_SCALE.map((label, index) => (
                  <option key={label} value={String(index)}>
                    {index} - {label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>

      <button className="btn-primary" type="submit">
        {job?.uid ? "Mettre à jour le poste" : "Créer le poste"}
      </button>
    </form>
  );
}
