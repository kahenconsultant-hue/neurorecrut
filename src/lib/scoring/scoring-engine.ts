import { BLOCK_WEIGHTS, SOFT_SKILLS } from "@/lib/constants";
import { clamp } from "@/lib/format";
import type { CandidateAnswer, EvaluationJson, EvaluationQuestion } from "@/types/evaluation";

type ScoringResult = {
  global_score: number;
  job_matching_score: number;
  sincerity_index: number;
  coherence_index: number;
  block_scores: Record<string, number>;
  soft_skill_scores: Record<string, number>;
  hard_skill_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  recommendation: string;
  final_opinion: "Recommandé" | "Recommandé avec accompagnement" | "Réserve" | "Non recommandé";
};

function getMaxScore(question: EvaluationQuestion) {
  if (question.type === "ROLE_PLAY") return 5;
  if (question.type === "OPEN") return 3;
  if (question.type === "LIKERT_CONTEXTUAL") return 3;
  if (question.type === "FORCED_CHOICE") return 1;
  return 1;
}

function scoreAnswer(question: EvaluationQuestion, answer?: CandidateAnswer) {
  if (!answer) return 0;

  if (question.type === "OPEN" || question.type === "ROLE_PLAY") {
    const length = answer.text_answer?.trim().length ?? 0;
    if (length === 0) return 0;
    const max = getMaxScore(question);
    if (length > 280) return max;
    if (length > 140) return max * 0.78;
    if (length > 60) return max * 0.52;
    return max * 0.25;
  }

  const selected = question.choices.find((choice) => choice.choice_uid === answer.selected_choice_uid);
  if (!selected) return 0;
  const choiceMax = Math.max(...question.choices.map((choice) => Number(choice.score_value ?? 0)), 1);
  return (Number(selected.score_value ?? 0) / choiceMax) * getMaxScore(question);
}

function getChoiceIndicators(question: EvaluationQuestion, answer?: CandidateAnswer) {
  const selected = question.choices.find((choice) => choice.choice_uid === answer?.selected_choice_uid);
  return selected?.hidden_indicators ?? [];
}

function recommendation(score: number) {
  if (score >= 85) return "Excellent matching";
  if (score >= 70) return "Matching solide";
  if (score >= 55) return "Matching partiel ou risqué";
  return "Incompatible ou risque élevé";
}

function finalOpinion(score: number, risk: "LOW" | "MEDIUM" | "HIGH"): ScoringResult["final_opinion"] {
  if (score >= 82 && risk === "LOW") return "Recommandé";
  if (score >= 68 && risk !== "HIGH") return "Recommandé avec accompagnement";
  if (score >= 55) return "Réserve";
  return "Non recommandé";
}

export function calculateScores(evaluation: EvaluationJson, answers: CandidateAnswer[]): ScoringResult {
  const answerByQuestion = new Map(answers.map((answer) => [answer.question_uid, answer]));
  const blockScores: Record<string, number> = {};
  const skillBuckets = new Map<string, number[]>();
  let weightedTotal = 0;
  let weightTotal = 0;
  let coherencePairs = 0;
  let coherentPairs = 0;
  let sincerity = 0;

  for (const block of evaluation.blocks) {
    let blockScore = 0;
    let blockMax = 0;

    for (const question of block.questions) {
      const answer = answerByQuestion.get(question.question_uid);
      const rawScore = scoreAnswer(question, answer) * question.weight;
      const rawMax = getMaxScore(question) * question.weight;
      blockScore += rawScore;
      blockMax += rawMax;

      for (const skill of question.hidden_target_competencies) {
        const normalized = rawMax > 0 ? (rawScore / rawMax) * 100 : 0;
        const bucket = skillBuckets.get(skill) ?? [];
        bucket.push(normalized);
        skillBuckets.set(skill, bucket);
      }

      if (question.mirror_question_reference) {
        const mirrorQuestion = evaluation.blocks
          .flatMap((item) => item.questions)
          .find((item) => item.question_uid === question.mirror_question_reference);
        if (mirrorQuestion) {
          coherencePairs += 1;
          const currentIndicators = getChoiceIndicators(question, answer);
          const mirrorIndicators = getChoiceIndicators(mirrorQuestion, answerByQuestion.get(mirrorQuestion.question_uid));
          const hasOverlap = currentIndicators.some((indicator) => mirrorIndicators.includes(indicator));
          if (hasOverlap) {
            coherentPairs += 1;
            sincerity += 2;
          } else {
            sincerity -= 2;
          }
        }
      }
    }

    const normalizedBlockScore = blockMax > 0 ? (blockScore / blockMax) * 100 : 0;
    blockScores[block.name] = Math.round(normalizedBlockScore);
    weightedTotal += normalizedBlockScore * (BLOCK_WEIGHTS[block.name] ?? block.weight);
    weightTotal += BLOCK_WEIGHTS[block.name] ?? block.weight;
  }

  const softSkillScores = Object.fromEntries(
    SOFT_SKILLS.map((skill) => {
      const values = skillBuckets.get(skill) ?? [];
      const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
      return [skill, Math.round(average)];
    })
  );

  const globalScore = Math.round(weightTotal > 0 ? weightedTotal / weightTotal : 0);
  const hardSkillScore = blockScores["Hard skills dissimulés"] ?? 0;
  const coherenceIndex = coherencePairs ? Math.round((coherentPairs / coherencePairs) * 100) : 100;
  const sincerityIndex = clamp(sincerity, -10, 10);
  const jobMatchingScore = Math.round(globalScore * 0.72 + hardSkillScore * 0.18 + coherenceIndex * 0.1);
  const riskLevel =
    coherenceIndex < 55 || sincerityIndex <= -6 || jobMatchingScore < 55
      ? "HIGH"
      : coherenceIndex < 75 || sincerityIndex < 0 || jobMatchingScore < 70
        ? "MEDIUM"
        : "LOW";

  return {
    global_score: globalScore,
    job_matching_score: clamp(jobMatchingScore, 0, 100),
    sincerity_index: sincerityIndex,
    coherence_index: coherenceIndex,
    block_scores: blockScores,
    soft_skill_scores: softSkillScores,
    hard_skill_score: hardSkillScore,
    risk_level: riskLevel,
    recommendation: recommendation(jobMatchingScore),
    final_opinion: finalOpinion(jobMatchingScore, riskLevel)
  };
}
