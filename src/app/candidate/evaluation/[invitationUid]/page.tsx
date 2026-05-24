import { redirect } from "next/navigation";
import { validateInvitation } from "@/actions/workflow";
import { CandidateEvaluationForm } from "@/components/candidate/evaluation-form";
import { prisma } from "@/lib/prisma";
import type { EvaluationJson } from "@/types/evaluation";

const EVALUATION_TIME_LIMIT_MINUTES = 75;

export default async function CandidateEvaluationPage({ params }: { params: { invitationUid: string } }) {
  const invitation = await validateInvitation(params.invitationUid);
  if (!invitation.candidateId) redirect(`/candidate/profile/${params.invitationUid}`);

  const startedAt =
    invitation.startedAt ??
    (
      await prisma.evaluationInvitation.update({
        where: { id: invitation.id },
        data: { status: "STARTED", startedAt: new Date() },
        select: { startedAt: true }
      })
    ).startedAt ??
    new Date();
  const deadlineAt = new Date(startedAt.getTime() + EVALUATION_TIME_LIMIT_MINUTES * 60_000);

  const evaluation = invitation.evaluation.json as EvaluationJson;
  const initialAnswers = ((invitation.response?.draftJson as { answers?: [] } | null)?.answers ?? []) as [];
  const publicBlocks = evaluation.blocks.map((block) => ({
    block_id: block.block_id,
    name: block.name,
    questions: block.questions.map((question) => ({
      question_uid: question.question_uid,
      type: question.type,
      question_text: question.question_text,
      choices: question.choices.map((choice) => ({
        choice_uid: choice.choice_uid,
        label: choice.label
      }))
    }))
  }));

  return (
    <main className="min-h-screen bg-mist">
      <CandidateEvaluationForm
        invitationUid={params.invitationUid}
        blocks={publicBlocks}
        initialAnswers={initialAnswers}
        deadlineAt={deadlineAt.toISOString()}
        timeLimitMinutes={EVALUATION_TIME_LIMIT_MINUTES}
        context={{
          companyName: invitation.company.name ?? "Entreprise",
          jobTitle: invitation.job.title,
          jobDescription: invitation.job.description,
          mainMissions: invitation.job.mainMissions,
          contractType: invitation.job.contractType,
          location: invitation.job.location,
          workMode: invitation.job.workMode,
          seniorityLevel: invitation.job.seniorityLevel
        }}
      />
    </main>
  );
}
