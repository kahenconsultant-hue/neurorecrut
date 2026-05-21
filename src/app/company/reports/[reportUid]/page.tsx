import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, BarChart3, Brain, CheckCircle2, FileDown, Gauge, HeartPulse, MessageSquareText, ShieldCheck, Target, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { assertCompanyAccess } from "@/lib/security";
import { Badge } from "@/components/ui/badge";
import { CompatibilityScore } from "@/components/ui/compatibility-score";
import { formatCompatibilityScore, formatDate } from "@/lib/format";

const sectionMeta: Record<string, { title: string; icon: typeof Target }> = {
  contexte_objectif: { title: "Contexte & objectif", icon: Target },
  synthese_chiffree: { title: "Synthèse chiffrée", icon: BarChart3 },
  score_global: { title: "Score global", icon: Gauge },
  indice_sincerite: { title: "Indice de sincérité", icon: ShieldCheck },
  indice_coherence: { title: "Indice de cohérence", icon: Brain },
  analyse_detaillee_par_bloc: { title: "Analyse par bloc", icon: BarChart3 },
  matching_poste: { title: "Matching poste", icon: Target },
  matching_manager: { title: "Matching manager", icon: Users },
  matching_equipe: { title: "Matching équipe", icon: Users },
  soft_skills_forces_risques: { title: "Soft skills", icon: HeartPulse },
  hard_skills_analysis: { title: "Hard skills", icon: Brain },
  points_de_vigilance: { title: "Points de vigilance", icon: AlertTriangle },
  recommandations_rh: { title: "Recommandations RH", icon: CheckCircle2 },
  plan_integration_30_60_90: { title: "Plan 30/60/90", icon: MessageSquareText },
  avis_final: { title: "Avis final", icon: ShieldCheck }
};

const fieldLabels: Record<string, string> = {
  contexte_objectif: "Contexte & objectif",
  synthese_chiffree: "Synthèse chiffrée",
  global_score: "Score global",
  job_matching_score: "Matching poste",
  sincerity_index: "Indice de sincérité",
  coherence_index: "Indice de cohérence",
  block_scores: "Scores par bloc",
  soft_skill_scores: "Scores soft skills",
  hard_skill_score: "Score hard skills",
  compatibility_score: "Compatibilité",
  recommendation: "Recommandation",
  final_opinion: "Avis final",
  strengths: "Forces",
  risks: "Risques",
  actions: "Actions",
  candidate: "Candidat",
  job: "Poste",
  company: "Entreprise"
};

const hiddenReportKeys = new Set(["scoring_context", "generated_at"]);

function labelize(key: string) {
  return fieldLabels[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()).replace("Rh", "RH");
}

function cleanReportValue(value: unknown, key?: string): unknown {
  if (key === "synthese_chiffree" && value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    return {
      global_score: source.global_score,
      job_matching_score: source.job_matching_score,
      sincerity_index: source.sincerity_index,
      coherence_index: source.coherence_index,
      hard_skill_score: source.hard_skill_score,
      compatibility_score: source.job_matching_score != null ? formatCompatibilityScore(Number(source.job_matching_score)) : undefined,
      recommendation: source.recommendation,
      final_opinion: source.final_opinion
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => cleanReportValue(item)).filter((item) => item !== undefined);
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([nestedKey]) => !hiddenReportKeys.has(nestedKey))
      .map(([nestedKey, nested]) => [nestedKey, cleanReportValue(nested, nestedKey)] as const)
      .filter(([, nested]) => nested !== undefined && nested !== null && nested !== "");
    return Object.fromEntries(entries);
  }

  return value;
}

function primitiveText(value: unknown): string {
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, nested]) => `${labelize(key)}: ${primitiveText(nested)}`)
      .join(" · ");
  }
  return String(value ?? "Non renseigné");
}

function isNumericObject(value: unknown): value is Record<string, number> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value)) &&
    Object.values(value as Record<string, unknown>).every((item) => typeof item === "number");
}

function RenderValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    return (
      <ul className="mt-4 grid gap-2 text-sm leading-6 text-gray-700">
        {value.map((item, index) => (
          <li key={index} className="rounded-md border border-line bg-white p-3">
            {item && typeof item === "object" ? <RenderValue value={item} /> : (
              <div className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                <span>{primitiveText(item)}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (isNumericObject(value)) {
    return (
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {Object.entries(value).map(([label, score]) => (
          <ScoreBar key={label} label={labelize(label)} value={score} tone={score >= 70 ? "teal" : score >= 50 ? "gold" : "coral"} />
        ))}
      </div>
    );
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, nested]) => nested !== null && nested !== undefined && nested !== "");
    return (
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {entries.map(([key, nested]) => (
          <div key={key} className="rounded-md border border-line bg-mist p-4">
            <p className="text-xs font-semibold uppercase text-gray-500">{labelize(key)}</p>
            <div className="mt-2 text-sm leading-6 text-gray-700">
              {Array.isArray(nested) || (nested && typeof nested === "object")
                ? <RenderValue value={nested} />
                : <p className="whitespace-pre-wrap">{primitiveText(nested)}</p>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">{String(value ?? "Non renseigné")}</p>;
}

function ScoreBar({ label, value, tone = "teal" }: { label: string; value: number; tone?: "teal" | "coral" | "gold" }) {
  const width = Math.max(0, Math.min(100, Math.round(value)));
  const color = tone === "coral" ? "bg-coral" : tone === "gold" ? "bg-gold" : "bg-teal";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-graphite">{label}</span>
        <span className="font-semibold text-ink">{width}/100</span>
      </div>
      <div className="h-2 rounded-full bg-mist">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default async function ReportPage({ params }: { params: { reportUid: string } }) {
  const report = await prisma.analysisReport.findUniqueOrThrow({
    where: { uid: params.reportUid },
    include: { candidate: true, job: { include: { company: true } }, company: true }
  });
  await assertCompanyAccess(report.companyId);
  const reportJson = report.reportJson as Record<string, unknown>;
  const reportEntries = Object.entries(reportJson)
    .map(([key, value]) => [key, cleanReportValue(value, key)] as const)
    .filter(([, value]) => value !== undefined && value !== null && value !== "");
  const analysisJson = report.analysisJson as {
    block_scores?: Record<string, number>;
    soft_skill_scores?: Record<string, number>;
    qualitative?: Record<string, unknown>;
  };
  const blockScores = analysisJson.block_scores ?? {};
  const softSkillScores = analysisJson.soft_skill_scores ?? {};

  return (
    <div className="space-y-6">
      <section className="panel overflow-hidden">
        <div className="bg-white px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Image src="/neurorecrut-logo.png" alt="NeuroRecrut" width={240} height={84} className="h-auto w-48" priority />
              <h1 className="mt-6 text-3xl font-bold text-ink">Rapport candidat</h1>
              <p className="mt-2 text-gray-600">
                {report.candidate.firstName} {report.candidate.lastName} · {report.job.title}
              </p>
              <p className="mt-1 text-sm text-gray-500">{report.company.name ?? "Entreprise"} · Généré le {formatDate(report.createdAt)}</p>
              <p className="mt-2 font-mono text-xs text-gray-500">{report.code ?? report.uid}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="btn-primary" href={`/api/reports/${report.uid}/pdf`} target="_blank">
                <FileDown className="h-4 w-4" />
                Télécharger PDF
              </Link>
              <Link className="btn-secondary" href={`/company/jobs/${report.job.uid}/comparison`}>Comparaison</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-5">
          <p className="text-xs font-semibold uppercase text-gray-500">Candidat</p>
          <h2 className="mt-2 text-lg font-semibold text-ink">
            {[report.candidate.firstName, report.candidate.lastName].filter(Boolean).join(" ") || report.candidate.email}
          </h2>
          <dl className="mt-4 space-y-2 text-sm text-gray-700">
            <div className="flex justify-between gap-3"><dt>Email</dt><dd className="text-right font-medium text-ink">{report.candidate.email}</dd></div>
            <div className="flex justify-between gap-3"><dt>Code</dt><dd className="text-right font-mono text-xs text-ink">{report.candidate.code ?? report.candidate.uid}</dd></div>
            <div className="flex justify-between gap-3"><dt>Poste actuel</dt><dd className="text-right font-medium text-ink">{report.candidate.currentRole ?? "-"}</dd></div>
            <div className="flex justify-between gap-3"><dt>Expérience</dt><dd className="text-right font-medium text-ink">{report.candidate.experienceYears != null ? `${report.candidate.experienceYears} ans` : "-"}</dd></div>
            <div className="flex justify-between gap-3"><dt>Disponibilité</dt><dd className="text-right font-medium text-ink">{report.candidate.availability ?? "-"}</dd></div>
          </dl>
        </div>
        <div className="panel p-5">
          <p className="text-xs font-semibold uppercase text-gray-500">Poste évalué</p>
          <h2 className="mt-2 text-lg font-semibold text-ink">{report.job.title}</h2>
          <dl className="mt-4 space-y-2 text-sm text-gray-700">
            <div className="flex justify-between gap-3"><dt>Contrat</dt><dd className="text-right font-medium text-ink">{report.job.contractType}</dd></div>
            <div className="flex justify-between gap-3"><dt>Code</dt><dd className="text-right font-mono text-xs text-ink">{report.job.code ?? report.job.uid}</dd></div>
            <div className="flex justify-between gap-3"><dt>Localisation</dt><dd className="text-right font-medium text-ink">{report.job.location}</dd></div>
            <div className="flex justify-between gap-3"><dt>Mode</dt><dd className="text-right font-medium text-ink">{report.job.workMode}</dd></div>
            <div className="flex justify-between gap-3"><dt>Niveau</dt><dd className="text-right font-medium text-ink">{report.job.seniorityLevel}</dd></div>
          </dl>
        </div>
        <div className="panel p-5">
          <p className="text-xs font-semibold uppercase text-gray-500">Entreprise</p>
          <h2 className="mt-2 text-lg font-semibold text-ink">{report.company.name ?? "Entreprise"}</h2>
          <dl className="mt-4 space-y-2 text-sm text-gray-700">
            <div className="flex justify-between gap-3"><dt>Secteur</dt><dd className="text-right font-medium text-ink">{report.company.sector ?? "-"}</dd></div>
            <div className="flex justify-between gap-3"><dt>Taille</dt><dd className="text-right font-medium text-ink">{report.company.size ?? "-"}</dd></div>
            <div className="flex justify-between gap-3"><dt>Contact RH</dt><dd className="text-right font-medium text-ink">{report.company.hrContactName ?? "-"}</dd></div>
            <div className="flex justify-between gap-3"><dt>Email RH</dt><dd className="text-right font-medium text-ink">{report.company.hrContactEmail ?? "-"}</dd></div>
          </dl>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Global", value: report.globalScore, tone: "teal" as const, icon: Gauge },
          { label: "Matching", value: report.matchingScore, tone: "teal" as const, icon: Target },
          { label: "Cohérence", value: report.coherenceIndex, tone: "gold" as const, icon: Brain },
          { label: "Sincérité", value: Math.max(0, (report.sincerityIndex + 10) * 5), tone: "coral" as const, icon: ShieldCheck }
        ].map(({ label, value, tone, icon: Icon }) => (
          <div key={label} className="panel p-5">
            <div className="flex min-h-6 items-center justify-between">
              <Icon className="h-5 w-5 text-coral" />
              {label === "Sincérité" ? <Badge value={`${Math.round(report.sincerityIndex)}/10`} /> : null}
              {label === "Matching" ? <CompatibilityScore score={report.matchingScore} /> : null}
            </div>
            <p className="mt-5 text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-ink">{label === "Sincérité" ? Math.round(report.sincerityIndex) : Math.round(value)}</p>
            <div className="mt-4"><ScoreBar label={label} value={value} tone={tone} /></div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="panel p-5 xl:col-span-2">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-coral" />
            <h2 className="font-semibold text-ink">Lecture rapide</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <ScoreBar label="Adéquation au poste" value={report.matchingScore} />
            <ScoreBar label="Robustesse globale" value={report.globalScore} />
            <ScoreBar label="Cohérence psychométrique" value={report.coherenceIndex} tone="gold" />
            <ScoreBar label="Signal de sincérité" value={Math.max(0, (report.sincerityIndex + 10) * 5)} tone="coral" />
          </div>
        </div>
        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-coral" />
            <h2 className="font-semibold text-ink">Décision</h2>
          </div>
          <p className="mt-4 text-2xl font-bold text-ink">{report.finalOpinion}</p>
          <p className="mt-2 text-sm leading-6 text-gray-700">{report.recommendation}</p>
          <div className="mt-4"><CompatibilityScore score={report.matchingScore} /></div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="panel p-5">
          <h2 className="font-semibold text-ink">Scores par bloc</h2>
          <div className="mt-4 space-y-4">
            {Object.entries(blockScores).map(([label, value]) => <ScoreBar key={label} label={label} value={value} />)}
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="font-semibold text-ink">Soft skills clés</h2>
          <div className="mt-4 space-y-4">
            {Object.entries(softSkillScores).slice(0, 8).map(([label, value]) => <ScoreBar key={label} label={label} value={value} tone={value >= 70 ? "teal" : value >= 50 ? "gold" : "coral"} />)}
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {reportEntries.map(([key, value]) => {
          const meta = sectionMeta[key] ?? { title: labelize(key), icon: MessageSquareText };
          const Icon = meta.icon;
          return (
            <article key={key} className="panel p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-mist text-coral">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="text-lg font-semibold text-ink">{meta.title}</h2>
              </div>
              <RenderValue value={value} />
            </article>
          );
        })}
      </section>
    </div>
  );
}
