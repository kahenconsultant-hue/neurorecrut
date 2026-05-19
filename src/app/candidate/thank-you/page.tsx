import Link from "next/link";

export default function CandidateThankYouPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-4">
      <div className="panel max-w-xl p-8 text-center">
        <p className="text-sm font-semibold text-teal">Évaluation transmise</p>
        <h1 className="mt-3 text-3xl font-bold text-ink">Merci</h1>
        <p className="mt-3 leading-7 text-gray-600">
          Vos réponses ont été enregistrées et verrouillées. L’entreprise recevra le rapport dans son espace NeuroRecrut.
        </p>
        <Link className="btn-secondary mt-6" href="/">
          Retour au site
        </Link>
      </div>
    </main>
  );
}
