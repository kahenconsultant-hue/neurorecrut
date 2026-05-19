import bcrypt from "bcryptjs";
import { Prisma, PrismaClient, Role, RiskLevel } from "@prisma/client";
import { PRICING_SEED, SOFT_SKILLS } from "../src/lib/constants";
import { fallbackEvaluation, fallbackHrReport, fallbackQualitativeAnalysis, fallbackTargetProfile } from "../src/lib/ai/fallbacks";
import { calculateScores } from "../src/lib/scoring/scoring-engine";
import { createReportPdfBuffer, type ReportPdfMetadata } from "../src/lib/pdf/report-pdf";
import type { CandidateAnswer, CandidateAnswersJson, EvaluationJson } from "../src/types/evaluation";

const prisma = new PrismaClient();

type CompanySeed = {
  uid: string;
  userEmail: string;
  userName: string;
  profile: Omit<Prisma.CompanyCreateInput, "uid" | "users" | "jobs">;
  jobs: JobSeed[];
};

type JobSeed = {
  uid: string;
  title: string;
  description: string;
  mainMissions: string;
  hardSkillsRequired: string;
  seniorityLevel: string;
  contractType: string;
  location: string;
  workMode: string;
  teamContext: string;
  managerProfile: string;
  managementStyle: string;
  workRhythm: string;
  mainConstraints: string;
  expectedPerformanceIndicators: string;
  companySpecificExpectations: string;
  skillOffset: number;
};

type CandidateSeed = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  linkedin: string;
  currentRole: string;
  experienceYears: number;
  education: string;
  availability: string;
  mobility: string;
  workPreferences: string;
  motivation: string;
  quality: "high" | "solid" | "medium" | "risky";
};

const password = "Password123!";

const companies: CompanySeed[] = [
  {
    uid: "demo_company_neurorecrut",
    userEmail: "company@demo-neurorecrut.fr",
    userName: "Claire Martin",
    profile: {
      ownerEmail: "rh@demo-neurorecrut.fr",
      name: "DemoScale RH",
      siretSiren: "12345678900011",
      sector: "SaaS B2B",
      size: "51-200",
      website: "https://demo-neurorecrut.fr",
      address: "10 rue de la Paix, 75002 Paris",
      hrContactName: "Claire Martin",
      hrContactEmail: "rh@demo-neurorecrut.fr",
      culture: "Culture orientée impact, autonomie responsable, feedback direct et transparence dans les arbitrages.",
      values: "Exigence, entraide, clarté, sens client, amélioration continue.",
      managementStyle: "Management exigeant, factuel, avec points de synchronisation hebdomadaires et autonomie forte.",
      teamWorkingStyle: "Collaboration transverse avec rituels courts, documentation des décisions et entraide opérationnelle.",
      workEnvironment: "Environnement hybride, rythme soutenu, forte interaction produit, sales et clients stratégiques."
    },
    jobs: [
      {
        uid: "demo_job_customer_success_lead",
        title: "Customer Success Lead",
        description: "Piloter un portefeuille clients stratégiques, réduire le churn et structurer les rituels d'adoption.",
        mainMissions: "Onboarding clients, QBR, coordination produit, analyse d'usage, escalades et plans de succès.",
        hardSkillsRequired: "SaaS B2B, CRM, analyse de données, conduite de réunion, anglais professionnel, adoption produit.",
        seniorityLevel: "Senior",
        contractType: "CDI",
        location: "Paris",
        workMode: "Hybride",
        teamContext: "Équipe CS de 7 personnes en interaction étroite avec Sales, Product et Support.",
        managerProfile: "Head of Customer Success orienté métriques, feedback direct et autonomie.",
        managementStyle: "Cadre clair, objectifs trimestriels, arbitrages rapides.",
        workRhythm: "Rythme hebdomadaire soutenu avec pics autour des renouvellements.",
        mainConstraints: "Clients exigeants, priorités concurrentes, forte visibilité business.",
        expectedPerformanceIndicators: "NRR, churn, adoption produit, satisfaction client, qualité des plans d'action.",
        companySpecificExpectations: "Communication claire, anticipation des risques, posture conseil.",
        skillOffset: 0
      },
      {
        uid: "demo_job_responsable_commercial_b2b",
        title: "Responsable Commercial B2B",
        description: "Développer un portefeuille mid-market, structurer le cycle de vente et sécuriser les prévisions commerciales.",
        mainMissions: "Prospection ciblée, découverte, démonstration, négociation, closing, forecast et transmission client.",
        hardSkillsRequired: "Vente complexe, qualification MEDDIC, négociation, CRM, forecasting, closing, social selling.",
        seniorityLevel: "Confirmé",
        contractType: "CDI",
        location: "Lyon",
        workMode: "Hybride",
        teamContext: "Équipe Sales de 10 personnes avec SDR, Account Executives et avant-vente.",
        managerProfile: "Sales Director orienté résultats, qualité de pipeline et discipline commerciale.",
        managementStyle: "Objectifs mensuels, coaching hebdomadaire, suivi précis des deals à risque.",
        workRhythm: "Rythme commercial intense avec points pipeline, rendez-vous clients et fin de trimestre sensible.",
        mainConstraints: "Pression objectifs, cycles multi-interlocuteurs, objections prix et concurrence agressive.",
        expectedPerformanceIndicators: "New ARR, taux de conversion, cycle moyen, forecast accuracy, marge préservée.",
        companySpecificExpectations: "Tenir la valeur, qualifier en profondeur, documenter les prochaines étapes.",
        skillOffset: 4
      }
    ]
  },
  {
    uid: "demo_company_asteria_health",
    userEmail: "sante@demo-neurorecrut.fr",
    userName: "Marion Lefèvre",
    profile: {
      ownerEmail: "talent@asteria-health.fr",
      name: "Asteria Health Services",
      siretSiren: "49876543200024",
      sector: "Santé & services opérationnels",
      size: "201-500",
      website: "https://asteria-health.fr",
      address: "24 avenue Jean Médecin, 06000 Nice",
      hrContactName: "Marion Lefèvre",
      hrContactEmail: "talent@asteria-health.fr",
      culture: "Culture terrain, qualité de service, sécurité patient, amélioration continue et respect des protocoles.",
      values: "Fiabilité, empathie, rigueur, responsabilité, coopération interdisciplinaire.",
      managementStyle: "Management structuré, disponible, orienté résolution de problèmes et suivi des indicateurs qualité.",
      teamWorkingStyle: "Coordination quotidienne entre opérations, qualité, RH, équipes cliniques et partenaires externes.",
      workEnvironment: "Environnement multisite, contraintes réglementaires fortes, urgence opérationnelle et exigence humaine élevée."
    },
    jobs: [
      {
        uid: "demo_job_product_manager_sante",
        title: "Product Manager Santé Digitale",
        description: "Piloter la feuille de route d'une plateforme de coordination patient utilisée par des équipes terrain.",
        mainMissions: "Discovery utilisateurs, priorisation roadmap, rédaction de specs, suivi delivery, mesure adoption et coordination support.",
        hardSkillsRequired: "Product discovery, priorisation, analytics produit, UX santé, RGPD, rédaction de user stories.",
        seniorityLevel: "Senior",
        contractType: "CDI",
        location: "Nice",
        workMode: "Hybride",
        teamContext: "Squad produit de 6 personnes avec engineering, design, data, référents métier et support.",
        managerProfile: "Directrice Produit pragmatique, très orientée valeur utilisateur et arbitrage data.",
        managementStyle: "Cadre priorisé, rituels produit courts, décisions documentées et feedback exigeant.",
        workRhythm: "Sprints de deux semaines avec urgences ponctuelles liées au terrain.",
        mainConstraints: "Contraintes réglementaires, utilisateurs peu disponibles, arbitrages impact/risque fréquents.",
        expectedPerformanceIndicators: "Adoption, activation, réduction tickets, satisfaction utilisateurs, respect roadmap.",
        companySpecificExpectations: "Comprendre le terrain, simplifier les parcours, sécuriser les arbitrages sensibles.",
        skillOffset: 8
      },
      {
        uid: "demo_job_responsable_operations_cliniques",
        title: "Responsable Opérations Cliniques",
        description: "Coordonner les opérations de plusieurs sites, fiabiliser les plannings et améliorer la qualité de service.",
        mainMissions: "Pilotage planning, coordination équipes, suivi qualité, gestion incidents, reporting direction et amélioration continue.",
        hardSkillsRequired: "Management opérationnel, planification, indicateurs qualité, gestion incident, Excel/BI, conformité santé.",
        seniorityLevel: "Confirmé",
        contractType: "CDI",
        location: "Marseille",
        workMode: "Sur site",
        teamContext: "Équipe de coordinateurs, référents qualité, responsables de site et professionnels de santé.",
        managerProfile: "Directeur des opérations orienté qualité, continuité de service et responsabilisation.",
        managementStyle: "Pilotage terrain, points quotidiens, arbitrage rapide et exigence de traçabilité.",
        workRhythm: "Rythme dense avec astreintes ponctuelles, pics d'activité et priorités opérationnelles mouvantes.",
        mainConstraints: "Imprévus de planning, contraintes humaines, exigences qualité et pression de continuité.",
        expectedPerformanceIndicators: "Taux de couverture planning, incidents résolus, satisfaction équipes, conformité, délais de traitement.",
        companySpecificExpectations: "Rester calme sous pression, arbitrer vite, communiquer clairement avec les équipes.",
        skillOffset: 12
      }
    ]
  }
];

const candidatesByJob: Record<string, CandidateSeed[]> = {
  demo_job_customer_success_lead: [
    {
      uid: "demo_candidate_nadia_benali",
      email: "nadia.benali@demo-candidat.fr",
      firstName: "Nadia",
      lastName: "Benali",
      phone: "+33 6 11 22 33 44",
      linkedin: "https://linkedin.com/in/nadia-benali-cs",
      currentRole: "Customer Success Manager",
      experienceYears: 6,
      education: "Master Management des organisations",
      availability: "1 mois",
      mobility: "Paris / Hybride",
      workPreferences: "Cadre clair, autonomie, feedback régulier et collaboration transverse.",
      motivation: "Rejoindre une équipe SaaS ambitieuse avec un fort enjeu client.",
      quality: "high"
    },
    {
      uid: "demo_candidate_lucas_perrin",
      email: "lucas.perrin@demo-candidat.fr",
      firstName: "Lucas",
      lastName: "Perrin",
      phone: "+33 6 23 45 67 81",
      linkedin: "https://linkedin.com/in/lucas-perrin-customer",
      currentRole: "Account Manager SaaS",
      experienceYears: 4,
      education: "École de commerce, spécialisation relation client",
      availability: "2 mois",
      mobility: "Paris et télétravail",
      workPreferences: "Objectifs mesurables, forte proximité client, coaching commercial.",
      motivation: "Évoluer vers un rôle plus stratégique sur l'adoption et le churn.",
      quality: "solid"
    }
  ],
  demo_job_responsable_commercial_b2b: [
    {
      uid: "demo_candidate_camille_moreau",
      email: "camille.moreau@demo-candidat.fr",
      firstName: "Camille",
      lastName: "Moreau",
      phone: "+33 6 48 12 90 34",
      linkedin: "https://linkedin.com/in/camille-moreau-sales",
      currentRole: "Account Executive B2B",
      experienceYears: 7,
      education: "Master Business Development",
      availability: "Immédiate",
      mobility: "Lyon / Rhône-Alpes",
      workPreferences: "Pipeline structuré, objectifs ambitieux, vente conseil et négociation cadrée.",
      motivation: "Prendre un périmètre commercial autonome avec un vrai enjeu de croissance.",
      quality: "high"
    },
    {
      uid: "demo_candidate_yassine_benamar",
      email: "yassine.benamar@demo-candidat.fr",
      firstName: "Yassine",
      lastName: "Benamar",
      phone: "+33 6 39 18 27 45",
      linkedin: "https://linkedin.com/in/yassine-benamar-b2b",
      currentRole: "Business Developer Senior",
      experienceYears: 5,
      education: "Licence commerce international",
      availability: "6 semaines",
      mobility: "Lyon / Hybride",
      workPreferences: "Terrain commercial, autonomie, manager disponible pour les deals complexes.",
      motivation: "Rejoindre une équipe qui valorise la méthode autant que le résultat.",
      quality: "medium"
    }
  ],
  demo_job_product_manager_sante: [
    {
      uid: "demo_candidate_clara_duval",
      email: "clara.duval@demo-candidat.fr",
      firstName: "Clara",
      lastName: "Duval",
      phone: "+33 6 42 51 63 74",
      linkedin: "https://linkedin.com/in/clara-duval-product",
      currentRole: "Product Owner Santé",
      experienceYears: 6,
      education: "Master Innovation Santé & Digital",
      availability: "1 mois",
      mobility: "Nice / Hybride",
      workPreferences: "Discovery terrain, arbitrage data, collaboration forte avec design et engineering.",
      motivation: "Construire un produit utile aux équipes de santé et mesurable dans son impact.",
      quality: "high"
    },
    {
      uid: "demo_candidate_thomas_renard",
      email: "thomas.renard@demo-candidat.fr",
      firstName: "Thomas",
      lastName: "Renard",
      phone: "+33 6 73 84 95 12",
      linkedin: "https://linkedin.com/in/thomas-renard-product",
      currentRole: "Chef de projet digital",
      experienceYears: 4,
      education: "Master Management de projet",
      availability: "3 mois",
      mobility: "Nice / Télétravail partiel",
      workPreferences: "Roadmap claire, relation métier, cadrage fonctionnel détaillé.",
      motivation: "Passer d'un pilotage projet à un rôle produit plus orienté utilisateur.",
      quality: "solid"
    }
  ],
  demo_job_responsable_operations_cliniques: [
    {
      uid: "demo_candidate_sarah_elbaz",
      email: "sarah.elbaz@demo-candidat.fr",
      firstName: "Sarah",
      lastName: "Elbaz",
      phone: "+33 6 58 21 47 90",
      linkedin: "https://linkedin.com/in/sarah-elbaz-operations",
      currentRole: "Coordinatrice opérations santé",
      experienceYears: 8,
      education: "Master Management des établissements de santé",
      availability: "Immédiate",
      mobility: "Marseille / Région PACA",
      workPreferences: "Terrain, équipe engagée, décisions rapides et traçabilité opérationnelle.",
      motivation: "Contribuer à une organisation clinique fiable et humaine.",
      quality: "solid"
    },
    {
      uid: "demo_candidate_mehdi_karim",
      email: "mehdi.karim@demo-candidat.fr",
      firstName: "Mehdi",
      lastName: "Karim",
      phone: "+33 6 81 92 13 54",
      linkedin: "https://linkedin.com/in/mehdi-karim-ops",
      currentRole: "Responsable planning multisite",
      experienceYears: 5,
      education: "Licence gestion des organisations",
      availability: "2 mois",
      mobility: "Marseille",
      workPreferences: "Organisation structurée, priorités nettes, manager accessible en cas d'urgence.",
      motivation: "Élargir son périmètre vers la qualité et le management opérationnel.",
      quality: "risky"
    }
  ]
};

async function main() {
  for (const plan of PRICING_SEED) {
    await prisma.pricingPlan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email: "admin@neurorecrut.local" },
    update: { passwordHash, role: Role.ADMIN },
    create: {
      email: "admin@neurorecrut.local",
      name: "Admin NeuroRecrut",
      passwordHash,
      role: Role.ADMIN
    }
  });

  const starter = await prisma.pricingPlan.findUniqueOrThrow({ where: { code: "starter" } });
  const agency = await prisma.pricingPlan.findUniqueOrThrow({ where: { code: "agency" } });

  for (const companySeed of companies) {
    const company = await prisma.company.upsert({
      where: { uid: companySeed.uid },
      update: companySeed.profile,
      create: {
        uid: companySeed.uid,
        ...companySeed.profile
      }
    });

    await prisma.user.upsert({
      where: { email: companySeed.userEmail },
      update: { passwordHash, companyId: company.id, role: Role.COMPANY, name: companySeed.userName },
      create: {
        email: companySeed.userEmail,
        name: companySeed.userName,
        passwordHash,
        role: Role.COMPANY,
        companyId: company.id
      }
    });

    await upsertCreditBalance({
      companyId: company.id,
      jobId: null,
      planId: agency.id,
      creditsPurchased: 100,
      creditsUsed: 0
    });

    for (const jobSeed of companySeed.jobs) {
      const softSkillMatrix = matrix(jobSeed.skillOffset);
      const job = await prisma.jobPosition.upsert({
        where: { uid: jobSeed.uid },
        update: {
          companyId: company.id,
          title: jobSeed.title,
          description: jobSeed.description,
          mainMissions: jobSeed.mainMissions,
          hardSkillsRequired: jobSeed.hardSkillsRequired,
          seniorityLevel: jobSeed.seniorityLevel,
          contractType: jobSeed.contractType,
          location: jobSeed.location,
          workMode: jobSeed.workMode,
          teamContext: jobSeed.teamContext,
          managerProfile: jobSeed.managerProfile,
          managementStyle: jobSeed.managementStyle,
          workRhythm: jobSeed.workRhythm,
          mainConstraints: jobSeed.mainConstraints,
          expectedPerformanceIndicators: jobSeed.expectedPerformanceIndicators,
          companySpecificExpectations: jobSeed.companySpecificExpectations,
          softSkillMatrix,
          status: "EVALUATION_GENERATED"
        },
        create: {
          uid: jobSeed.uid,
          companyId: company.id,
          title: jobSeed.title,
          description: jobSeed.description,
          mainMissions: jobSeed.mainMissions,
          hardSkillsRequired: jobSeed.hardSkillsRequired,
          seniorityLevel: jobSeed.seniorityLevel,
          contractType: jobSeed.contractType,
          location: jobSeed.location,
          workMode: jobSeed.workMode,
          teamContext: jobSeed.teamContext,
          managerProfile: jobSeed.managerProfile,
          managementStyle: jobSeed.managementStyle,
          workRhythm: jobSeed.workRhythm,
          mainConstraints: jobSeed.mainConstraints,
          expectedPerformanceIndicators: jobSeed.expectedPerformanceIndicators,
          companySpecificExpectations: jobSeed.companySpecificExpectations,
          softSkillMatrix,
          status: "EVALUATION_GENERATED"
        }
      });

      const targetProfile = fallbackTargetProfile(
        {
          title: job.title,
          hardSkillsRequired: job.hardSkillsRequired,
          managementStyle: job.managementStyle
        },
        {
          culture: company.culture,
          teamWorkingStyle: company.teamWorkingStyle,
          managementStyle: company.managementStyle
        }
      );

      await prisma.jobPosition.update({
        where: { id: job.id },
        data: {
          targetProfile: targetProfile as Prisma.InputJsonValue,
          targetProfileGeneratedAt: new Date()
        }
      });

      const evaluationJson = fallbackEvaluation(company.uid, job.uid, job.title);
      const evaluation = await prisma.evaluation.upsert({
        where: { uid: `demo_eval_${job.uid}` },
        update: { json: evaluationJson as unknown as Prisma.InputJsonValue, companyId: company.id, jobId: job.id, status: "GENERATED" },
        create: {
          uid: `demo_eval_${job.uid}`,
          companyId: company.id,
          jobId: job.id,
          json: evaluationJson as unknown as Prisma.InputJsonValue,
          status: "GENERATED"
        }
      });

      await upsertCreditBalance({
        companyId: company.id,
        jobId: job.id,
        planId: starter.id,
        creditsPurchased: 12,
        creditsUsed: 2
      });

      const jobCandidates = candidatesByJob[job.uid] ?? [];
      for (const candidateSeed of jobCandidates) {
        await seedCandidateEvaluation(company.id, job.id, evaluation.id, evaluationJson, candidateSeed);
      }
    }
  }

  console.log("Seed NeuroRecrut terminé.");
  console.log(`Admin: admin@neurorecrut.local / ${password}`);
  console.log(`Entreprise 1: company@demo-neurorecrut.fr / ${password}`);
  console.log(`Entreprise 2: sante@demo-neurorecrut.fr / ${password}`);
  console.log(`Candidats demo: adresses @demo-candidat.fr / ${password}`);
}

async function seedCandidateEvaluation(
  companyId: string,
  jobId: string,
  evaluationId: string,
  evaluationJson: EvaluationJson,
  candidateSeed: CandidateSeed
) {
  const candidate = await prisma.candidate.upsert({
    where: { uid: candidateSeed.uid },
    update: {
      companyId,
      firstName: candidateSeed.firstName,
      lastName: candidateSeed.lastName,
      email: candidateSeed.email,
      phone: candidateSeed.phone,
      linkedin: candidateSeed.linkedin,
      currentRole: candidateSeed.currentRole,
      experienceYears: candidateSeed.experienceYears,
      education: candidateSeed.education,
      availability: candidateSeed.availability,
      mobility: candidateSeed.mobility,
      motivation: candidateSeed.motivation,
      workPreferences: candidateSeed.workPreferences,
      resumeJson: resumeJson(candidateSeed) as Prisma.InputJsonValue
    },
    create: {
      uid: candidateSeed.uid,
      companyId,
      firstName: candidateSeed.firstName,
      lastName: candidateSeed.lastName,
      email: candidateSeed.email,
      phone: candidateSeed.phone,
      linkedin: candidateSeed.linkedin,
      currentRole: candidateSeed.currentRole,
      experienceYears: candidateSeed.experienceYears,
      education: candidateSeed.education,
      availability: candidateSeed.availability,
      mobility: candidateSeed.mobility,
      motivation: candidateSeed.motivation,
      workPreferences: candidateSeed.workPreferences,
      resumeJson: resumeJson(candidateSeed) as Prisma.InputJsonValue
    }
  });

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email: candidateSeed.email },
    update: { passwordHash, candidateId: candidate.id, role: Role.CANDIDATE, name: `${candidateSeed.firstName} ${candidateSeed.lastName}` },
    create: {
      email: candidateSeed.email,
      name: `${candidateSeed.firstName} ${candidateSeed.lastName}`,
      passwordHash,
      role: Role.CANDIDATE,
      candidateId: candidate.id
    }
  });

  const invitation = await prisma.evaluationInvitation.upsert({
    where: { uid: `demo_inv_${candidateSeed.uid}` },
    update: {
      companyId,
      jobId,
      evaluationId,
      candidateId: candidate.id,
      candidateEmail: candidate.email,
      status: "COMPLETED",
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 28),
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    },
    create: {
      uid: `demo_inv_${candidateSeed.uid}`,
      companyId,
      jobId,
      evaluationId,
      candidateId: candidate.id,
      candidateEmail: candidate.email,
      status: "COMPLETED",
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 28),
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    }
  });

  const answers = buildAnswers(evaluationJson, candidateSeed);
  const responseUid = `demo_resp_${candidateSeed.uid}`;
  const answersJson: CandidateAnswersJson = {
    response_uid: responseUid,
    answers
  };

  const response = await prisma.candidateResponse.upsert({
    where: { invitationId: invitation.id },
    update: {
      candidateId: candidate.id,
      companyId,
      jobId,
      evaluationId,
      answersJson: answersJson as unknown as Prisma.InputJsonValue,
      draftJson: { answers } as unknown as Prisma.InputJsonValue,
      isSubmitted: true,
      submittedAt: invitation.completedAt,
      lockedAt: invitation.completedAt
    },
    create: {
      uid: responseUid,
      candidateId: candidate.id,
      companyId,
      jobId,
      evaluationId,
      invitationId: invitation.id,
      answersJson: answersJson as unknown as Prisma.InputJsonValue,
      draftJson: { answers } as unknown as Prisma.InputJsonValue,
      isSubmitted: true,
      submittedAt: invitation.completedAt,
      lockedAt: invitation.completedAt
    }
  });

  const scores = calculateScores(evaluationJson, answers);
  const qualitative = fallbackQualitativeAnalysis(scores);
  const analysisJson = {
    ...scores,
    qualitative,
    generated_at: new Date().toISOString()
  };
  const reportJson = fallbackHrReport(analysisJson);
  const fullResponse = await prisma.candidateResponse.findUniqueOrThrow({
    where: { id: response.id },
    include: { candidate: true, job: { include: { company: true } }, company: true }
  });
  const metadata = pdfMetadata(fullResponse);
  const pdfBuffer = await createReportPdfBuffer({ reportJson, analysisJson, metadata }, "Rapport NeuroRecrut");

  await prisma.analysisReport.upsert({
    where: { responseId: response.id },
    update: {
      companyId,
      jobId,
      evaluationId,
      candidateId: candidate.id,
      analysisJson: analysisJson as unknown as Prisma.InputJsonValue,
      reportJson: reportJson as unknown as Prisma.InputJsonValue,
      pdfBuffer: bytesInput(pdfBuffer),
      pdfFileName: `rapport-neurorecrut-${candidateSeed.lastName.toLowerCase()}.pdf`,
      globalScore: scores.global_score,
      matchingScore: scores.job_matching_score,
      coherenceIndex: scores.coherence_index,
      sincerityIndex: scores.sincerity_index,
      riskLevel: scores.risk_level as RiskLevel,
      recommendation: scores.recommendation,
      finalOpinion: scores.final_opinion
    },
    create: {
      uid: `demo_report_${candidateSeed.uid}`,
      companyId,
      jobId,
      evaluationId,
      candidateId: candidate.id,
      responseId: response.id,
      analysisJson: analysisJson as unknown as Prisma.InputJsonValue,
      reportJson: reportJson as unknown as Prisma.InputJsonValue,
      pdfBuffer: bytesInput(pdfBuffer),
      pdfFileName: `rapport-neurorecrut-${candidateSeed.lastName.toLowerCase()}.pdf`,
      globalScore: scores.global_score,
      matchingScore: scores.job_matching_score,
      coherenceIndex: scores.coherence_index,
      sincerityIndex: scores.sincerity_index,
      riskLevel: scores.risk_level as RiskLevel,
      recommendation: scores.recommendation,
      finalOpinion: scores.final_opinion
    }
  });
}

function buildAnswers(evaluation: EvaluationJson, candidate: CandidateSeed): CandidateAnswer[] {
  const rankByQuality = {
    high: [0, 1, 0, 1, 0, 0],
    solid: [1, 0, 1, 2, 0, 1],
    medium: [2, 1, 2, 1, 3, 2],
    risky: [3, 2, 4, 3, 2, 1]
  }[candidate.quality];

  return evaluation.blocks.flatMap((block, blockIndex) =>
    block.questions.map((question, questionIndex) => {
      const base = {
        question_uid: question.question_uid,
        type: question.type,
        answered_at: new Date(Date.now() - 1000 * 60 * (blockIndex * 10 + questionIndex + 1)).toISOString()
      };

      if (question.choices.length > 0) {
        const ordered = [...question.choices].sort((a, b) => b.score_value - a.score_value);
        const selected = ordered[Math.min(rankByQuality[(blockIndex + questionIndex) % rankByQuality.length], ordered.length - 1)] ?? ordered[0];
        return {
          ...base,
          selected_choice_uid: selected.choice_uid
        };
      }

      return {
        ...base,
        text_answer: demoTextAnswer(candidate, questionIndex)
      };
    })
  );
}

function demoTextAnswer(candidate: CandidateSeed, index: number) {
  const depth =
    candidate.quality === "high"
      ? "Je commence par clarifier les faits, l'impact métier et les risques, puis je propose une décision datée avec deux options argumentées."
      : candidate.quality === "solid"
        ? "Je vérifie les éléments disponibles, je contacte les personnes concernées et je formalise une réponse structurée avant d'agir."
        : candidate.quality === "medium"
          ? "Je cherche d'abord à comprendre le blocage principal, puis je priorise l'action la plus pragmatique avec l'accord du manager."
          : "Je traite l'urgence en premier et je demande ensuite un arbitrage pour sécuriser la suite.";

  return `${depth} Dans cette situation, je préviens les parties prenantes, je garde une trace écrite et je reviens avec un plan court: action immédiate, point de contrôle, décision finale. Exemple ${index + 1}.`;
}

function matrix(offset: number) {
  return Object.fromEntries(
    SOFT_SKILLS.map((skill, index) => {
      const score = ((index + offset) % 5) + 1;
      return [skill, Math.max(2, Math.min(5, score))];
    })
  );
}

function resumeJson(candidate: CandidateSeed) {
  return {
    headline: `${candidate.currentRole} · ${candidate.experienceYears} ans d'expérience`,
    professional_summary: `${candidate.firstName} ${candidate.lastName} dispose d'un parcours cohérent avec le poste ciblé, avec une expérience centrée sur l'impact opérationnel et la collaboration transverse.`,
    key_skills: candidate.workPreferences,
    education: candidate.education,
    languages: "Français courant, anglais professionnel",
    availability: candidate.availability,
    mobility: candidate.mobility
  };
}

async function upsertCreditBalance(input: {
  companyId: string;
  jobId: string | null;
  planId: string;
  creditsPurchased: number;
  creditsUsed: number;
}) {
  const existing = await prisma.creditBalance.findFirst({
    where: {
      companyId: input.companyId,
      jobId: input.jobId,
      planId: input.planId
    }
  });

  if (existing) {
    await prisma.creditBalance.update({
      where: { id: existing.id },
      data: {
        creditsPurchased: input.creditsPurchased,
        creditsUsed: input.creditsUsed,
        active: true
      }
    });
    return;
  }

  await prisma.creditBalance.create({
    data: {
      companyId: input.companyId,
      jobId: input.jobId,
      planId: input.planId,
      creditsPurchased: input.creditsPurchased,
      creditsUsed: input.creditsUsed,
      active: true
    }
  });
}

function pdfMetadata(response: Awaited<ReturnType<typeof prisma.candidateResponse.findUniqueOrThrow>> & {
  candidate: NonNullable<Awaited<ReturnType<typeof prisma.candidate.findFirst>>>;
  job: NonNullable<Awaited<ReturnType<typeof prisma.jobPosition.findFirst>>> & {
    company: NonNullable<Awaited<ReturnType<typeof prisma.company.findFirst>>>;
  };
  company: NonNullable<Awaited<ReturnType<typeof prisma.company.findFirst>>>;
}): ReportPdfMetadata {
  return {
    candidate: {
      nom: [response.candidate.firstName, response.candidate.lastName].filter(Boolean).join(" ") || response.candidate.email,
      email: response.candidate.email,
      poste_actuel: response.candidate.currentRole ?? "-",
      experience: response.candidate.experienceYears != null ? `${response.candidate.experienceYears} ans` : "-",
      disponibilite: response.candidate.availability ?? "-"
    },
    job: {
      poste: response.job.title,
      contrat: response.job.contractType,
      localisation: response.job.location,
      mode: response.job.workMode,
      niveau: response.job.seniorityLevel
    },
    company: {
      entreprise: response.job.company.name ?? "Entreprise",
      secteur: response.job.company.sector ?? "-",
      taille: response.job.company.size ?? "-",
      contact_rh: response.job.company.hrContactName ?? "-",
      email_rh: response.job.company.hrContactEmail ?? "-"
    }
  };
}

function bytesInput(buffer: Buffer): Uint8Array<ArrayBuffer> {
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);
  const view = new Uint8Array(arrayBuffer);
  view.set(buffer);
  return view;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
