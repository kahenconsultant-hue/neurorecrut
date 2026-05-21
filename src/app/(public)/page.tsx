import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  GitCompareArrows,
  Handshake,
  MessageSquareMore,
  ShieldAlert,
  TimerReset,
  UsersRound
} from "lucide-react";
import { PublicNav } from "@/components/layout/public-nav";

const evaluationContext = [
  "le poste",
  "l'environnement d'équipe",
  "le style managérial",
  "les attentes opérationnelles réelles"
];

const hiringBlindSpots = [
  "les incompatibilités comportementales",
  "les tensions managériales",
  "l'adaptation au contexte réel",
  "les risques de désengagement après l'embauche"
];

const analysisInputs = [
  "les compétences attendues",
  "les exigences comportementales",
  "les contraintes du poste",
  "la dynamique de l'équipe",
  "le contexte managérial"
];

const evaluationDimensions = [
  {
    icon: BrainCircuit,
    title: "Cognition & raisonnement",
    text: "Capacité d'analyse, logique, gestion de l'information, flexibilité cognitive."
  },
  {
    icon: MessageSquareMore,
    title: "Fonctionnement comportemental",
    text: "Communication, collaboration, autonomie, posture professionnelle."
  },
  {
    icon: Compass,
    title: "Gestion émotionnelle & adaptabilité",
    text: "Réaction au stress, imprévus, changements, environnement dynamique."
  },
  {
    icon: UsersRound,
    title: "Valeurs & environnement professionnel",
    text: "Compatibilité culturelle et relationnelle avec le contexte de travail."
  },
  {
    icon: BriefcaseBusiness,
    title: "Mises en situation professionnelles",
    text: "Scénarios contextualisés selon le poste et les contraintes réelles."
  },
  {
    icon: GitCompareArrows,
    title: "Cohérence globale",
    text: "Détection des incohérences et analyse croisée des réponses."
  }
];

const businessValues = [
  {
    icon: ShieldAlert,
    title: "Réduire les incompatibilités coûteuses",
    text: "Mieux identifier les écarts entre le profil réel du candidat et les exigences du poste."
  },
  {
    icon: ClipboardCheck,
    title: "Structurer les décisions RH",
    text: "Transformer des impressions subjectives en indicateurs plus lisibles et comparables."
  },
  {
    icon: TimerReset,
    title: "Gagner du temps dans la présélection",
    text: "Recevoir des synthèses exploitables plus rapidement."
  },
  {
    icon: Handshake,
    title: "Renforcer la qualité des recrutements",
    text: "Mieux anticiper l'intégration humaine et opérationnelle."
  }
];

const differentiationRows = [
  ["CV + entretien", "Évaluation contextualisée"],
  ["Tests standards", "Parcours adaptés au poste"],
  ["Décision intuitive", "Indicateurs structurés"],
  ["Analyse isolée", "Vision poste + équipe + management"],
  ["Lecture partielle", "Rapport synthétique exploitable"]
];

export default function HomePage() {
  return (
    <>
      <PublicNav />
      <main className="bg-white">
        <section className="relative isolate overflow-hidden border-b border-line bg-ink text-white">
          <Image
            src="/home/analytical-recruitment.jpg"
            alt="Analyse de profils candidats dans un environnement de recrutement data-driven."
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,24,39,0.96)_0%,rgba(17,24,39,0.9)_42%,rgba(17,24,39,0.52)_76%,rgba(17,24,39,0.78)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(42,157,143,0.24),transparent_34%),radial-gradient(circle_at_76%_28%,rgba(233,196,106,0.14),transparent_30%)]" />

          <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
            <div className="max-w-4xl">
              <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold text-teal-100 backdrop-blur">
                Évaluation RH contextualisée assistée par IA
              </p>
              <h1 className="mt-6 max-w-5xl text-4xl font-bold leading-tight md:text-6xl">
                Recrutez avec plus de cohérence humaine, moins d&apos;intuition hasardeuse.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/80">
                NeuroRecrut® aide les entreprises et cabinets RH à mieux évaluer la compatibilité comportementale et professionnelle des candidats grâce à une approche analytique assistée par IA.
              </p>

              <div className="mt-7">
                <p className="text-sm font-semibold uppercase tracking-wide text-white/60">
                  Chaque évaluation est contextualisée selon
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {evaluationContext.map((item) => (
                    <span key={item} className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white/90 backdrop-blur">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="btn-primary bg-white text-ink hover:bg-white/90">
                  Première évaluation gratuite
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/pricing" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/15">
                  Voir les tarifs
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[1fr_0.95fr] md:items-center md:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-coral">Le problème</p>
            <h2 className="mt-3 text-3xl font-bold text-ink md:text-4xl">
              Pourquoi tant de recrutements échouent après l&apos;entretien ?
            </h2>
            <div className="mt-5 space-y-2 text-lg leading-8 text-graphite">
              <p>Un CV valide des expériences.</p>
              <p>Un entretien valide une impression.</p>
            </div>
            <p className="mt-6 leading-7 text-gray-600">
              Mais ni l&apos;un ni l&apos;autre ne permet réellement d&apos;anticiper :
            </p>
            <ul className="mt-4 grid gap-3">
              {hiringBlindSpots.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-700">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-coral" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-md border border-coral/20 bg-coral/10 px-4 py-3 font-medium leading-7 text-ink">
              Le coût humain et financier d&apos;un mauvais recrutement peut devenir considérable.
            </p>
          </div>

          <figure className="overflow-hidden rounded-lg border border-line bg-mist shadow-panel">
            <div className="relative aspect-[4/3]">
              <Image
                src="/home/recruitment-pressure.jpg"
                alt="Recruteur confronté à un volume important de CV."
                fill
                sizes="(min-width: 768px) 42vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
            </div>
          </figure>
        </section>

        <section className="border-y border-line bg-mist">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[0.92fr_1.08fr] md:items-center md:py-20">
            <figure className="order-2 overflow-hidden rounded-lg border border-line bg-ink shadow-panel md:order-1">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/home/team-compatibility.jpg"
                  alt="Recherche de compatibilité entre candidats et collectif de travail."
                  fill
                  sizes="(min-width: 768px) 42vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(17,24,39,0.06),rgba(42,157,143,0.2))]" />
              </div>
            </figure>

            <div className="order-1 md:order-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-coral">La solution</p>
              <h2 className="mt-3 text-3xl font-bold text-ink md:text-4xl">
                Une évaluation contextualisée selon votre réalité terrain
              </h2>
              <p className="mt-5 leading-7 text-gray-600">
                Contrairement aux tests standards identiques pour tous les postes, NeuroRecrut® génère une évaluation adaptée à chaque besoin de recrutement.
              </p>
              <p className="mt-5 font-semibold text-graphite">L&apos;analyse prend en compte :</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {analysisInputs.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-md border border-line bg-white px-4 py-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal" />
                    <span className="text-sm font-medium leading-6 text-graphite">{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 rounded-md bg-ink px-4 py-4 leading-7 text-white">
                <span className="font-semibold text-gold">Objectif :</span> fournir des indicateurs d&apos;aide à la décision plus structurés, plus lisibles et plus exploitables.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-coral">La méthode</p>
            <h2 className="mt-3 text-3xl font-bold text-ink md:text-4xl">Une approche multi-dimensionnelle</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {evaluationDimensions.map((dimension) => {
              const Icon = dimension.icon;
              return (
                <article key={dimension.title} className="rounded-lg border border-line bg-white p-6 shadow-panel">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-teal/10 text-teal">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-ink">{dimension.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">{dimension.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-line bg-ink text-white">
          <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">Valeur business</p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">Ce que NeuroRecrut® apporte concrètement</h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {businessValues.map((value) => {
                const Icon = value.icon;
                return (
                  <article key={value.title} className="rounded-lg border border-white/10 bg-white/10 p-6">
                    <Icon className="h-5 w-5 text-gold" />
                    <h3 className="mt-4 text-lg font-semibold">{value.title}</h3>
                    <p className="mt-3 leading-7 text-white/70">{value.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-coral">Différenciation</p>
            <h2 className="mt-3 text-3xl font-bold text-ink md:text-4xl">Ce qui différencie NeuroRecrut®</h2>
          </div>
          <div className="mt-8 overflow-hidden rounded-lg border border-line bg-white shadow-panel">
            <table className="w-full border-collapse text-left">
              <thead className="bg-mist">
                <tr>
                  <th className="border-b border-line px-4 py-4 text-sm font-semibold text-graphite md:px-6">
                    Recrutement classique
                  </th>
                  <th className="border-b border-line px-4 py-4 text-sm font-semibold text-ink md:px-6">
                    NeuroRecrut®
                  </th>
                </tr>
              </thead>
              <tbody>
                {differentiationRows.map(([classic, neurorecrut]) => (
                  <tr key={classic} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-4 text-sm leading-6 text-gray-600 md:px-6">{classic}</td>
                    <td className="px-4 py-4 text-sm font-semibold leading-6 text-ink md:px-6">{neurorecrut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
