import { randomUUID } from "crypto";
import { BLOCK_WEIGHTS, EVALUATION_BLOCKS, SOFT_SKILLS } from "@/lib/constants";
import type { EvaluationJson, EvaluationQuestion, QuestionType } from "@/types/evaluation";

function uid(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}

function choices(items: Array<{ label: string; score: number; indicator: string }>) {
  return items.map((item) => ({
    choice_uid: uid("choice"),
    label: item.label,
    score_value: Math.max(0, Math.min(5, item.score)),
    hidden_indicators: [item.indicator]
  }));
}

const scenarioTemplates = [
  (jobTitle: string) => `Vous prenez en charge un cycle de vente complexe pour le poste ${jobTitle}. Le prospect confirme l'intérêt métier, mais le directeur financier bloque sur le budget à 48 heures de la décision.`,
  (jobTitle: string) => `Sur une opportunité stratégique liée au poste ${jobTitle}, votre interlocuteur principal vous annonce qu'un concurrent promet un déploiement deux fois plus rapide.`,
  () => "Un client historique menace de suspendre le renouvellement après un incident opérationnel. L'équipe delivery estime pourtant que la demande du client sort du périmètre signé.",
  () => "Vous découvrez dans le CRM que trois opportunités annoncées comme chaudes n'ont pas de prochaine étape datée ni de décideur économique identifié.",
  () => "Pendant une réunion de négociation, l'acheteur vous pousse à accorder une remise immédiate en échange d'une signature verbale non confirmée par écrit.",
  () => "Un manager vous demande une prévision de chiffre fiable pour le comité de lundi, alors que deux deals importants dépendent encore d'une validation juridique client.",
  () => "Un prospect très direct critique votre proposition devant deux collègues et remet en cause la compréhension de son besoin.",
  () => "Vous devez reprendre un portefeuille où plusieurs clients n'ont pas été recontactés depuis plus de six semaines, alors que le trimestre se termine bientôt.",
  () => "Un nouveau lead entrant semble prometteur, mais les informations disponibles sont contradictoires entre le formulaire, LinkedIn et les notes d'un SDR.",
  () => "Une équipe produit refuse une demande spécifique pourtant décisive pour un compte cible. Le client attend une réponse claire avant demain midi.",
  () => "Un partenaire vous transmet une opportunité, mais il veut garder la relation client et limite votre accès au décideur final.",
  () => "Après une démonstration réussie, l'utilisateur sponsor se montre enthousiaste mais vous confie que le comité d'achat est sensible au risque de changement interne.",
  () => "Un client demande une clause contractuelle inhabituelle. Le juridique interne vous invite à refuser, mais le deal représente un objectif important du mois.",
  () => "Votre binôme avant-vente arrive en retard à une réunion client importante et le prospect commence par exprimer son agacement.",
  () => "Vous recevez une objection technique que vous ne maîtrisez pas complètement, alors que le prospect attend une réponse précise en direct.",
  () => "Un compte dormant réapparaît avec un besoin urgent, mais l'historique montre plusieurs échanges tendus avec votre entreprise.",
  () => "Le sponsor client vous demande un support de décision très synthétique pour convaincre son comité, sans vouloir partager toutes les résistances internes.",
  () => "Une opportunité avance vite, mais vous sentez que le besoin réel n'est pas totalement aligné avec la solution demandée.",
  () => "Un collègue commercial conteste votre stratégie de compte devant le manager et propose une approche plus agressive.",
  () => "Vous terminez une semaine dense avec plusieurs relances critiques, une proposition à finaliser et un compte insatisfait à rappeler."
];

const choiceSets: Array<Array<{ label: string; score: number; indicator: string }>> = [
  [
    { label: "Je sécurise les critères de décision, puis je propose un plan de validation précis.", score: 5, indicator: "qualification_decision" },
    { label: "Je défends la valeur sans bouger le prix tant que le blocage n'est pas objectivé.", score: 4, indicator: "value_selling" },
    { label: "J'accorde un geste commercial limité pour garder le rythme de signature.", score: 2, indicator: "discount_pressure" },
    { label: "Je remonte le sujet au manager pour obtenir une marge de manœuvre.", score: 3, indicator: "escalation" },
    { label: "Je mets l'opportunité en pause jusqu'à ce que le client clarifie son budget.", score: 1, indicator: "avoidance" }
  ],
  [
    { label: "Je reformule l'objection, vérifie l'enjeu réel, puis compare les risques des deux options.", score: 5, indicator: "objection_handling" },
    { label: "Je mets en avant nos références et demande ce qui rend la promesse concurrente crédible.", score: 4, indicator: "competitive_framing" },
    { label: "Je propose d'aligner la promesse de délai pour ne pas perdre le deal.", score: 1, indicator: "overcommitment" },
    { label: "Je demande un court échange technique avec les parties prenantes concernées.", score: 4, indicator: "technical_validation" },
    { label: "Je recentre sur le prix et cherche un compromis rapide.", score: 2, indicator: "price_anchor" }
  ],
  [
    { label: "Je distingue faits, ressentis et engagements contractuels avant de proposer une sortie.", score: 5, indicator: "conflict_structure" },
    { label: "Je commence par reconnaître l'impact client, puis je coordonne une réponse interne datée.", score: 5, indicator: "customer_recovery" },
    { label: "Je rappelle fermement le périmètre signé pour éviter un précédent.", score: 2, indicator: "rigidity" },
    { label: "Je cherche une concession réciproque et la formalise par écrit.", score: 4, indicator: "negotiated_tradeoff" },
    { label: "Je laisse le delivery traiter le sujet, car il concerne surtout l'exécution.", score: 1, indicator: "ownership_gap" }
  ],
  [
    { label: "Je nettoie le pipeline avec les prochaines étapes, décideurs et risques avant d'annoncer un forecast.", score: 5, indicator: "pipeline_rigor" },
    { label: "Je classe les opportunités par probabilité et impact, puis je priorise les relances.", score: 5, indicator: "prioritization" },
    { label: "Je garde les montants dans le forecast pour rester ambitieux.", score: 1, indicator: "forecast_bias" },
    { label: "Je demande aux SDR de requalifier les comptes pendant que je traite les plus gros montants.", score: 3, indicator: "delegation" },
    { label: "Je retire tout ce qui n'est pas confirmé pour éviter tout risque.", score: 2, indicator: "excessive_caution" }
  ],
  [
    { label: "Je refuse l'échange flou et propose un accord conditionné à une signature écrite datée.", score: 5, indicator: "contractual_discipline" },
    { label: "Je transforme la remise en contreparties mesurables: durée, périmètre ou paiement.", score: 5, indicator: "trade_concession" },
    { label: "J'accepte la remise si l'acheteur donne son accord oral devant les participants.", score: 1, indicator: "weak_commitment" },
    { label: "Je temporise pour consulter mon manager avant toute concession.", score: 3, indicator: "controlled_escalation" },
    { label: "Je reviens à la valeur métier pour éviter de négocier uniquement le prix.", score: 4, indicator: "value_reframe" }
  ],
  [
    { label: "Je donne une prévision en trois niveaux: engagé, probable, à risque, avec hypothèses explicites.", score: 5, indicator: "forecast_transparency" },
    { label: "Je contacte les interlocuteurs clés avant de figer le chiffre.", score: 4, indicator: "stakeholder_check" },
    { label: "Je fournis le meilleur scénario pour soutenir la dynamique commerciale.", score: 1, indicator: "optimism_bias" },
    { label: "Je baisse fortement la prévision pour protéger ma crédibilité.", score: 2, indicator: "defensive_forecast" },
    { label: "Je présente le chiffre avec les risques juridiques et les actions de sécurisation.", score: 5, indicator: "risk_management" }
  ],
  [
    { label: "Je demande un exemple concret, reconnais le point perçu et recadre sur les objectifs de la réunion.", score: 5, indicator: "active_recovery" },
    { label: "Je garde le calme et propose de reprendre la découverte avant de répondre.", score: 4, indicator: "emotional_control" },
    { label: "Je réponds point par point pour montrer que la critique est infondée.", score: 2, indicator: "defensiveness" },
    { label: "Je propose une pause courte pour réaligner les attentes avec le sponsor.", score: 3, indicator: "meeting_control" },
    { label: "Je passe rapidement à la démonstration pour changer l'ambiance.", score: 1, indicator: "avoidant_shift" }
  ],
  [
    { label: "Je segmente le portefeuille par potentiel, urgence et historique relationnel avant d'agir.", score: 5, indicator: "account_segmentation" },
    { label: "Je prépare une reprise de contact personnalisée avec une raison business claire.", score: 5, indicator: "customer_reactivation" },
    { label: "J'envoie une campagne générique pour toucher tout le monde rapidement.", score: 1, indicator: "generic_outreach" },
    { label: "Je commence par les comptes les plus simples pour créer du volume.", score: 2, indicator: "comfort_zone" },
    { label: "Je demande au manager de confirmer les priorités avant de relancer.", score: 3, indicator: "alignment_request" }
  ]
];

const forcedChoiceSets: Array<Array<{ label: string; score: number; indicator: string }>> = [
  [
    { label: "Protéger la relation client même si le cycle ralentit.", score: 4, indicator: "relationship_long_term" },
    { label: "Accélérer la signature tant que l'intention d'achat est chaude.", score: 2, indicator: "closing_pressure" },
    { label: "Clarifier les risques avant tout engagement commercial.", score: 5, indicator: "risk_clarity" },
    { label: "Obtenir une validation interne avant de répondre au client.", score: 3, indicator: "internal_alignment" }
  ],
  [
    { label: "Dire clairement ce qui est possible et ce qui ne l'est pas.", score: 5, indicator: "clarity" },
    { label: "Garder de la souplesse pour ne pas bloquer la négociation.", score: 3, indicator: "flexibility" },
    { label: "Faire une concession rapide pour préserver la dynamique.", score: 1, indicator: "premature_concession" },
    { label: "Reporter la décision jusqu'à disposer de toutes les informations.", score: 2, indicator: "decision_delay" }
  ],
  [
    { label: "Prioriser l'opportunité au plus fort montant.", score: 3, indicator: "revenue_focus" },
    { label: "Prioriser le deal avec le chemin de décision le plus clair.", score: 5, indicator: "decision_path" },
    { label: "Prioriser le client le plus insistant.", score: 1, indicator: "reactive_priority" },
    { label: "Prioriser le compte qui nécessite le moins d'effort immédiat.", score: 2, indicator: "effort_bias" }
  ]
];

function questionChoices(blockIndex: number, questionIndex: number, type: QuestionType) {
  if (type === "OPEN" || type === "ROLE_PLAY") return [];
  if (type === "FORCED_CHOICE") {
    return choices(forcedChoiceSets[(blockIndex + questionIndex) % forcedChoiceSets.length]);
  }
  const set = choiceSets[(blockIndex * 10 + questionIndex) % choiceSets.length];
  return choices(type === "QCM" ? set : set.slice(0, 4));
}

function makeQuestion(
  blockIndex: number,
  questionIndex: number,
  type: QuestionType,
  context: string,
  competency: string,
  mirror?: string | null
): EvaluationQuestion {
  const base = `Situation ${questionIndex + 1} - ${context}`;

  return {
    question_uid: uid("question"),
    type,
    question_text:
      type === "OPEN"
        ? `${base} Décrivez votre première action concrète, les informations que vous cherchez et la façon dont vous décidez.`
        : type === "ROLE_PLAY"
          ? `${base} Rédigez le message exact ou les phrases que vous utiliseriez face à votre interlocuteur.`
          : type === "LIKERT_CONTEXTUAL"
            ? `${base} Parmi ces réactions possibles, laquelle serait la plus proche de votre comportement habituel ?`
            : `${base} Que faites-vous en priorité ?`,
    choices: questionChoices(blockIndex, questionIndex, type),
    hidden_target_competencies: [competency],
    scoring_rules: {
      scale: type === "ROLE_PLAY" ? "0-5" : type === "QCM" ? "0-1_normalized" : "0-3",
      positive_signals: ["clarification", "priorisation", "impact", "cooperation"],
      negative_signals: ["impulsivite", "evitement", "rigidite", "justification vague"]
    },
    mirror_question_reference: mirror ?? null,
    weight: 1
  };
}

export function fallbackTargetProfile(jobProfile: Record<string, unknown>, companyProfile: Record<string, unknown>) {
  return {
    cognitive_expectations: [
      "Structurer les problèmes ambigus",
      "Prioriser les actions selon impact et urgence",
      "Transformer les informations métier en décisions exploitables"
    ],
    behavioral_expectations: [
      "Travailler avec fiabilité dans un environnement collaboratif",
      "Rendre visibles les arbitrages et les risques",
      "Adapter sa communication à des interlocuteurs variés"
    ],
    emotional_stress_expectations: [
      "Maintenir une posture constructive sous pression",
      "Faire remonter les blocages sans dramatiser",
      "Préserver la qualité de décision dans les périodes denses"
    ],
    communication_expectations: [
      "Synthèse claire",
      "Feedback factuel",
      "Capacité à expliquer les compromis"
    ],
    technical_expectations: [String(jobProfile.hardSkillsRequired ?? "Compétences métier du poste")],
    team_compatibility_expectations: [String(companyProfile.teamWorkingStyle ?? "Collaboration transverse")],
    manager_compatibility_expectations: [String(jobProfile.managementStyle ?? companyProfile.managementStyle ?? "Management structuré")],
    risk_factors_to_detect: [
      "Décisions impulsives",
      "Difficulté à accepter les contraintes",
      "Communication floue",
      "Incohérences entre intentions déclarées et arbitrages"
    ],
    priority_criteria: [
      "Matching avec les missions principales",
      "Robustesse comportementale",
      "Compatibilité équipe-manager",
      "Fiabilité des réponses"
    ]
  };
}

export function fallbackEvaluation(companyUid: string, jobUid: string, jobTitle: string): EvaluationJson {
  return {
    evaluation_uid: uid("eval"),
    company_uid: companyUid,
    job_uid: jobUid,
    language: "fr",
    version: "NeuroRecrut Ultra MVP v1",
    blocks: EVALUATION_BLOCKS.map((blockName, blockIndex) => {
      const questions: EvaluationQuestion[] = [];
      for (let index = 0; index < 10; index += 1) {
        const type: QuestionType =
          index < 5
            ? "QCM"
            : index === 5
              ? "FORCED_CHOICE"
              : index === 6
                ? "LIKERT_CONTEXTUAL"
                : index === 7
                  ? "OPEN"
                  : index === 8
                    ? "ROLE_PLAY"
                    : "QCM";
        const mirror = blockIndex === 5 && index >= 5 ? questions[index - 5]?.question_uid ?? null : null;
        questions.push(
          makeQuestion(
            blockIndex,
            index,
            type,
            scenarioTemplates[(index + blockIndex * 3) % scenarioTemplates.length](jobTitle),
            SOFT_SKILLS[(index + blockIndex) % SOFT_SKILLS.length],
            mirror
          )
        );
      }

      return {
        block_id: blockIndex + 1,
        name: blockName,
        weight: BLOCK_WEIGHTS[blockName],
        questions
      };
    })
  };
}

export function fallbackQualitativeAnalysis(scores: Record<string, unknown>) {
  return {
    qualitative_observations: [
      "Analyse produite localement faute de réponse IA disponible.",
      "Les signaux sont dérivés des scores, des choix structurés et de la complétude des réponses."
    ],
    matching_evidence: ["Les blocs les plus forts soutiennent le score de matching."],
    risk_evidence: ["Les risques augmentent lorsque cohérence, sincérité ou réponses ouvertes sont faibles."],
    manager_fit_evidence: ["À valider en entretien avec des situations concrètes de collaboration."],
    team_fit_evidence: ["Compatibilité estimée à partir des comportements déclarés en contexte."],
    recommended_interview_questions: [
      "Pouvez-vous décrire une décision récente prise avec information incomplète ?",
      "Comment réagissez-vous lorsqu'un manager change une priorité tardivement ?",
      "Quel compromis qualité-délai avez-vous déjà assumé ?"
    ],
    onboarding_focus: ["Clarifier les rituels d'équipe", "Aligner les attentes de reporting", "Prévoir un point 30 jours"],
    scoring_context: scores
  };
}

export function fallbackHrReport(analysisJson: Record<string, unknown>) {
  const recommendation = String(analysisJson.recommendation ?? "Réserve");
  return {
    contexte_objectif:
      "Cette évaluation vise à mesurer l'adéquation du candidat avec le poste, le manager, l'équipe et les contraintes réelles du contexte.",
    synthese_chiffree: analysisJson,
    score_global: `Score global: ${analysisJson.global_score ?? "n/a"}/100.`,
    indice_sincerite: `Indice de sincérité: ${analysisJson.sincerity_index ?? "n/a"}.`,
    indice_coherence: `Indice de cohérence: ${analysisJson.coherence_index ?? "n/a"}/100.`,
    analyse_detaillee_par_bloc: analysisJson.block_scores ?? {},
    matching_poste: "Le matching poste agrège la qualité des réponses structurées, les signaux de cohérence et les attentes prioritaires.",
    matching_manager: "Compatibilité manager à confirmer par entretien ciblé sur feedback, autonomie et arbitrage.",
    matching_equipe: "Compatibilité équipe estimée à partir des réponses de collaboration et de gestion des tensions.",
    soft_skills_forces_risques: analysisJson.soft_skill_scores ?? {},
    hard_skills_analysis: `Score hard skills: ${analysisJson.hard_skill_score ?? "n/a"}/100.`,
    points_de_vigilance: analysisJson.risk_level === "HIGH" ? ["Risque élevé à investiguer avant décision."] : ["Aucun signal bloquant automatique."],
    recommandations_rh: ["Conduire un entretien structuré", "Comparer avec les meilleurs candidats du poste", "Valider les points faibles par exemples factuels"],
    plan_integration_30_60_90: {
      "30_jours": "Alignement attentes, rituels, indicateurs et règles de décision.",
      "60_jours": "Responsabilisation progressive sur livrables clés.",
      "90_jours": "Revue d'impact, autonomie et compatibilité durable avec l'équipe."
    },
    avis_final: recommendation
  };
}
