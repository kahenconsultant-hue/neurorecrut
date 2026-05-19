import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertCompanyAccess } from "@/lib/security";

export async function GET(_: Request, { params }: { params: { reportUid: string } }) {
  const report = await prisma.analysisReport.findUnique({
    where: { uid: params.reportUid }
  });
  if (!report?.pdfBuffer) {
    return NextResponse.json({ error: "PDF introuvable" }, { status: 404 });
  }

  await assertCompanyAccess(report.companyId);

  return new NextResponse(report.pdfBuffer, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${report.pdfFileName ?? "rapport-neurorecrut.pdf"}"`
    }
  });
}
