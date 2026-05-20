import { LegalModalLink } from "@/components/legal/legal-modal-link";

const linkClass = "font-semibold text-coral underline-offset-2 hover:underline";

export function CompanyLegalConsents() {
  return (
    <section className="rounded-lg border border-line bg-mist/60 p-4">
      <label className="flex items-start gap-3 text-sm leading-6 text-gray-700">
        <input className="mt-1 h-4 w-4 rounded border-line text-ink" type="checkbox" name="acceptCompanyLegal" value="yes" required />
        <span>
          Je confirme accepter les <LegalModalLink slug="cgu-neurorecrut" className={linkClass}>CGU</LegalModalLink>, les{" "}
          <LegalModalLink slug="cgv-saas-b2b" className={linkClass}>CGV SaaS B2B</LegalModalLink>, la{" "}
          <LegalModalLink slug="politique-confidentialite" className={linkClass}>Politique de confidentialité</LegalModalLink>, la{" "}
          <LegalModalLink slug="politique-cookies" className={linkClass}>Politique cookies</LegalModalLink> et la{" "}
          <LegalModalLink slug="charte-ia-responsable" className={linkClass}>Charte d’utilisation responsable de l’IA</LegalModalLink>.
        </span>
      </label>
    </section>
  );
}

export function CandidateLegalConsents() {
  return (
    <section className="rounded-lg border border-line bg-mist/60 p-4">
      <label className="flex items-start gap-3 text-sm leading-6 text-gray-700">
        <input className="mt-1 h-4 w-4 rounded border-line text-ink" type="checkbox" name="acceptCandidateLegal" value="yes" required />
        <span>
          Je confirme accepter les <LegalModalLink slug="cgu-neurorecrut" className={linkClass}>CGU</LegalModalLink>, la{" "}
          <LegalModalLink slug="politique-confidentialite" className={linkClass}>Politique de confidentialité</LegalModalLink>, la{" "}
          <LegalModalLink slug="politique-cookies" className={linkClass}>Politique cookies</LegalModalLink>, la{" "}
          <LegalModalLink slug="charte-ia-responsable" className={linkClass}>Charte IA</LegalModalLink> et le{" "}
          <LegalModalLink slug="consentement-candidat" className={linkClass}>Consentement candidat</LegalModalLink>.
        </span>
      </label>
    </section>
  );
}
