export type QuestionType = "QCM" | "FORCED_CHOICE" | "OPEN" | "ROLE_PLAY" | "LIKERT_CONTEXTUAL";

export type EvaluationChoice = {
  choice_uid: string;
  label: string;
  score_value: number;
  hidden_indicators: string[];
};

export type EvaluationQuestion = {
  question_uid: string;
  type: QuestionType;
  question_text: string;
  choices: EvaluationChoice[];
  hidden_target_competencies: string[];
  scoring_rules: Record<string, unknown>;
  mirror_question_reference: string | null;
  weight: number;
};

export type EvaluationBlock = {
  block_id: number;
  name: string;
  weight: number;
  questions: EvaluationQuestion[];
};

export type EvaluationJson = {
  evaluation_uid: string;
  company_uid: string;
  job_uid: string;
  language: "fr";
  version: "NeuroRecrut Ultra MVP v1";
  blocks: EvaluationBlock[];
};

export type CandidateAnswer = {
  question_uid: string;
  type: QuestionType;
  selected_choice_uid?: string;
  text_answer?: string;
  answered_at: string;
};

export type CandidateAnswersJson = {
  response_uid: string;
  answers: CandidateAnswer[];
};
