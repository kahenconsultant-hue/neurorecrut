export const APP_NAME = "NeuroRecrut";

export const SOFT_SKILLS = [
  "Négociation",
  "Gestion des conflits",
  "Écoute active",
  "Influence / persuasion",
  "Travail en équipe",
  "Communication écrite",
  "Présentations orales",
  "Autonomie",
  "Rigueur",
  "Fiabilité",
  "Sens des responsabilités",
  "Créativité",
  "Réactivité",
  "Empathie",
  "Résistance au stress",
  "Apprentissage rapide",
  "Gestion de l’ambiguïté",
  "Capacité à prioriser"
] as const;

export const SOFT_SKILL_SCALE = [
  "Sans importance",
  "Peu important",
  "Moyennement important",
  "Important",
  "Critique",
  "Indispensable"
] as const;

export const BLOCK_WEIGHTS: Record<string, number> = {
  "Cognition & Logique": 15,
  "Personnalité croisée": 20,
  "Valeurs & comportements sociaux": 15,
  "Réactions émotionnelles & stress": 15,
  "Hard skills dissimulés": 20,
  "Cohérence & fiabilité psychométrique": 15
};

export const EVALUATION_BLOCKS = Object.keys(BLOCK_WEIGHTS);

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  TARGET_PROFILE_GENERATED: "Profil cible généré",
  EVALUATION_GENERATED: "Évaluation générée",
  INVITATIONS_SENT: "Invitation envoyée",
  INVITED: "Invitation envoyée",
  STARTED: "En cours",
  COMPLETED: "Complété",
  EXPIRED: "Expiré",
  GENERATED: "Évaluation générée",
  PAID: "Payé",
  PENDING: "En attente",
  OPEN: "Ouvert",
  IN_PROGRESS: "En traitement",
  WAITING_COMPANY: "Réponse attendue",
  RESOLVED: "Résolu",
  CLOSED: "Clôturé",
  LOW: "Faible",
  NORMAL: "Normale",
  HIGH: "Élevée",
  URGENT: "Urgente"
};

export const PRICING_SEED = [
  {
    code: "starter",
    name: "Starter",
    description: "3 évaluations pour 1 poste",
    priceCents: 14900,
    credits: 3,
    jobScoped: true,
    monthly: false
  },
  {
    code: "growth",
    name: "Growth",
    description: "5 évaluations pour 1 poste",
    priceCents: 19900,
    credits: 5,
    jobScoped: true,
    monthly: false
  },
  {
    code: "pro",
    name: "Pro",
    description: "15 évaluations pour 1 poste",
    priceCents: 39900,
    credits: 15,
    jobScoped: true,
    monthly: false
  },
  {
    code: "agency",
    name: "Agency Pack",
    description: "Jusqu'à 100 évaluations par mois",
    priceCents: 150000,
    credits: 100,
    jobScoped: false,
    monthly: true
  }
] as const;
