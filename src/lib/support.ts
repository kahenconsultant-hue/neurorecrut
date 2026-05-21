export const CONTACT_CATEGORY_OPTIONS = [
  { value: "COMPANY", label: "Entreprise", description: "Démo, évaluation gratuite, achat ou questions RH." },
  { value: "CANDIDATE", label: "Candidat", description: "Invitation, compte candidat, évaluation ou données personnelles." },
  { value: "PARTNERSHIP", label: "Proposition de partenariat", description: "Cabinet, intégration, apport d'affaires ou écosystème." },
  { value: "PRESS", label: "Presse & médias", description: "Interview, article, demande d'information ou prise de parole." },
  { value: "DATA_PRIVACY", label: "Confidentialité & données", description: "Consentement, accès, rectification ou suppression." },
  { value: "TECHNICAL", label: "Support technique", description: "Problème d'accès ou incident hors espace entreprise." },
  { value: "OTHER", label: "Autre demande", description: "Toute demande qui ne rentre pas dans les catégories ci-dessus." }
] as const;

export const SUPPORT_CATEGORY_OPTIONS = [
  { value: "EVALUATION", label: "Évaluation IA" },
  { value: "CANDIDATE_INVITATION", label: "Invitation candidat" },
  { value: "REPORT", label: "Rapport & PDF" },
  { value: "BILLING", label: "Crédits, paiement & facturation" },
  { value: "ACCOUNT_ACCESS", label: "Compte & accès" },
  { value: "DATA_PRIVACY", label: "Données & confidentialité" },
  { value: "TECHNICAL", label: "Incident technique" },
  { value: "FEATURE_REQUEST", label: "Suggestion produit" },
  { value: "OTHER", label: "Autre demande" }
] as const;

export const SUPPORT_PRIORITY_OPTIONS = [
  { value: "LOW", label: "Faible", hint: "Question non bloquante ou amélioration." },
  { value: "NORMAL", label: "Normale", hint: "Besoin courant nécessitant un suivi." },
  { value: "HIGH", label: "Élevée", hint: "Flux RH ralenti ou candidat impacté." },
  { value: "URGENT", label: "Urgente", hint: "Accès bloqué, paiement critique ou échéance immédiate." }
] as const;

export const SUPPORT_STATUS_OPTIONS = [
  { value: "OPEN", label: "Ouvert" },
  { value: "IN_PROGRESS", label: "En traitement" },
  { value: "WAITING_COMPANY", label: "Réponse attendue" },
  { value: "RESOLVED", label: "Résolu" },
  { value: "CLOSED", label: "Clôturé" }
] as const;

function labelFor(options: readonly { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function contactCategoryLabel(value: string) {
  return labelFor(CONTACT_CATEGORY_OPTIONS, value);
}

export function supportCategoryLabel(value: string) {
  return labelFor(SUPPORT_CATEGORY_OPTIONS, value);
}

export function supportPriorityLabel(value: string) {
  return labelFor(SUPPORT_PRIORITY_OPTIONS, value);
}

export function supportStatusLabel(value: string) {
  return labelFor(SUPPORT_STATUS_OPTIONS, value);
}
