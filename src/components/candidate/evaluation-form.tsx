"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CandidateAnswer, QuestionType } from "@/types/evaluation";

type PublicChoice = {
  choice_uid: string;
  label: string;
};

type PublicQuestion = {
  question_uid: string;
  type: QuestionType;
  question_text: string;
  choices: PublicChoice[];
};

type PublicBlock = {
  block_id: number;
  name: string;
  questions: PublicQuestion[];
};

export function CandidateEvaluationForm({
  invitationUid,
  blocks,
  initialAnswers,
  context
}: {
  invitationUid: string;
  blocks: PublicBlock[];
  initialAnswers: CandidateAnswer[];
  context: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    mainMissions: string;
    contractType: string;
    location: string;
    workMode: string;
    seniorityLevel: string;
  };
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, CandidateAnswer>>(
    Object.fromEntries(initialAnswers.map((answer) => [answer.question_uid, answer]))
  );
  const [saveState, setSaveState] = useState("Brouillon sauvegardé");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const questions = useMemo(() => blocks.flatMap((block) => block.questions), [blocks]);
  const answeredCount = questions.filter((question) => {
    const answer = answers[question.question_uid];
    return Boolean(answer?.selected_choice_uid || answer?.text_answer?.trim());
  }).length;
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  function updateAnswer(question: PublicQuestion, value: string, mode: "choice" | "text") {
    setAnswers((current) => ({
      ...current,
      [question.question_uid]: {
        question_uid: question.question_uid,
        type: question.type,
        selected_choice_uid: mode === "choice" ? value : current[question.question_uid]?.selected_choice_uid,
        text_answer: mode === "text" ? value : current[question.question_uid]?.text_answer,
        answered_at: new Date().toISOString()
      }
    }));
  }

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setSaveState("Sauvegarde...");
      try {
        const response = await fetch(`/api/candidate/${invitationUid}/draft`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ answers: Object.values(answers) })
        });
        if (!response.ok) throw new Error("Autosave impossible");
        setSaveState("Brouillon sauvegardé");
      } catch {
        setSaveState("Sauvegarde indisponible");
      }
    }, 900);

    return () => clearTimeout(timeout);
  }, [answers, invitationUid]);

  function submit() {
    setError(null);
    if (answeredCount < questions.length && !window.confirm("Certaines questions sont sans réponse. Soumettre quand même ?")) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/candidate/${invitationUid}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: Object.values(answers) })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Soumission impossible");
        return;
      }
      router.push("/candidate/thank-you");
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <section className="panel overflow-hidden">
        <div className="border-b border-line bg-white px-5 py-5">
          <Image src="/neurorecrut-logo.png" alt="NeuroRecrut" width={210} height={74} className="mb-5 h-auto w-44" priority />
          <p className="text-sm font-semibold uppercase tracking-wide text-coral">Évaluation contextualisée</p>
          <h1 className="mt-2 text-2xl font-bold text-ink">{context.jobTitle}</h1>
          <p className="mt-1 text-sm text-gray-600">{context.companyName}</p>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Contrat</p>
            <p className="mt-1 text-sm font-medium text-ink">{context.contractType}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Localisation</p>
            <p className="mt-1 text-sm font-medium text-ink">{context.location}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Mode</p>
            <p className="mt-1 text-sm font-medium text-ink">{context.workMode}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Niveau</p>
            <p className="mt-1 text-sm font-medium text-ink">{context.seniorityLevel}</p>
          </div>
        </div>
        <div className="space-y-3 border-t border-line p-5 text-sm leading-6 text-gray-700">
          <p>{context.jobDescription}</p>
          <p><span className="font-semibold text-graphite">Missions clés: </span>{context.mainMissions}</p>
        </div>
      </section>

      <div className="sticky top-0 z-10 border-b border-line bg-mist py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-ink">Évaluation NeuroRecrut</h2>
            <p className="text-sm text-gray-600">{saveState}</p>
          </div>
          <p className="text-sm font-semibold text-graphite">{progress}% complété</p>
        </div>
        <div className="mt-3 h-2 rounded-full bg-white">
          <div className="h-2 rounded-full bg-teal transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {blocks.map((block) => (
        <section key={block.block_id} className="panel p-5">
          <h2 className="text-lg font-semibold text-ink">{block.name}</h2>
          <div className="mt-5 space-y-6">
            {block.questions.map((question, index) => (
              <div key={question.question_uid} className="rounded-md border border-line p-4">
                <p className="text-sm font-semibold text-graphite">Question {index + 1}</p>
                <p className="mt-2 leading-7 text-ink">{question.question_text}</p>
                {question.choices.length > 0 ? (
                  <div className="mt-4 grid gap-2">
                    {question.choices.map((choice) => (
                      <label key={choice.choice_uid} className="flex cursor-pointer gap-3 rounded-md border border-line bg-white p-3 text-sm hover:bg-mist">
                        <input
                          type="radio"
                          name={question.question_uid}
                          checked={answers[question.question_uid]?.selected_choice_uid === choice.choice_uid}
                          onChange={() => updateAnswer(question, choice.choice_uid, "choice")}
                        />
                        <span>{choice.label}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    className="field mt-4 min-h-32"
                    value={answers[question.question_uid]?.text_answer ?? ""}
                    onChange={(event) => updateAnswer(question, event.target.value, "text")}
                    placeholder="Votre réponse..."
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <div className="flex justify-end">
        <button className="btn-primary" type="button" onClick={submit} disabled={isPending}>
          {isPending ? "Analyse en cours..." : "Soumettre définitivement"}
        </button>
      </div>
    </div>
  );
}
