export const COMPANY_SECTOR_OPTIONS = [
  "Santé, médico-social et services à la personne",
  "SaaS, numérique et services B2B",
  "Industrie, production et supply chain",
  "Commerce, retail et e-commerce",
  "Finance, assurance et services réglementés",
  "Conseil, formation et services professionnels",
  "Éducation, secteur public ou associatif",
  "Autre secteur avec contexte spécifique à préciser"
];

export const COMPANY_SIZE_OPTIONS = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

export const COMPANY_CULTURE_OPTIONS = [
  "Culture orientée qualité et sécurité: fiabilité, conformité, documentation, réduction du risque et respect des standards.",
  "Culture terrain et service client: réactivité, sens du service, empathie, proximité opérationnelle et résolution concrète des problèmes.",
  "Culture performance et objectifs: pilotage par indicateurs, priorisation business, exigence de résultat et rythme soutenu.",
  "Culture collaborative: entraide, coopération interdisciplinaire, feedback régulier et décisions partagées.",
  "Culture innovation et amélioration continue: expérimentation cadrée, apprentissage rapide, autonomie et optimisation des méthodes.",
  "Culture de responsabilité: ownership individuel, transparence, respect des engagements et capacité à alerter tôt."
];

export const COMPANY_VALUES_OPTIONS = [
  "Fiabilité, rigueur, sens des responsabilités et respect des engagements.",
  "Empathie, écoute active, coopération et respect des personnes.",
  "Exigence, performance, ambition mesurée et culture du résultat.",
  "Transparence, clarté de communication, feedback direct et confiance.",
  "Créativité, apprentissage, adaptabilité et amélioration continue.",
  "Qualité de service, orientation client, impact concret et professionnalisme.",
  "Éthique, confidentialité, conformité et gestion prudente des risques."
];

export const MANAGEMENT_STYLE_OPTIONS = [
  "Management structuré: objectifs clairs, rituels réguliers, suivi des indicateurs et arbitrages explicites.",
  "Management participatif: consultation de l'équipe, décision argumentée, autonomie encadrée et feedback partagé.",
  "Management coaching: développement des compétences, accompagnement individuel, droit à l'erreur cadré et progression continue.",
  "Management orienté terrain: présence opérationnelle, résolution rapide des blocages, priorités concrètes et coordination quotidienne.",
  "Management data-driven: décisions fondées sur les données, transparence des métriques et amélioration mesurable.",
  "Management exigeant et direct: haut niveau d'attente, feedback franc, rythme soutenu et responsabilisation forte.",
  "Management délégatif: forte autonomie, confiance élevée, contrôle par résultats et faible micro-management."
];

export const TEAM_WORKING_STYLE_OPTIONS = [
  "Coordination quotidienne entre métiers, points courts, décisions rapides et circulation fluide de l'information.",
  "Travail en équipe projet: objectifs communs, rôles distribués, jalons partagés et forte interdépendance.",
  "Fonctionnement transverse: collaboration avec plusieurs départements, parties prenantes variées et arbitrages fréquents.",
  "Mode documenté et asynchrone: écrits structurés, traçabilité, préparation en amont et autonomie.",
  "Équipe très autonome: responsabilités individuelles fortes, entraide ponctuelle et faible supervision directe.",
  "Équipe en croissance ou transformation: process à stabiliser, ajustements rapides et tolérance à l'ambiguïté.",
  "Équipe terrain ou multisite: coordination à distance, contraintes opérationnelles et adaptation au contexte local."
];

export const WORK_ENVIRONMENT_OPTIONS = [
  "Environnement réglementé ou sensible: conformité, confidentialité, sécurité et tolérance faible aux erreurs.",
  "Environnement multisite ou terrain: déplacements, coordination opérationnelle et réalités locales variables.",
  "Environnement à forte urgence opérationnelle: imprévus fréquents, priorisation rapide et sang-froid nécessaire.",
  "Environnement hybride structuré: présence planifiée, outils collaboratifs, autonomie et communication écrite claire.",
  "Environnement remote-first: forte autonomie, documentation, communication asynchrone et discipline personnelle.",
  "Environnement de croissance: rythme soutenu, changements fréquents, priorités mouvantes et besoin d'adaptation.",
  "Environnement client-facing: exposition externe, pression relationnelle, exigence de qualité de service et posture professionnelle."
];

export const COMPANY_PROFILE_CHOICE_GROUPS = [
  {
    name: "culture",
    label: "Culture d'entreprise",
    options: COMPANY_CULTURE_OPTIONS,
    hint: "Sélectionnez les marqueurs qui décrivent le mieux la culture réellement vécue."
  },
  {
    name: "values",
    label: "Valeurs prioritaires",
    options: COMPANY_VALUES_OPTIONS,
    hint: "Choisissez les valeurs qui doivent se retrouver chez les candidats."
  },
  {
    name: "managementStyle",
    label: "Style de management dominant",
    options: MANAGEMENT_STYLE_OPTIONS,
    hint: "Décrivez le style managérial le plus fréquent dans l'entreprise."
  },
  {
    name: "teamWorkingStyle",
    label: "Mode de travail des équipes",
    options: TEAM_WORKING_STYLE_OPTIONS,
    hint: "Indiquez comment les équipes collaborent au quotidien."
  },
  {
    name: "workEnvironment",
    label: "Environnement de travail",
    options: WORK_ENVIRONMENT_OPTIONS,
    hint: "Ajoutez les contraintes qui influencent le comportement attendu."
  }
] as const;

export const JOB_MISSION_OPTIONS = [
  "Piloter un portefeuille d'activités avec priorisation, suivi d'avancement et arbitrage des urgences.",
  "Développer et sécuriser la relation client ou partenaire sur un cycle complet.",
  "Analyser des besoins métier, structurer une réponse et transformer l'information en plan d'action.",
  "Coordonner plusieurs parties prenantes internes et externes jusqu'à la livraison attendue.",
  "Produire, contrôler ou améliorer des livrables avec exigences de qualité, délai et conformité.",
  "Identifier les risques opérationnels, proposer des corrections et documenter les décisions.",
  "Contribuer à l'amélioration continue des processus, outils, méthodes ou indicateurs."
];

export const JOB_HARD_SKILL_OPTIONS = [
  "Maîtrise des outils métier, CRM, ATS, ERP ou plateformes collaboratives selon le contexte du poste.",
  "Analyse de données, reporting, suivi de KPI et capacité à formaliser des décisions chiffrées.",
  "Compétences commerciales: qualification, négociation, closing, gestion d'objections et suivi de pipeline.",
  "Compétences projet: cadrage, planification, coordination, gestion des dépendances et suivi des risques.",
  "Connaissance réglementaire, qualité, sécurité, conformité ou confidentialité liée au secteur.",
  "Compétences rédactionnelles professionnelles: synthèse, compte rendu, documentation et communication écrite.",
  "Expertise technique ou métier spécifique à préciser dans le champ complémentaire."
];

export const JOB_TEAM_CONTEXT_OPTIONS = [
  "Équipe mature avec process existants, objectifs clairs et besoin de continuité opérationnelle.",
  "Équipe en création ou forte croissance, avec méthodes à structurer et priorités évolutives.",
  "Équipe transverse travaillant avec plusieurs métiers, managers ou partenaires externes.",
  "Équipe terrain ou multisite nécessitant coordination, disponibilité et adaptation locale.",
  "Équipe orientée client, exposée à des demandes urgentes, objections ou situations sensibles.",
  "Équipe technique ou produit fonctionnant par cycles, backlog, arbitrages et livraisons itératives.",
  "Équipe sous contrainte de qualité, conformité, sécurité ou traçabilité renforcée."
];

export const JOB_MANAGER_PROFILE_OPTIONS = [
  "Manager expert métier, précis dans ses attentes, attentif à la qualité d'exécution et à la fiabilité.",
  "Manager coach, disponible pour faire progresser, mais attendant autonomie et capacité d'apprentissage.",
  "Manager orienté indicateurs, décisions factuelles, suivi régulier et exigence de performance.",
  "Manager opérationnel terrain, proche des équipes, arbitrant vite les urgences et blocages.",
  "Manager commercial ou client-facing, sensible à la posture relationnelle, à l'influence et au résultat.",
  "Manager de transformation, à l'aise avec l'ambiguïté, le changement et les priorités mouvantes."
];

export const JOB_WORK_RHYTHM_OPTIONS = [
  "Rythme stable avec routines, priorités planifiées et suivi régulier des livrables.",
  "Rythme soutenu avec délais courts, forte charge ponctuelle et arbitrages fréquents.",
  "Rythme cyclique avec pics saisonniers, clôtures mensuelles, périodes commerciales ou deadlines projet.",
  "Rythme agile par sprints, itérations rapides, feedback fréquent et priorisation continue.",
  "Rythme d'urgence opérationnelle avec imprévus, interruptions et besoin de sang-froid.",
  "Rythme relationnel intense avec réunions, relances, négociations ou interactions client quotidiennes."
];

export const JOB_CONSTRAINT_OPTIONS = [
  "Informations parfois incomplètes ou ambiguës nécessitant clarification, hypothèses et décisions prudentes.",
  "Délais serrés et priorités concurrentes demandant arbitrage, anticipation et communication claire.",
  "Pression client, patient, utilisateur ou partenaire avec enjeux relationnels élevés.",
  "Contraintes réglementaires, qualité, sécurité, confidentialité ou traçabilité non négociables.",
  "Ressources limitées: budget, temps, effectif, disponibilité managériale ou dépendances externes.",
  "Conflits potentiels entre parties prenantes, attentes divergentes ou décisions impopulaires à porter.",
  "Changement fréquent de contexte, outils, organisation ou priorités."
];

export const JOB_PERFORMANCE_OPTIONS = [
  "Qualité des livrables, conformité aux standards et baisse mesurable des erreurs ou reprises.",
  "Respect des délais, tenue des engagements et visibilité fiable sur l'avancement.",
  "Satisfaction client, utilisateur, patient ou partenaire et qualité de la relation.",
  "Atteinte des objectifs commerciaux, opérationnels ou financiers définis pour le poste.",
  "Capacité à prioriser, décider et alerter tôt en cas de risque.",
  "Amélioration continue: process optimisés, documentation utile et apprentissages partagés.",
  "Coopération équipe-manager: feedback, coordination, fiabilité et posture constructive."
];

export const JOB_EXPECTATION_OPTIONS = [
  "Autonomie responsable: avancer seul, demander de l'aide au bon moment et tenir ses engagements.",
  "Communication claire: synthèse, transparence sur les risques, écrits exploitables et écoute active.",
  "Rigueur décisionnelle: distinguer faits, hypothèses, opinions et conséquences avant d'agir.",
  "Résistance au stress: garder une posture professionnelle sous pression ou face à l'urgence.",
  "Influence constructive: convaincre sans manipuler, négocier des compromis et gérer les objections.",
  "Compatibilité équipe-manager: accepter le feedback, coopérer et s'adapter au mode de pilotage.",
  "Apprentissage rapide: intégrer le contexte, corriger ses pratiques et monter en compétence."
];

export const JOB_CHOICE_GROUPS = [
  {
    name: "mainMissions",
    label: "Missions principales",
    options: JOB_MISSION_OPTIONS,
    hint: "Sélectionnez les missions réellement centrales pour ce poste."
  },
  {
    name: "hardSkillsRequired",
    label: "Hard skills requis",
    options: JOB_HARD_SKILL_OPTIONS,
    hint: "Choisissez les compétences techniques ou métier à tester indirectement."
  },
  {
    name: "teamContext",
    label: "Contexte équipe",
    options: JOB_TEAM_CONTEXT_OPTIONS,
    hint: "Précisez l'environnement collectif dans lequel le candidat devra réussir."
  },
  {
    name: "managerProfile",
    label: "Profil manager",
    options: JOB_MANAGER_PROFILE_OPTIONS,
    hint: "Sélectionnez le type de manager avec lequel le candidat travaillera."
  },
  {
    name: "managementStyle",
    label: "Style de management",
    options: MANAGEMENT_STYLE_OPTIONS,
    hint: "Indiquez le mode de pilotage attendu pour ce poste."
  },
  {
    name: "workRhythm",
    label: "Rythme de travail",
    options: JOB_WORK_RHYTHM_OPTIONS,
    hint: "Décrivez le rythme réel du poste."
  },
  {
    name: "mainConstraints",
    label: "Contraintes principales",
    options: JOB_CONSTRAINT_OPTIONS,
    hint: "Ces contraintes serviront à contextualiser les scénarios d'évaluation."
  },
  {
    name: "expectedPerformanceIndicators",
    label: "Indicateurs de performance attendus",
    options: JOB_PERFORMANCE_OPTIONS,
    hint: "Sélectionnez les indicateurs qui permettront de juger la réussite."
  },
  {
    name: "companySpecificExpectations",
    label: "Attentes spécifiques entreprise",
    options: JOB_EXPECTATION_OPTIONS,
    hint: "Ajoutez les attentes comportementales qui doivent peser dans l'évaluation."
  }
] as const;
