import Link from "next/link";
import { getAdminDashboardData } from "@/actions/workflow";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export default async function AdminResponsesPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Réponses d&apos;évaluation</h1>
        <p className="mt-2 text-sm text-gray-600">Réponses brutes, drafts autosauvegardés, statut de soumission et rapport généré.</p>
      </div>
      <section className="panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-mist text-gray-500">
            <tr>
              <th className="px-5 py-3">Réponse</th>
              <th className="px-5 py-3">Entreprise</th>
              <th className="px-5 py-3">Poste</th>
              <th className="px-5 py-3">Candidat</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Rapport</th>
              <th className="px-5 py-3">MAJ</th>
            </tr>
          </thead>
          <tbody>
            {data.responses.map((response) => (
              <tr key={response.id} className="border-t border-line">
                <td className="px-5 py-3">
                  <Link href={`/admin/responses/${response.uid}`} className="font-semibold text-ink hover:text-coral">
                    {response.uid}
                  </Link>
                </td>
                <td className="px-5 py-3"><Link href={`/admin/companies/${response.company.uid}`} className="hover:text-coral">{response.company.name ?? response.company.uid}</Link></td>
                <td className="px-5 py-3"><Link href={`/admin/jobs/${response.job.uid}`} className="hover:text-coral">{response.job.title}</Link></td>
                <td className="px-5 py-3"><Link href={`/admin/candidates/${response.candidate.uid}`} className="hover:text-coral">{response.candidate.email}</Link></td>
                <td className="px-5 py-3"><Badge value={response.isSubmitted ? "COMPLETED" : "DRAFT"} /></td>
                <td className="px-5 py-3">
                  {response.report ? <Link href={`/admin/reports/${response.report.uid}`} className="text-coral">Ouvrir</Link> : "-"}
                </td>
                <td className="px-5 py-3">{formatDate(response.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
