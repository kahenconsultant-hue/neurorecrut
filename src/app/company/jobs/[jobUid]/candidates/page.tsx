import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/security";
import { Badge } from "@/components/ui/badge";
import { CompanyAccessDenied } from "@/components/company/company-access-denied";

export default async function CandidatesPage({ params }: { params: { jobUid: string } }) {
  const { company } = await requireCompanyUser();
  const job = await prisma.jobPosition.findUniqueOrThrow({
    where: { uid: params.jobUid },
    include: {
      invitations: { include: { candidate: true, response: { include: { report: true } } }, orderBy: { createdAt: "desc" } }
    }
  });
  if (job.companyId !== company?.id) return <CompanyAccessDenied />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">Candidats</h1>
          <p className="mt-1 text-gray-600">{job.title}</p>
        </div>
        <Link href={`/company/jobs/${job.uid}/comparison`} className="btn-secondary">Comparer</Link>
      </div>
      <section className="panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-mist text-gray-500">
            <tr><th className="px-5 py-3">Candidat</th><th className="px-5 py-3">Statut</th><th className="px-5 py-3">Score</th><th className="px-5 py-3">Rapport</th></tr>
          </thead>
          <tbody>
            {job.invitations.map((invitation) => (
              <tr key={invitation.id} className="border-t border-line">
                <td className="px-5 py-3">{invitation.candidate ? `${invitation.candidate.firstName} ${invitation.candidate.lastName}` : invitation.candidateEmail}</td>
                <td className="px-5 py-3"><Badge value={invitation.status} /></td>
                <td className="px-5 py-3">{invitation.response?.report?.matchingScore != null ? `${Math.round(invitation.response.report.matchingScore)}/100` : "-"}</td>
                <td className="px-5 py-3">
                  {invitation.response?.report ? (
                    <Link className="font-semibold text-coral" href={`/company/reports/${invitation.response.report.uid}`}>Ouvrir</Link>
                  ) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
