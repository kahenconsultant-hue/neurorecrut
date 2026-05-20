export type LegalDocSlug =
  | "politique-cookies"
  | "consentement-candidat"
  | "charte-ia-responsable"
  | "cgv-saas-b2b"
  | "politique-confidentialite"
  | "cgu-neurorecrut"
  | "mentions-legales";

export type LegalDoc = {
  slug: LegalDocSlug;
  title: string;
  shortTitle: string;
  updatedAt?: string;
  sections: Array<{
    heading?: string;
    paragraphs: string[];
  }>;
};

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "mentions-legales",
    title: "Mentions légales",
    shortTitle: "Mentions légales",
    sections: [
      {
        heading: "Éditeur du site",
        paragraphs: [
          "Le site NeuroRecrut est édité par KAHEN SOLUTION, Société par Actions Simplifiée Unipersonnelle (SASU), capital social : 500 euros.",
          "Siège social : 59 rue de Ponthieu, Bureau 326, 75008 Paris, France.",
          "Immatriculée au Registre du Commerce et des Sociétés de Paris. Président : Monsieur Sina Karimi.",
          "Email de contact : contact@neurorecrut.com. Site web : www.neurorecrut.com.",
          "Le directeur de la publication est Monsieur Sina Karimi."
        ]
      },
      {
        heading: "Hébergement",
        paragraphs: [
          "Le site est hébergé sur des infrastructures localisées en France et/ou dans l’Union Européenne via des prestataires techniques conformes aux exigences de sécurité et de protection des données applicables."
        ]
      },
      {
        heading: "Propriété intellectuelle",
        paragraphs: [
          "L’ensemble des contenus présents sur la plateforme NeuroRecrut, incluant notamment les textes, visuels, logos, éléments graphiques, interfaces, bases de données, méthodologies, structures d’évaluation, systèmes de scoring, algorithmes, analyses, rapports et contenus générés, est protégé par les dispositions du Code de la propriété intellectuelle.",
          "Toute reproduction, représentation, extraction, adaptation, diffusion ou exploitation totale ou partielle sans autorisation écrite préalable est strictement interdite."
        ]
      },
      {
        heading: "Responsabilité",
        paragraphs: [
          "NeuroRecrut constitue un outil d’assistance à l’évaluation RH reposant sur des indicateurs analytiques, comportementaux et psychométriques.",
          "La plateforme ne constitue ni un dispositif de décision automatisée autonome, ni un outil médical, psychologique ou psychiatrique.",
          "Les résultats, scores, indicateurs et analyses générés par la plateforme ont une valeur indicative et d’aide à la décision uniquement.",
          "Toute décision finale de recrutement, d’évaluation, de promotion, d’affectation ou de gestion des ressources humaines demeure sous la responsabilité exclusive de l’utilisateur humain ou de l’entreprise cliente.",
          "KAHEN SOLUTION ne garantit ni l’exactitude absolue, ni l’absence totale d’erreurs, ni la prédiction certaine des performances, comportements ou résultats futurs des personnes évaluées."
        ]
      },
      {
        heading: "Utilisation interdite",
        paragraphs: [
          "Il est strictement interdit d’utiliser la plateforme NeuroRecrut à des fins discriminatoires, illicites, contraires au droit du travail, contraires au RGPD, de profilage interdit ou de prise de décision exclusivement automatisée sans intervention humaine appropriée."
        ]
      },
      {
        heading: "Droit applicable",
        paragraphs: [
          "Les présentes mentions légales sont soumises au droit français.",
          "En cas de litige, compétence exclusive est attribuée aux juridictions compétentes du ressort de Paris, sauf disposition légale impérative contraire."
        ]
      }
    ]
  },
  {
    slug: "cgu-neurorecrut",
    title: "Conditions générales d’utilisation — NeuroRecrut",
    shortTitle: "CGU",
    sections: [
      {
        heading: "1. Objet",
        paragraphs: [
          "Les présentes Conditions Générales d’Utilisation définissent les conditions d’accès et d’utilisation de la plateforme NeuroRecrut éditée par KAHEN SOLUTION."
        ]
      },
      {
        heading: "2. Description du service",
        paragraphs: [
          "NeuroRecrut est une plateforme SaaS d’assistance à l’évaluation RH proposant notamment des questionnaires analytiques, analyses comportementales, indicateurs psychométriques, rapports RH, outils de comparaison et de compatibilité professionnelle et tableaux de bord analytiques.",
          "La plateforme constitue exclusivement un outil d’aide à la décision."
        ]
      },
      {
        heading: "3. Absence de décision automatisée",
        paragraphs: [
          "NeuroRecrut ne prend aucune décision autonome de recrutement, d’évaluation ou de gestion RH.",
          "Toute décision finale relève exclusivement de l’utilisateur humain ou de l’entreprise cliente."
        ]
      },
      {
        heading: "4. Accès au service",
        paragraphs: [
          "L’accès à certaines fonctionnalités nécessite la création d’un compte utilisateur sécurisé.",
          "L’utilisateur est responsable de la confidentialité de ses accès, des actions réalisées depuis son compte et de l’exactitude des informations transmises."
        ]
      },
      {
        heading: "5. Utilisation interdite",
        paragraphs: [
          "Il est strictement interdit d’utiliser la plateforme à des fins discriminatoires, d’exploiter les résultats comme unique critère décisionnel, de détourner les analyses à des fins illégales, d’effectuer des extractions massives non autorisées ou de tenter de contourner les mécanismes de sécurité."
        ]
      },
      {
        heading: "6. Propriété intellectuelle",
        paragraphs: [
          "L’ensemble des contenus, modèles, rapports, structures analytiques, méthodes, algorithmes et interfaces demeure la propriété exclusive de KAHEN SOLUTION."
        ]
      },
      {
        heading: "7. Limitation de responsabilité",
        paragraphs: [
          "Les résultats fournis par NeuroRecrut sont indicatifs.",
          "KAHEN SOLUTION ne garantit ni l’absence totale d’erreur, ni une exactitude absolue, ni des performances futures garanties."
        ]
      },
      {
        heading: "8. Disponibilité",
        paragraphs: [
          "KAHEN SOLUTION s’efforce d’assurer la disponibilité du service sans garantir une disponibilité ininterrompue."
        ]
      },
      {
        heading: "9. Suspension",
        paragraphs: [
          "KAHEN SOLUTION peut suspendre un compte en cas d’utilisation abusive, de violation des présentes CGU, de risque de sécurité ou de non-paiement."
        ]
      },
      {
        heading: "10. Droit applicable",
        paragraphs: ["Les présentes CGU sont soumises au droit français."]
      }
    ]
  },
  {
    slug: "cgv-saas-b2b",
    title: "Conditions générales de vente — SaaS B2B",
    shortTitle: "CGV SaaS B2B",
    sections: [
      {
        heading: "1. Objet",
        paragraphs: ["Les présentes CGV encadrent les prestations SaaS fournies par KAHEN SOLUTION via la plateforme NeuroRecrut."]
      },
      {
        heading: "2. Services",
        paragraphs: [
          "Les services peuvent inclure l’accès plateforme, la génération d’évaluations, les rapports RH, les tableaux de bord, l’assistance technique et les fonctionnalités IA d’aide analytique."
        ]
      },
      {
        heading: "3. Commande",
        paragraphs: ["Toute souscription implique acceptation complète des présentes CGV."]
      },
      {
        heading: "4. Tarification",
        paragraphs: [
          "Les prix sont exprimés hors taxes.",
          "KAHEN SOLUTION peut modifier ses tarifs avec préavis raisonnable."
        ]
      },
      {
        heading: "5. Paiement",
        paragraphs: ["Le défaut de paiement peut entraîner suspension du service, limitation d’accès ou résiliation."]
      },
      {
        heading: "6. Obligations du client",
        paragraphs: [
          "Le client s’engage à respecter le RGPD, à informer les candidats, à ne pas utiliser la plateforme de manière discriminatoire et à maintenir une supervision humaine des décisions RH."
        ]
      },
      {
        heading: "7. Limitation de responsabilité",
        paragraphs: [
          "KAHEN SOLUTION fournit un outil d’assistance analytique et non un système de décision autonome.",
          "La responsabilité de KAHEN SOLUTION ne pourra être engagée pour les décisions RH prises par le client, les erreurs d’interprétation, les pertes indirectes ou les dommages immatériels."
        ]
      },
      {
        heading: "8. Force majeure",
        paragraphs: ["Aucune partie ne pourra être tenue responsable en cas d’événement imprévisible et indépendant de sa volonté."]
      },
      {
        heading: "9. Résiliation",
        paragraphs: ["KAHEN SOLUTION peut résilier l’accès en cas d’usage illicite, de violation contractuelle, de risque sécurité ou de fraude."]
      },
      {
        heading: "10. Juridiction",
        paragraphs: ["Compétence exclusive des juridictions de Paris."]
      }
    ]
  },
  {
    slug: "politique-confidentialite",
    title: "Politique de confidentialité",
    shortTitle: "Confidentialité",
    updatedAt: "20/05/2026",
    sections: [
      {
        paragraphs: [
          "KAHEN SOLUTION attache une importance particulière à la protection des données personnelles et au respect de la vie privée des utilisateurs de la plateforme NeuroRecrut."
        ]
      },
      {
        heading: "1. Responsable du traitement",
        paragraphs: [
          "Les traitements de données réalisés via la plateforme NeuroRecrut sont effectués soit par l’entreprise cliente agissant en qualité de responsable de traitement, soit par KAHEN SOLUTION en qualité de sous-traitant technique et fournisseur de la plateforme.",
          "Dans certains cas limités liés au fonctionnement algorithmique, à la sécurité, aux statistiques techniques ou à l’amélioration des services, KAHEN SOLUTION peut agir en qualité de co-responsable de traitement."
        ]
      },
      {
        heading: "2. Données collectées",
        paragraphs: [
          "Les catégories de données susceptibles d’être collectées incluent notamment identité, adresse email, numéro de téléphone, CV et expériences professionnelles, profils professionnels publics, réponses aux questionnaires, indicateurs psychométriques et comportementaux, scores et résultats analytiques, données techniques de connexion, adresse IP, logs techniques, cookies et données de navigation.",
          "La plateforme ne collecte pas volontairement de données sensibles au sens de l’article 9 du RGPD."
        ]
      },
      {
        heading: "3. Finalités des traitements",
        paragraphs: [
          "Les données sont traitées afin de permettre l’utilisation de la plateforme, réaliser des évaluations RH, générer des rapports analytiques, faciliter l’aide à la décision RH, améliorer l’expérience utilisateur, assurer la sécurité technique, prévenir les usages frauduleux, produire des statistiques anonymisées et assurer le support client."
        ]
      },
      {
        heading: "4. Base légale",
        paragraphs: ["Les traitements reposent notamment sur le consentement des utilisateurs, l’exécution contractuelle, l’intérêt légitime et les obligations légales applicables."]
      },
      {
        heading: "5. Intelligence artificielle",
        paragraphs: [
          "Certaines fonctionnalités de NeuroRecrut utilisent des modèles d’intelligence artificielle et des prestataires technologiques tiers afin d’assister certaines analyses et synthèses.",
          "Ces traitements demeurent encadrés par des mesures contractuelles, organisationnelles et techniques appropriées.",
          "Aucune décision automatisée autonome produisant des effets juridiques n’est prise exclusivement par la plateforme. Toute décision finale demeure sous contrôle humain."
        ]
      },
      {
        heading: "6. Destinataires des données",
        paragraphs: [
          "Les données peuvent être accessibles aux entreprises clientes, recruteurs autorisés, prestataires techniques habilités, hébergeurs, fournisseurs d’infrastructure cloud et prestataires IA strictement nécessaires au fonctionnement du service.",
          "Les accès sont limités selon le principe du besoin d’en connaître."
        ]
      },
      {
        heading: "7. Conservation des données",
        paragraphs: [
          "Les données sont conservées pour des durées proportionnées aux finalités poursuivies : comptes inactifs 24 mois, CV et évaluations 24 mois maximum, logs techniques 12 mois, cookies analytiques 13 mois, sauvegardes techniques 90 jours."
        ]
      },
      {
        heading: "8. Sécurité",
        paragraphs: [
          "KAHEN SOLUTION met en œuvre des mesures de sécurité techniques et organisationnelles adaptées afin de protéger les données contre l’accès non autorisé, la perte, l’altération, la divulgation ou la destruction accidentelle."
        ]
      },
      {
        heading: "9. Droits des utilisateurs",
        paragraphs: [
          "Conformément au RGPD, les utilisateurs disposent notamment des droits d’accès, de rectification, d’effacement, d’opposition, de limitation, de portabilité et de retrait du consentement.",
          "Toute demande peut être adressée à privacy@neurorecrut.com."
        ]
      },
      {
        heading: "10. Réclamation",
        paragraphs: ["Les utilisateurs disposent du droit d’introduire une réclamation auprès de la CNIL : Commission Nationale de l’Informatique et des Libertés, www.cnil.fr."]
      },
      {
        heading: "11. Modification",
        paragraphs: ["KAHEN SOLUTION se réserve le droit de modifier la présente politique à tout moment afin d’assurer sa conformité légale, réglementaire ou technique."]
      }
    ]
  },
  {
    slug: "politique-cookies",
    title: "Politique cookies",
    shortTitle: "Cookies",
    updatedAt: "20/05/2026",
    sections: [
      {
        paragraphs: [
          "La plateforme NeuroRecrut utilise des cookies et technologies similaires afin d’assurer le bon fonctionnement du site, améliorer l’expérience utilisateur, mesurer l’audience et sécuriser les services proposés."
        ]
      },
      {
        heading: "1. Qu’est-ce qu’un cookie ?",
        paragraphs: ["Un cookie est un petit fichier enregistré sur le terminal de l’utilisateur lors de sa navigation sur un site internet."]
      },
      {
        heading: "2. Types de cookies utilisés",
        paragraphs: [
          "Cookies strictement nécessaires : fonctionnement technique du site, authentification utilisateur, sécurité, gestion des sessions.",
          "Cookies analytiques : mesure d’audience, statistiques de navigation, amélioration des performances.",
          "Cookies fonctionnels : mémorisation des préférences, personnalisation de l’interface.",
          "Aucun cookie publicitaire tiers invasif n’est volontairement utilisé sans consentement préalable."
        ]
      },
      {
        heading: "3. Consentement",
        paragraphs: [
          "Lors de la première visite, l’utilisateur peut accepter, refuser ou personnaliser les cookies non essentiels.",
          "Le consentement peut être retiré à tout moment."
        ]
      },
      {
        heading: "4. Durée de conservation",
        paragraphs: ["Les cookies analytiques sont conservés pour une durée maximale de 13 mois."]
      },
      {
        heading: "5. Gestion des cookies",
        paragraphs: ["L’utilisateur peut configurer son navigateur afin de bloquer certains cookies, supprimer les cookies existants ou limiter le suivi."]
      },
      {
        heading: "6. Contact",
        paragraphs: ["Pour toute question relative aux cookies : privacy@neurorecrut.com."]
      }
    ]
  },
  {
    slug: "charte-ia-responsable",
    title: "Charte d’utilisation responsable de l’IA",
    shortTitle: "Charte IA",
    sections: [
      {
        paragraphs: [
          "NeuroRecrut repose sur des technologies analytiques et d’intelligence artificielle destinées à assister les processus RH.",
          "Les principes suivants guident le fonctionnement de la plateforme : supervision humaine obligatoire, transparence raisonnable des traitements, proportionnalité des analyses, limitation des biais connus, protection des données personnelles, sécurité des traitements, absence de décision autonome, respect du droit du travail et du RGPD.",
          "Les analyses générées ne doivent jamais être interprétées comme des vérités absolues ou des diagnostics psychologiques."
        ]
      }
    ]
  },
  {
    slug: "consentement-candidat",
    title: "Consentement candidat",
    shortTitle: "Consentement candidat",
    sections: [
      {
        paragraphs: [
          "En accédant à la plateforme NeuroRecrut et en poursuivant l’évaluation, je reconnais avoir été informé(e) que mes données personnelles peuvent être traitées dans le cadre d’une évaluation RH.",
          "Certaines analyses reposent sur des modèles analytiques et algorithmiques d’assistance à l’évaluation.",
          "NeuroRecrut constitue un outil d’aide à la décision et non un système autonome de recrutement.",
          "Aucune décision finale me concernant n’est prise exclusivement de manière automatisée.",
          "Les résultats générés ont une valeur indicative et doivent être interprétés par des professionnels humains.",
          "Mes données peuvent être transmises à l’entreprise cliente ayant initié l’évaluation.",
          "Je peux exercer mes droits RGPD à tout moment."
        ]
      },
      {
        heading: "Documents associés",
        paragraphs: [
          "Je confirme avoir pris connaissance des Conditions Générales d’Utilisation, de la Politique de Confidentialité et de la Politique Cookies.",
          "Je consens au traitement de mes données dans les conditions décrites ci-dessus."
        ]
      }
    ]
  }
];

export function getLegalDoc(slug: string) {
  return LEGAL_DOCS.find((doc) => doc.slug === slug);
}
