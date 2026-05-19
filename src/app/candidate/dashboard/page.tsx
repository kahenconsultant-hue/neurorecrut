import Link from "next/link";
import { getCandidateDashboardData } from "@/actions/workflow";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export default async function CandidateDashboardPage({ searchParams }: { searchParams?: { error?: string; status?: string } }) {
  const { candidate, invitations } = await getCandidateDashboardData();

  return (
    <main className="min-h-screen bg-mist px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-ink">Espace candidat</h1>
            <p className="mt-1 text-gray-600">Bonjour {candidate.firstName ?? candidate.email}. Vos évaluations disponibles apparaissent automatiquement ici.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link className="btn-secondary" href="/">Accueil</Link>
            <LogoutButton />
          </div>
        </div>

        {searchParams?.status === "already_completed" ? (
          <p className="panel border-teal/30 bg-teal/5 p-4 text-sm text-teal">Cette évaluation a déjà été complétée.</p>
        ) : null}

        <section className="panel overflow-hidden">
          <div className="border-b border-line p-5">
            <h2 className="font-semibold text-ink">Mes évaluations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-mist text-gray-500">
                <tr>
                  <th className="px-5 py-3">Poste</th>
                  <th className="px-5 py-3">Entreprise</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Expire</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((invitation) => (
                  <tr key={invitation.id} className="border-t border-line">
                    <td className="px-5 py-3 font-semibold text-ink">{invitation.job.title}</td>
                    <td className="px-5 py-3">{invitation.job.company.name ?? "Entreprise"}</td>
                    <td className="px-5 py-3"><Badge value={invitation.status} /></td>
                    <td className="px-5 py-3">{formatDate(invitation.expiresAt)}</td>
                    <td className="px-5 py-3">
                      {invitation.response?.isSubmitted ? (
                        <span className="text-gray-500">Soumise</span>
                      ) : (
                        <Link className="font-semibold text-coral" href={`/candidate/profile/${invitation.uid}`}>Continuer</Link>
                      )}
                    </td>
                  </tr>
                ))}
                {invitations.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-gray-500" colSpan={5}>Aucune évaluation pour le moment.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
