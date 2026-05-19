import Link from "next/link";
import { registerCandidateUser } from "@/actions/auth-actions";
import { PublicNav } from "@/components/layout/public-nav";

const errorMessages: Record<string, string> = {
  exists: "Un compte existe déjà avec cet email.",
  database: "Base de données indisponible. Réessayez dans quelques instants.",
  validation: "Tous les champs obligatoires doivent être complétés.",
  password_mismatch: "Les deux mots de passe doivent être identiques."
};

export default function CandidateRegisterPage({ searchParams }: { searchParams?: { error?: string } }) {
  const error = searchParams?.error ? errorMessages[searchParams.error] : null;

  return (
    <>
      <PublicNav />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-4 py-12">
        <form action={registerCandidateUser.bind(null, null)} className="panel w-full space-y-4 p-6">
          <div>
            <h1 className="text-2xl font-bold text-ink">Créer un compte candidat</h1>
            <p className="mt-2 text-sm text-gray-600">Vous pourrez saisir un code d’évaluation depuis votre espace.</p>
          </div>
          {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="firstName">Prénom</label>
              <input className="field" id="firstName" name="firstName" required />
            </div>
            <div>
              <label className="label" htmlFor="lastName">Nom</label>
              <input className="field" id="lastName" name="lastName" required />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input className="field" id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div>
            <label className="label" htmlFor="password">Mot de passe</label>
            <input className="field" id="password" name="password" type="password" minLength={8} autoComplete="new-password" required />
          </div>
          <div>
            <label className="label" htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input className="field" id="confirmPassword" name="confirmPassword" type="password" minLength={8} autoComplete="new-password" required />
          </div>
          <button className="btn-primary w-full" type="submit">Créer mon espace candidat</button>
          <p className="text-sm text-gray-600">
            Déjà un compte ? <Link className="font-semibold text-coral" href="/login">Connexion</Link>
          </p>
        </form>
      </main>
    </>
  );
}
