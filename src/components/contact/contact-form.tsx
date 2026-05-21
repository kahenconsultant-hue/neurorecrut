"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { submitContactRequest } from "@/actions/contact-actions";
import { CONTACT_CATEGORY_OPTIONS } from "@/lib/support";

type ContactCategory = (typeof CONTACT_CATEGORY_OPTIONS)[number]["value"];

function SelectField({
  id,
  label,
  name,
  children,
  required
}: {
  id: string;
  label: string;
  name: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={id}>
      <span className="label">{label}</span>
      <select className="field" id={id} name={name} required={required}>
        {children}
      </select>
    </label>
  );
}

export function ContactForm() {
  const [category, setCategory] = useState<ContactCategory>("COMPANY");

  return (
    <form action={submitContactRequest} className="panel space-y-6 p-5 md:p-7">
      <div>
        <label className="label" htmlFor="category">Vous contactez NeuroRecrut en tant que</label>
        <select
          className="field"
          id="category"
          name="category"
          value={category}
          onChange={(event) => setCategory(event.target.value as ContactCategory)}
          required
        >
          {CONTACT_CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          {CONTACT_CATEGORY_OPTIONS.find((option) => option.value === category)?.description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label htmlFor="firstName">
          <span className="label">Prénom</span>
          <input className="field" id="firstName" name="firstName" autoComplete="given-name" required />
        </label>
        <label htmlFor="lastName">
          <span className="label">Nom</span>
          <input className="field" id="lastName" name="lastName" autoComplete="family-name" required />
        </label>
        <label htmlFor="email">
          <span className="label">Email</span>
          <input className="field" id="email" name="email" type="email" autoComplete="email" required />
        </label>
        <label htmlFor="phone">
          <span className="label">Téléphone</span>
          <input className="field" id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+33..." />
        </label>
      </div>

      {category === "COMPANY" ? (
        <div className="grid gap-4 rounded-lg border border-line bg-mist p-4 md:grid-cols-2">
          <label htmlFor="organization">
            <span className="label">Entreprise</span>
            <input className="field" id="organization" name="organization" autoComplete="organization" required />
          </label>
          <label htmlFor="role">
            <span className="label">Fonction</span>
            <input className="field" id="role" name="role" placeholder="DRH, recruteur, dirigeant..." />
          </label>
          <SelectField id="companySize" label="Taille de l'entreprise" name="companySize">
            <option value="">À préciser si utile</option>
            <option>1-10 collaborateurs</option>
            <option>11-50 collaborateurs</option>
            <option>51-200 collaborateurs</option>
            <option>201-1000 collaborateurs</option>
            <option>1000+ collaborateurs</option>
          </SelectField>
          <SelectField id="recruitmentNeed" label="Besoin principal" name="recruitmentNeed">
            <option value="">Sélectionner</option>
            <option>Découvrir NeuroRecrut</option>
            <option>Première évaluation gratuite</option>
            <option>Déployer sur plusieurs postes</option>
            <option>Question commerciale ou facturation</option>
          </SelectField>
        </div>
      ) : null}

      {category === "CANDIDATE" ? (
        <div className="grid gap-4 rounded-lg border border-line bg-mist p-4 md:grid-cols-2">
          <SelectField id="candidateTopic" label="Sujet candidat" name="candidateTopic" required>
            <option value="">Sélectionner</option>
            <option>Invitation ou accès à une évaluation</option>
            <option>Compte candidat</option>
            <option>Question sur le déroulé de l&apos;évaluation</option>
            <option>Demande liée à mes données</option>
          </SelectField>
          <label htmlFor="evaluationReference">
            <span className="label">Référence utile</span>
            <input className="field" id="evaluationReference" name="evaluationReference" placeholder="Entreprise, poste ou invitation" />
          </label>
        </div>
      ) : null}

      {category === "PARTNERSHIP" ? (
        <div className="grid gap-4 rounded-lg border border-line bg-mist p-4 md:grid-cols-2">
          <label htmlFor="partnershipOrganization">
            <span className="label">Organisation</span>
            <input className="field" id="partnershipOrganization" name="organization" autoComplete="organization" required />
          </label>
          <SelectField id="partnershipType" label="Proposition" name="partnershipType" required>
            <option value="">Sélectionner</option>
            <option>Cabinet RH ou recrutement</option>
            <option>Intégration technique</option>
            <option>Partenariat commercial</option>
            <option>Recherche ou expertise métier</option>
          </SelectField>
          <label className="md:col-span-2" htmlFor="website">
            <span className="label">Site web</span>
            <input className="field" id="website" name="website" type="url" placeholder="https://..." />
          </label>
        </div>
      ) : null}

      {category === "PRESS" ? (
        <div className="grid gap-4 rounded-lg border border-line bg-mist p-4 md:grid-cols-2">
          <label htmlFor="mediaName">
            <span className="label">Média ou publication</span>
            <input className="field" id="mediaName" name="mediaName" required />
          </label>
          <label htmlFor="mediaDeadline">
            <span className="label">Échéance souhaitée</span>
            <input className="field" id="mediaDeadline" name="mediaDeadline" type="date" required />
          </label>
          <label className="md:col-span-2" htmlFor="pressOrganization">
            <span className="label">Organisation</span>
            <input className="field" id="pressOrganization" name="organization" />
          </label>
        </div>
      ) : null}

      {category === "DATA_PRIVACY" ? (
        <div className="grid gap-4 rounded-lg border border-line bg-mist p-4 md:grid-cols-2">
          <SelectField id="privacyRequest" label="Type de demande" name="privacyRequest" required>
            <option value="">Sélectionner</option>
            <option>Accès à mes données</option>
            <option>Rectification</option>
            <option>Suppression ou opposition</option>
            <option>Consentement candidat</option>
            <option>Question confidentialité</option>
          </SelectField>
          <label htmlFor="privacyAccountEmail">
            <span className="label">Email de compte concerné</span>
            <input className="field" id="privacyAccountEmail" name="accountEmail" type="email" placeholder="Si différent" />
          </label>
        </div>
      ) : null}

      {category === "TECHNICAL" ? (
        <div className="grid gap-4 rounded-lg border border-line bg-mist p-4 md:grid-cols-2">
          <label htmlFor="technicalAccountEmail">
            <span className="label">Email de compte concerné</span>
            <input className="field" id="technicalAccountEmail" name="accountEmail" type="email" required />
          </label>
          <SelectField id="technicalArea" label="Zone impactée" name="technicalArea" required>
            <option value="">Sélectionner</option>
            <option>Connexion ou inscription</option>
            <option>Profil entreprise</option>
            <option>Évaluation candidat</option>
            <option>Rapport ou PDF</option>
            <option>Paiement ou crédits</option>
          </SelectField>
        </div>
      ) : null}

      <div className="grid gap-4">
        <label htmlFor="subject">
          <span className="label">Objet</span>
          <input className="field" id="subject" name="subject" required placeholder="Décrivez le sujet en une ligne" />
        </label>
        <label htmlFor="message">
          <span className="label">Message</span>
          <textarea
            className="field min-h-40"
            id="message"
            name="message"
            minLength={20}
            required
            placeholder="Donnez le contexte, l'objectif ou le blocage. Ajoutez les informations utiles sans partager de données sensibles non nécessaires."
          />
        </label>
      </div>

      <button className="btn-primary w-full sm:w-auto" type="submit">
        <Send className="h-4 w-4" />
        Envoyer la demande
      </button>
    </form>
  );
}
