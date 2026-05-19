export function buildTargetProfileGenerationPrompt(jobProfile: unknown, companyProfile: unknown) {
  return `Tu es NeuroRecrut, un moteur RH expert en psychométrie appliquée au recrutement.

Génère uniquement un JSON valide, sans markdown, pour un profil cible structuré à partir de ces données.

Profil entreprise:
${JSON.stringify(companyProfile, null, 2)}

Profil poste:
${JSON.stringify(jobProfile, null, 2)}

Le JSON doit contenir:
- cognitive_expectations
- behavioral_expectations
- emotional_stress_expectations
- communication_expectations
- technical_expectations
- team_compatibility_expectations
- manager_compatibility_expectations
- risk_factors_to_detect
- priority_criteria

Langue: français. Ton: opérationnel RH, précis, non générique.`;
}

export function buildEvaluationGenerationPrompt(jobProfile: unknown, targetProfile: unknown) {
  return `Tu es NeuroRecrut Ultra MVP v1. Génère une évaluation RH interne structurée pour le poste ci-dessous.

Contraintes absolues:
- Réponds uniquement avec un JSON valide conforme à la structure demandée.
- 60 à 70 questions.
- 6 blocs exactement.
- Minimum 70% QCM.
- Les QCM ont 4 à 5 choix.
- Inclure QCM, FORCED_CHOICE, OPEN, ROLE_PLAY, LIKERT_CONTEXTUAL.
- Inclure des questions miroir / incohérence avec mirror_question_reference.
- Les textes candidats sont immersifs, contextualisés, en français, et doivent ressembler à de vraies situations de travail observables dans ce poste et cette entreprise.
- Chaque question doit contenir un contexte concret: interlocuteurs, contrainte, enjeu, tension métier, information incomplète ou arbitrage.
- Les choix QCM doivent être variés d'une question à l'autre. Interdiction de réutiliser le même pattern de réponses génériques.
- Les choix doivent représenter des réactions humaines naturelles et différentes: clarification, négociation, évitement, escalade, prise d'initiative, concession, cadrage, écoute, pression, documentation, arbitrage.
- Pour les postes commerciaux, inclure des scènes de prospection, qualification, objection, négociation, forecast, CRM, closing, client insatisfait, concurrence et comité d'achat.
- Pour chaque QCM, les 4 à 5 choix doivent être plausibles mais différenciés, avec des formulations professionnelles non répétitives.
- Ne jamais nommer explicitement la soft skill évaluée dans question_text.
- Ne jamais révéler scoring_rules, score_value ou logique psychométrique dans le texte candidat.
- Les hidden_target_competencies, hidden_indicators et scoring_rules restent dans le JSON serveur.

Structure obligatoire:
{
  "evaluation_uid": "...",
  "company_uid": "...",
  "job_uid": "...",
  "language": "fr",
  "version": "NeuroRecrut Ultra MVP v1",
  "blocks": [
    {
      "block_id": 1,
      "name": "Cognition & Logique",
      "weight": 15,
      "questions": [
        {
          "question_uid": "...",
          "type": "QCM | FORCED_CHOICE | OPEN | ROLE_PLAY | LIKERT_CONTEXTUAL",
          "question_text": "...",
          "choices": [
            {
              "choice_uid": "...",
              "label": "...",
              "score_value": 0,
              "hidden_indicators": []
            }
          ],
          "hidden_target_competencies": [],
          "scoring_rules": {},
          "mirror_question_reference": null,
          "weight": 1
        }
      ]
    }
  ]
}

Profil poste:
${JSON.stringify(jobProfile, null, 2)}

Profil cible:
${JSON.stringify(targetProfile, null, 2)}`;
}

export function buildCandidateAnalysisPrompt(
  jobProfile: unknown,
  targetProfile: unknown,
  evaluationJson: unknown,
  candidateProfile: unknown,
  answersJson: unknown
) {
  return `Tu es NeuroRecrut, analyste RH senior. Analyse les réponses d'un candidat en français.

Réponds uniquement avec un JSON valide. N'invente pas de données factuelles.
Inclure:
- qualitative_observations
- matching_evidence
- risk_evidence
- manager_fit_evidence
- team_fit_evidence
- recommended_interview_questions
- onboarding_focus

Profil poste:
${JSON.stringify(jobProfile, null, 2)}

Profil cible:
${JSON.stringify(targetProfile, null, 2)}

Evaluation:
${JSON.stringify(evaluationJson, null, 2)}

Profil candidat:
${JSON.stringify(candidateProfile, null, 2)}

Réponses candidat:
${JSON.stringify(answersJson, null, 2)}`;
}

export function buildReportGenerationPrompt(analysisJson: unknown) {
  return `Tu es NeuroRecrut, rédacteur de rapports RH exécutifs. Génère un rapport en français.

Réponds uniquement avec un JSON valide contenant exactement ces sections:
1. contexte_objectif
2. synthese_chiffree
3. score_global
4. indice_sincerite
5. indice_coherence
6. analyse_detaillee_par_bloc
7. matching_poste
8. matching_manager
9. matching_equipe
10. soft_skills_forces_risques
11. hard_skills_analysis
12. points_de_vigilance
13. recommandations_rh
14. plan_integration_30_60_90
15. avis_final

Le ton doit être professionnel, clair, exploitable par RH.

Données d'analyse:
${JSON.stringify(analysisJson, null, 2)}`;
}
