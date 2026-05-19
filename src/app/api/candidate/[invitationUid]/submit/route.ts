import { NextResponse } from "next/server";
import { submitCandidateResponse } from "@/actions/workflow";

export async function POST(request: Request, { params }: { params: { invitationUid: string } }) {
  try {
    const payload = await request.json();
    const result = await submitCandidateResponse(params.invitationUid, payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur de soumission" },
      { status: 400 }
    );
  }
}
