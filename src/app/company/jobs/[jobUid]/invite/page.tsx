import { createCandidateInvitationFromForm } from "@/actions/workflow";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/security";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { CompanyAccessDenied } from "@/components/company/company-access-denied";

export default async function InvitePage({ params }: { params: { jobUid: string } }) {
  const { company } = await requireCompanyUser();
  const job = await prisma.jobPosition.findUniqueOrThrow({
    where: { uid: params.jobUid },
    include: { invitations: { orderBy: { createdAt: "desc" } }, evaluations: true }
  });
  if (job.companyId !== company?.id) return <CompanyAccessDenied />;
  const usableCredits = await prisma.creditBalance.findMany({
    where: {
      companyId: job.companyId,
      active: true,
      OR: [{ jobId: job.id }, { jobId: null }]
    }
  });
  const remaining = usableCredits.reduce((sum, item) => sum + item.creditsPurchased - item.creditsUsed, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Inviter un candidat</h1>
        <p className="mt-1 text-gray-600">{remaining} crédit(s) disponible(s). Un crédit sera consommé à la soumission finale.</p>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Le candidat retrouvera automatiquement l&apos;évaluation dans son espace candidat lorsque son compte utilise cet email.
        </p>
      </div>
      <form action={createCandidateInvitationFromForm} className="panel flex flex-col gap-4 p-5 md:flex-row md:items-end">
        <input type="hidden" name="jobUid" value={params.jobUid} />
        <div className="flex-1">
          <label className="label" htmlFor="candidateEmail">Email candidat</label>
          <input className="field" id="candidateEmail" name="candidateEmail" type="email" required />
        </div>
        <button className="btn-primary" type="submit" disabled={remaining <= 0 || job.evaluations.length === 0}>Créer l’invitation</button>
      </form>
      <section className="panel overflow-hidden">
        <div className="border-b border-line p-5"><h2 className="font-semibold">Invitations</h2></div>
        <div className="overflow-x-auto">
          <table className="responsive-table">
            <thead className="bg-mist text-gray-500">
              <tr><th className="px-5 py-3">Email</th><th className="px-5 py-3">Statut</th><th className="px-5 py-3">Expire</th><th className="px-5 py-3">Accès candidat</th></tr>
            </thead>
            <tbody>
              {job.invitations.map((invitation) => (
                <tr key={invitation.id} className="border-t border-line">
                  <td className="px-5 py-3" data-label="Email">{invitation.candidateEmail}</td>
                  <td className="px-5 py-3" data-label="Statut"><Badge value={invitation.status} /></td>
                  <td className="px-5 py-3" data-label="Expire">{formatDate(invitation.expiresAt)}</td>
                  <td className="px-5 py-3 text-gray-600" data-label="Accès candidat">Disponible dans l&apos;espace candidat</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
