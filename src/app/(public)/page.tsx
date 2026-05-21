import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Gauge,
  Layers3,
  LockKeyhole,
  Network,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import { PublicNav } from "@/components/layout/public-nav";

const methodSteps = [
  {
    title: "1. Cadrez le poste",
    text: "Missions, compétences, culture, manager, équipe, contraintes et priorités réelles."
  },
  {
    title: "2. Générez l'évaluation",
    text: "Un parcours contextualisé avec QCM, mises en situation, réponses ouvertes et questions miroir."
  },
  {
    title: "3. Invitez les candidats",
    text: "Accès candidat sécurisé, formulaire interne, autosave et soumission unique verrouillée."
  },
  {
    title: "4. Décidez avec le rapport",
    text: "Score, risques, cohérence, matching poste-manager-équipe et plan d'intégration 30/60/90."
  }
];

const matchingBlocks = [
  {
    icon: BrainCircuit,
    title: "Matching candidat - poste",
    text: "Mesure les compétences techniques, la logique, les soft skills réels, l'adaptation au stress et la cohérence comportementale."
  },
  {
    icon: Network,
    title: "Matching équipe - manager",
    text: "Analyse la compatibilité avec le style managérial, le collectif existant, la culture et les risques relationnels."
  }
];

const evaluationBlocks = [
  "Compétences techniques",
  "Compétences relationnelles",
  "Savoir-être",
  "Adaptabilité",
  "Valeurs professionnelles",
  "Cohérence psychométrique"
];

const productSignals = [
  { label: "Évaluation", value: "60-70", detail: "questions contextualisées" },
  { label: "Matching", value: "92%", detail: "poste, équipe, manager" },
  { label: "Cohérence", value: "88", detail: "indice de fiabilité" }
];

export default function HomePage() {
  return (
    <>
      <PublicNav />
      <main className="bg-white">
        <section className="overflow-hidden border-b border-line bg-white">
          <div className="bg-mist">
            <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 md:pb-16 md:pt-20">
              <div className="max-w-4xl">
                <p className="inline-flex rounded-full border border-teal/20 bg-teal/10 px-3 py-1 text-sm font-semibold text-teal">
                  Plateforme IA d&apos;évaluation RH contextualisée
                </p>
                <h1 className="mt-6 max-w-5xl text-4xl font-bold leading-tight text-ink md:text-6xl">
                  Recrutez par compatibilité réelle, pas seulement par CV.
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
                  NeuroRecrut combine IA, psychométrie et analyse comportementale pour créer une évaluation sur mesure par poste, puis mesurer la compatibilité entre le candidat, les missions, la culture, le manager et l&apos;équipe.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/register" className="btn-primary">
                    Créer un compte entreprise
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/pricing" className="btn-secondary">
                    Voir les tarifs
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-6xl px-4 pb-14 md:pb-20">
            <div className="-mt-8 overflow-hidden rounded-lg border border-line bg-white shadow-panel">
              <div className="grid border-b border-line bg-ink text-white md:grid-cols-3">
                {productSignals.map((signal) => (
                  <div key={signal.label} className="border-b border-white/10 p-5 md:border-b-0 md:border-r md:last:border-r-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/60">{signal.label}</p>
                    <p className="mt-2 text-3xl font-bold">{signal.value}</p>
                    <p className="mt-1 text-sm text-white/70">{signal.detail}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
                <div className="border-b border-line p-6 md:border-b-0 md:border-r">
                  <p className="text-sm font-semibold uppercase tracking-wide text-coral">Workflow SaaS</p>
                  <div className="mt-5 grid gap-3">
                    {["Profil cible", "Évaluation interne", "Réponses candidat", "Rapport RH"].map((item, index) => (
                      <div key={item} className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-mist text-sm font-bold text-ink">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-graphite">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-semibold text-ink">Score global</p>
                      <div className="mt-3 h-3 rounded-full bg-mist">
                        <div className="h-3 w-[86%] rounded-full bg-teal" />
                      </div>
                      <p className="mt-2 text-sm text-gray-600">86/100 - Matching solide</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">Compatibilité</p>
                      <div className="mt-3 h-3 rounded-full bg-mist">
                        <div className="h-3 w-[86%] rounded-full bg-gold" />
                      </div>
                      <p className="mt-2 text-sm text-gray-600">4,30/5 - Ajustée au poste</p>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-2">
                    {["Compatibilité manager", "Stress et adaptabilité", "Cohérence des réponses"].map((item) => (
                      <div key={item} className="flex items-center justify-between rounded-md border border-line px-3 py-2">
                        <span className="text-sm text-graphite">{item}</span>
                        <CheckCircle2 className="h-4 w-4 text-teal" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 md:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-coral">Double matching avancé</p>
            <h2 className="mt-3 text-3xl font-bold text-ink">La bonne personne, au bon poste, dans le bon environnement humain.</h2>
            <p className="mt-4 leading-7 text-gray-600">
              La plateforme ne s&apos;arrête pas au matching superficiel. Elle transforme le contexte réel du poste et de l&apos;entreprise en critères d&apos;évaluation exploitables.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {matchingBlocks.map((block) => {
              const Icon = block.icon;
              return (
                <article key={block.title} className="rounded-lg border border-line p-6">
                  <Icon className="h-6 w-6 text-teal" />
                  <h3 className="mt-4 text-lg font-semibold text-ink">{block.title}</h3>
                  <p className="mt-3 leading-7 text-gray-600">{block.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-line bg-mist">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[0.9fr_1.1fr] md:py-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-coral">Évaluation sur mesure</p>
              <h2 className="mt-3 text-3xl font-bold text-ink">Un parcours adapté à chaque offre d&apos;emploi.</h2>
              <p className="mt-4 leading-7 text-gray-600">
                Pour un poste exigeant en relationnel, en rigueur, en multitâche ou en stress opérationnel, NeuroRecrut renforce automatiquement les dimensions pertinentes.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {evaluationBlocks.map((block) => (
                <div key={block} className="flex items-center gap-3 rounded-md border border-line bg-white p-4">
                  <Sparkles className="h-4 w-4 shrink-0 text-coral" />
                  <span className="text-sm font-medium text-graphite">{block}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 md:py-16">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-coral">Processus opérationnel</p>
              <h2 className="mt-3 text-3xl font-bold text-ink">De la définition du besoin au rapport RH actionnable.</h2>
            </div>
            <Link href="/register" className="btn-secondary w-fit">
              Démarrer le workflow
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {methodSteps.map((step) => (
              <article key={step.title} className="rounded-lg border border-line p-5">
                <h3 className="font-semibold text-ink">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-line bg-ink text-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-4 md:py-16">
            {[
              { icon: Layers3, title: "Parcours interne", text: "Pas de Typeform: moteur de formulaire dynamique intégré." },
              { icon: LockKeyhole, title: "Scoring masqué", text: "Le candidat ne voit jamais les règles, scores ou critères cachés." },
              { icon: BarChart3, title: "Comparaison claire", text: "Radar, bar charts, ranking et distribution des risques." },
              { icon: FileText, title: "Rapport PDF", text: "Synthèse RH prête à partager avec recommandations." }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title}>
                  <Icon className="h-6 w-6 text-gold" />
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 md:py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Accès par rôle", text: "Entreprise, candidat et admin avec isolation des données sensibles." },
              { icon: Gauge, title: "Crédits maîtrisés", text: "Invitations bloquées sans crédits actifs et activation après paiement confirmé." },
              { icon: Users, title: "Décision humaine", text: "L'IA analyse, le scoring structure, le recruteur garde la décision finale." }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-lg border border-line p-6">
                  <Icon className="h-5 w-5 text-coral" />
                  <h3 className="mt-4 font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
