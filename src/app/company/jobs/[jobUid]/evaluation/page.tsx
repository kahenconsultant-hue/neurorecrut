import Link from "next/link";
import { generateEvaluation } from "@/actions/workflow";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/security";
import { CompanyAccessDenied } from "@/components/company/company-access-denied";
import { Badge } from "@/components/ui/badge";
import type { EvaluationJson, QuestionType } from "@/types/evaluation";

export default async function EvaluationPage({ params }: { params: { jobUid: string } }) {
  const { company } = await requireCompanyUser();
  const job = await prisma.jobPosition.findUniqueOrThrow({
    where: { uid: params.jobUid },
    include: {
      evaluations: { orderBy: { createdAt: "desc" }, take: 1 },
      reports: {
        include: { candidate: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });
  if (job.companyId !== company?.id) return <CompanyAccessDenied />;
  const evaluation = job.evaluations[0];
  const evaluationJson = evaluation?.json as EvaluationJson | undefined;
  const blocks = evaluationJson?.blocks ?? [];
  const questions = blocks.flatMap((block) => block.questions);
  const typeCounts = questions.reduce<Record<QuestionType, number>>((acc, question) => {
    acc[question.type] = (acc[question.type] ?? 0) + 1;
    return acc;
  }, {} as Record<QuestionType, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">Évaluation interne</h1>
          <p className="mt-1 text-gray-600">{evaluation ? "Évaluation générée et stockée." : "Aucune évaluation générée."}</p>
        </div>
        <form action={generateEvaluation.bind(null, params.jobUid)}>
          <button className="btn-primary" type="submit">Générer l’évaluation</button>
        </form>
      </div>

      {evaluationJson ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <div className="panel p-5">
              <p className="text-sm text-gray-500">Blocs</p>
              <p className="mt-2 text-3xl font-bold text-ink">{blocks.length}</p>
            </div>
            <div className="panel p-5">
              <p className="text-sm text-gray-500">Questions</p>
              <p className="mt-2 text-3xl font-bold text-ink">{questions.length}</p>
            </div>
            <div className="panel p-5">
              <p className="text-sm text-gray-500">QCM et choix forcés</p>
              <p className="mt-2 text-3xl font-bold text-ink">{(typeCounts.QCM ?? 0) + (typeCounts.FORCED_CHOICE ?? 0)}</p>
            </div>
            <div className="panel p-5">
              <p className="text-sm text-gray-500">Rapports disponibles</p>
              <p className="mt-2 text-3xl font-bold text-ink">{job.reports.length}</p>
            </div>
          </section>

          <section className="grid gap-4">
            {blocks.map((block) => (
              <article key={block.block_id} className="panel p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-ink">{block.name}</h2>
                  <Badge value={`${block.questions.length} questions`} />
                </div>
                <div className="mt-5 grid gap-3">
                  {block.questions.map((question, index) => (
                    <div key={question.question_uid} className="rounded-md border border-line bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-graphite">Question {index + 1}</p>
                        <span className="rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-gray-600">{question.type}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-ink">{question.question_text}</p>
                      {question.choices.length > 0 ? (
                        <ul className="mt-3 grid gap-2 text-sm text-gray-700 md:grid-cols-2">
                          {question.choices.map((choice, choiceIndex) => (
                            <li key={choice.choice_uid} className="rounded-md bg-mist px-3 py-2">
                              {String.fromCharCode(65 + choiceIndex)}. {choice.label}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>

          <section className="panel overflow-hidden">
            <div className="border-b border-line p-5">
              <h2 className="font-semibold text-ink">Rapports liés à cette évaluation</h2>
              <p className="mt-1 text-sm text-gray-600">Les rapports complétés sont accessibles ici et dans la page candidats.</p>
            </div>
            <table className="responsive-table">
              <thead className="bg-mist text-gray-500">
                <tr><th className="px-5 py-3">Candidat</th><th className="px-5 py-3">Matching</th><th className="px-5 py-3">Risque</th><th className="px-5 py-3">Rapport</th></tr>
              </thead>
              <tbody>
                {job.reports.map((report) => (
                  <tr key={report.id} className="border-t border-line">
                    <td className="px-5 py-3" data-label="Candidat">{report.candidate.firstName} {report.candidate.lastName}</td>
                    <td className="px-5 py-3" data-label="Matching">{Math.round(report.matchingScore)}/100</td>
                    <td className="px-5 py-3" data-label="Risque"><Badge value={report.riskLevel} /></td>
                    <td className="px-5 py-3" data-label="Rapport"><Link className="font-semibold text-coral" href={`/company/reports/${report.uid}`}>Ouvrir</Link></td>
                  </tr>
                ))}
                {job.reports.length === 0 ? (
                  <tr className="border-t border-line">
                    <td className="px-5 py-6 text-gray-500" colSpan={4}>Aucun rapport disponible pour le moment.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </section>
        </>
      ) : (
        <section className="panel p-6">
          <h2 className="text-lg font-semibold text-ink">Aucune évaluation générée</h2>
          <p className="mt-2 text-sm text-gray-600">Générez une évaluation pour activer les invitations candidat sur ce poste.</p>
        </section>
      )}
    </div>
  );
}
