import Link from "next/link";
import { getCandidateComparisonData } from "@/actions/workflow";
import { CandidateComparisonCharts } from "@/components/dashboard/company-charts";
import { Badge } from "@/components/ui/badge";
import { CompanyAccessDenied } from "@/components/company/company-access-denied";

export default async function ComparisonPage({ params }: { params: { jobUid: string } }) {
  const data = await getCandidateComparisonData(params.jobUid).catch(() => null);
  if (!data) return <CompanyAccessDenied />;
  const { job, reports } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Comparaison candidats</h1>
        <p className="mt-1 text-gray-600">{job.title}</p>
      </div>
      <CandidateComparisonCharts reports={reports} />
      <section className="panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-mist text-gray-500">
            <tr>
              <th className="px-5 py-3">Rang</th>
              <th className="px-5 py-3">Candidat</th>
              <th className="px-5 py-3">Global</th>
              <th className="px-5 py-3">Matching</th>
              <th className="px-5 py-3">Cohérence</th>
              <th className="px-5 py-3">Sincérité</th>
              <th className="px-5 py-3">Risque</th>
              <th className="px-5 py-3">Recommandation</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, index) => (
              <tr key={report.id} className="border-t border-line">
                <td className="px-5 py-3">{index + 1}</td>
                <td className="px-5 py-3">
                  <Link href={`/company/reports/${report.uid}`} className="font-semibold text-ink hover:text-coral">
                    {report.candidate.firstName} {report.candidate.lastName}
                  </Link>
                </td>
                <td className="px-5 py-3">{Math.round(report.globalScore)}</td>
                <td className="px-5 py-3">{Math.round(report.matchingScore)}</td>
                <td className="px-5 py-3">{Math.round(report.coherenceIndex)}</td>
                <td className="px-5 py-3">{Math.round(report.sincerityIndex)}</td>
                <td className="px-5 py-3"><Badge value={report.riskLevel} /></td>
                <td className="px-5 py-3">{report.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
