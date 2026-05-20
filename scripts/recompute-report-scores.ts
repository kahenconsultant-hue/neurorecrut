import { Prisma, RiskLevel } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { fallbackQualitativeAnalysis } from "../src/lib/ai/fallbacks";
import { createReportPdfBuffer, type ReportPdfMetadata } from "../src/lib/pdf/report-pdf";
import { calculateScores } from "../src/lib/scoring/scoring-engine";
import type { CandidateAnswersJson, EvaluationJson } from "../src/types/evaluation";

function jsonInput(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function bytesInput(buffer: Buffer): Uint8Array<ArrayBuffer> {
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);
  const view = new Uint8Array(arrayBuffer);
  view.set(buffer);
  return view;
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function riskWarnings(riskLevel: string) {
  if (riskLevel === "HIGH") return ["Risque élevé à investiguer avant décision."];
  if (riskLevel === "MEDIUM") return ["Points de vigilance à clarifier en entretien structuré."];
  return ["Aucun signal bloquant automatique."];
}

function updateAnalysis(existing: unknown, scores: ReturnType<typeof calculateScores>) {
  const current = objectValue(existing);
  const qualitative = objectValue(current.qualitative);

  return {
    ...current,
    ...scores,
    qualitative: {
      ...fallbackQualitativeAnalysis(scores),
      ...qualitative,
      scoring_context: scores
    },
    generated_at: current.generated_at ?? new Date().toISOString()
  };
}

function updateReportJson(existing: unknown, analysisJson: Record<string, unknown>, scores: ReturnType<typeof calculateScores>) {
  return {
    ...objectValue(existing),
    synthese_chiffree: analysisJson,
    score_global: `Score global: ${scores.global_score}/100.`,
    indice_sincerite: `Indice de sincérité: ${scores.sincerity_index}.`,
    indice_coherence: `Indice de cohérence: ${scores.coherence_index}/100.`,
    analyse_detaillee_par_bloc: scores.block_scores,
    soft_skills_forces_risques: scores.soft_skill_scores,
    hard_skills_analysis: `Score hard skills: ${scores.hard_skill_score}/100.`,
    points_de_vigilance: riskWarnings(scores.risk_level),
    avis_final: scores.final_opinion
  };
}

function metadataFor(report: Awaited<ReturnType<typeof loadReports>>[number]): ReportPdfMetadata {
  return {
    candidate: {
      nom: [report.candidate.firstName, report.candidate.lastName].filter(Boolean).join(" ") || report.candidate.email,
      email: report.candidate.email,
      poste_actuel: report.candidate.currentRole ?? "-",
      experience: report.candidate.experienceYears != null ? `${report.candidate.experienceYears} ans` : "-",
      disponibilite: report.candidate.availability ?? "-"
    },
    job: {
      poste: report.job.title,
      contrat: report.job.contractType,
      localisation: report.job.location,
      mode: report.job.workMode,
      niveau: report.job.seniorityLevel
    },
    company: {
      entreprise: report.company.name ?? "Entreprise",
      secteur: report.company.sector ?? "-",
      taille: report.company.size ?? "-",
      contact_rh: report.company.hrContactName ?? "-",
      email_rh: report.company.hrContactEmail ?? "-"
    }
  };
}

function loadReports() {
  return prisma.analysisReport.findMany({
    include: {
      candidate: true,
      company: true,
      evaluation: true,
      job: true,
      response: true
    },
    orderBy: { createdAt: "asc" }
  });
}

async function main() {
  const reports = await loadReports();
  let updated = 0;

  for (const report of reports) {
    const evaluationJson = report.evaluation.json as unknown as EvaluationJson;
    const answersJson = report.response.answersJson as unknown as CandidateAnswersJson;
    const answers = Array.isArray(answersJson.answers) ? answersJson.answers : [];
    const scores = calculateScores(evaluationJson, answers);
    const analysisJson = updateAnalysis(report.analysisJson, scores);
    const reportJson = updateReportJson(report.reportJson, analysisJson, scores);
    const pdfBuffer = await createReportPdfBuffer({ reportJson, analysisJson, metadata: metadataFor(report) }, "Rapport NeuroRecrut");

    await prisma.analysisReport.update({
      where: { id: report.id },
      data: {
        analysisJson: jsonInput(analysisJson),
        reportJson: jsonInput(reportJson),
        pdfBuffer: bytesInput(pdfBuffer),
        globalScore: scores.global_score,
        matchingScore: scores.job_matching_score,
        coherenceIndex: scores.coherence_index,
        sincerityIndex: scores.sincerity_index,
        riskLevel: scores.risk_level as RiskLevel,
        recommendation: scores.recommendation,
        finalOpinion: scores.final_opinion
      }
    });

    updated += 1;
    console.log(
      `${report.code ?? report.uid}: matching=${scores.job_matching_score}, coherence=${scores.coherence_index}, sincerity=${scores.sincerity_index}, risk=${scores.risk_level}`
    );
  }

  console.log(`${updated} rapport(s) recalculé(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
