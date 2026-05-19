import Link from "next/link";
import { validateInvitation } from "@/actions/workflow";

export default async function CandidateStartPage({ params }: { params: { invitationUid: string } }) {
  const invitation = await validateInvitation(params.invitationUid);

  return (
    <main className="min-h-screen bg-mist px-4 py-10">
      <div className="mx-auto max-w-2xl panel p-6">
        <p className="text-sm font-semibold text-teal">Invitation sécurisée</p>
        <h1 className="mt-3 text-3xl font-bold text-ink">Évaluation pour {invitation.job.title}</h1>
        <p className="mt-3 leading-7 text-gray-600">
          Vous allez compléter votre profil puis répondre à une évaluation contextualisée. Les scores et critères internes ne sont pas affichés côté candidat.
        </p>
        <div className="mt-6 rounded-md bg-mist p-4 text-sm text-gray-700">
          Entreprise: {invitation.company.name ?? "Entreprise"}<br />
          Email invité: {invitation.candidateEmail}
        </div>
        <Link className="btn-primary mt-6" href={`/candidate/profile/${params.invitationUid}`}>
          Commencer
        </Link>
      </div>
    </main>
  );
}
