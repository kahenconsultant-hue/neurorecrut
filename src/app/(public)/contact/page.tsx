import { ContactForm } from "@/components/contact/contact-form";
import { PublicNav } from "@/components/layout/public-nav";

const errors: Record<string, string> = {
  validation: "Vérifiez les champs requis pour la catégorie sélectionnée.",
  rate: "Trop de demandes rapprochées. Réessayez un peu plus tard."
};

export default function ContactPage({ searchParams }: { searchParams?: { sent?: string; error?: string } }) {
  const error = searchParams?.error ? errors[searchParams.error] ?? "La demande n'a pas pu être validée." : null;

  return (
    <>
      <PublicNav />
      <main className="bg-white">
        <section className="border-b border-line bg-mist">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[0.78fr_1.22fr] lg:py-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-coral">Contact</p>
              <h1 className="mt-3 text-4xl font-bold text-ink">Parlons de votre besoin NeuroRecrut.</h1>
              <p className="mt-4 leading-7 text-gray-600">
                Entreprise, candidat, partenaire ou média: le formulaire adapte les informations demandées pour orienter votre message au bon endroit.
              </p>
              <div className="mt-6 rounded-lg border border-line bg-white p-5 shadow-panel">
                <p className="font-semibold text-ink">Contact direct</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Les demandes sont transmises à <span className="font-semibold text-graphite">contact@neurorecrut.com</span>. Vous recevez un email de confirmation après l&apos;envoi.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {searchParams?.sent ? (
                <p className="rounded-lg border border-teal/20 bg-teal/10 px-4 py-3 text-sm font-medium text-teal" role="status">
                  Votre demande est envoyée. Un email de confirmation vient d&apos;être transmis.
                </p>
              ) : null}
              {error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                  {error}
                </p>
              ) : null}
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
