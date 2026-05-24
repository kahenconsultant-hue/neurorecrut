import { createCandidateInvitationFromForm } from "@/actions/workflow";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/security";

function availableCreditsForJob(
  balances: Array<{ jobId: string | null; creditsPurchased: number; creditsUsed: number }>,
  jobId: string
) {
  return balances
    .filter((balance) => balance.jobId === null || balance.jobId === jobId)
    .reduce((sum, balance) => sum + balance.creditsPurchased - balance.creditsUsed, 0);
}

export default async function CompanyInvitationsPage() {
  const { company } = await requireCompanyUser();
  if (!company) return null;

  const now = new Date();
  const [jobs, invitations, balances] = await Promise.all([
    prisma.jobPosition.findMany({
      where: { companyId: company.id, status: { not: "ARCHIVED" } },
      include: { evaluations: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.evaluationInvitation.findMany({
      where: { companyId: company.id },
      include: { job: true, candidate: true, response: { include: { report: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.creditBalance.findMany({
      where: {
        companyId: company.id,
        active: true,
        OR: [{ periodEnd: null }, { periodEnd: { gt: now } }]
      },
      select: { jobId: true, creditsPurchased: true, creditsUsed: true }
    })
  ]);

  const jobsWithEvaluation = jobs.filter((job) => job.evaluations.length > 0);
  const totalRemaining = balances.reduce((sum, balance) => sum + balance.creditsPurchased - balance.creditsUsed, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-coral">Invitation des candidats</p>
          <h1 className="text-3xl font-bold text-ink">Invitations candidates</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Envoyez une invitation à une évaluation générée, puis suivez les statuts candidat jusqu&apos;au rapport.
          </p>
        </div>
        <div className="panel px-4 py-3 text-sm">
          <p className="text-gray-500">Crédits disponibles</p>
          <p className="mt-1 text-2xl font-bold text-ink">{totalRemaining}</p>
        </div>
      </div>

      <form action={createCandidateInvitationFromForm} className="panel grid gap-4 p-5 lg:grid-cols-[1.1fr_1fr_auto] lg:items-end">
        <label>
          <span className="label">Poste évalué</span>
          <select className="field" name="jobUid" required defaultValue="">
            <option value="">Sélectionner un poste avec évaluation générée</option>
            {jobsWithEvaluation.map((job) => {
              const remaining = availableCreditsForJob(balances, job.id);
              return (
                <option key={job.uid} value={job.uid} disabled={remaining <= 0}>
                  {job.title} · {remaining} crédit(s)
                </option>
              );
            })}
          </select>
        </label>
        <label>
          <span className="label">Email candidat</span>
          <input className="field" name="candidateEmail" type="email" required placeholder="candidat@exemple.fr" />
        </label>
        <button className="btn-primary min-h-10" type="submit" disabled={jobsWithEvaluation.length === 0 || totalRemaining <= 0}>
          Envoyer l&apos;invitation
        </button>
      </form>

      <section className="panel overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-semibold text-ink">Historique des invitations</h2>
        </div>
        <table className="responsive-table">
          <thead className="bg-mist text-gray-500">
            <tr>
              <th className="px-5 py-3">Candidat</th>
              <th className="px-5 py-3">Poste</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Expire</th>
              <th className="px-5 py-3">Rapport</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((invitation) => (
              <tr key={invitation.id} className="border-t border-line">
                <td className="px-5 py-3" data-label="Candidat">
                  <p className="font-semibold text-ink">{invitation.candidate?.firstName ? `${invitation.candidate.firstName} ${invitation.candidate.lastName ?? ""}` : invitation.candidateEmail}</p>
                  <p className="text-xs text-gray-500">{invitation.candidateEmail}</p>
                </td>
                <td className="px-5 py-3" data-label="Poste">{invitation.job.title}</td>
                <td className="px-5 py-3" data-label="Statut"><Badge value={invitation.status} /></td>
                <td className="px-5 py-3" data-label="Expire">{formatDate(invitation.expiresAt)}</td>
                <td className="px-5 py-3" data-label="Rapport">
                  {invitation.response?.report ? "Disponible" : "-"}
                </td>
              </tr>
            ))}
            {invitations.length === 0 ? (
              <tr><td className="px-5 py-6 text-sm text-gray-500" colSpan={5}>Aucune invitation pour le moment.</td></tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
