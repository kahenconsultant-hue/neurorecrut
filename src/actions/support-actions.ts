"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { nextPublicCode } from "@/lib/public-codes";
import { requireAdmin, requireCompanyUser } from "@/lib/security";
import {
  sendSupportTicketAdminReplyEmail,
  sendSupportTicketConfirmationEmail,
  sendSupportTicketInboxEmail
} from "@/lib/email";
import { supportReplySchema, supportTicketAdminSchema, supportTicketSchema } from "@/lib/validators";

function field(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function uniqueEmails(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim().toLowerCase()).filter(Boolean))) as string[];
}

async function getCompanyContext() {
  const { session, company } = await requireCompanyUser();
  if (!company || !session.user.companyId) {
    redirect("/admin/tickets");
  }
  return { session, company };
}

async function getCompanyTicket(ticketUid: string) {
  const { session, company } = await getCompanyContext();
  const ticket = await prisma.supportTicket.findUnique({
    where: { uid: ticketUid },
    include: { company: true, job: true }
  });
  if (!ticket || ticket.companyId !== company.id) {
    throw new Error("Ticket introuvable");
  }
  return { session, company, ticket };
}

function ticketEmailInput(ticket: {
  uid: string;
  code: string | null;
  contactName: string | null;
  contactEmail: string;
  subject: string;
  category: string;
  priority: string;
  company: { name: string | null; hrContactEmail: string | null; ownerEmail: string | null };
}, message: string) {
  return {
    ticketUid: ticket.uid,
    ticketCode: ticket.code,
    companyName: ticket.company.name,
    contactName: ticket.contactName,
    contactEmail: ticket.contactEmail,
    subject: ticket.subject,
    category: ticket.category,
    priority: ticket.priority,
    message
  };
}

function revalidateTicketPaths(ticketUid?: string) {
  ["/company/support", "/admin/dashboard", "/admin/tickets"].forEach((path) => revalidatePath(path));
  if (ticketUid) {
    revalidatePath(`/company/support/${ticketUid}`);
    revalidatePath(`/admin/tickets/${ticketUid}`);
  }
}

export async function createCompanySupportTicket(formData: FormData) {
  const { session, company } = await getCompanyContext();
  const result = supportTicketSchema.safeParse({
    category: field(formData, "category"),
    priority: field(formData, "priority"),
    subject: field(formData, "subject"),
    message: field(formData, "message"),
    jobUid: field(formData, "jobUid"),
    impact: field(formData, "impact"),
    relatedUrl: field(formData, "relatedUrl")
  });

  if (!result.success) {
    redirect("/company/support?error=validation");
  }

  const parsed = result.data;
  const job = parsed.jobUid
    ? await prisma.jobPosition.findFirst({ where: { uid: parsed.jobUid, companyId: company.id } })
    : null;
  if (parsed.jobUid && !job) {
    redirect("/company/support?error=job");
  }

  const contactEmail = session.user.email ?? company.hrContactEmail ?? company.ownerEmail;
  if (!contactEmail) {
    redirect("/company/support?error=email");
  }

  const ticket = await prisma.$transaction(async (tx) => {
    const code = await nextPublicCode(tx, "ticket");
    return tx.supportTicket.create({
      data: {
        code,
        companyId: company.id,
        jobId: job?.id ?? null,
        createdByUserId: session.user.id,
        contactName: session.user.name ?? company.hrContactName,
        contactEmail,
        subject: parsed.subject,
        category: parsed.category,
        priority: parsed.priority,
        impact: parsed.impact || null,
        relatedUrl: parsed.relatedUrl || null,
        messages: {
          create: {
            authorRole: "COMPANY",
            authorUserId: session.user.id,
            body: parsed.message
          }
        }
      },
      include: { company: true }
    });
  });

  const emailInput = ticketEmailInput(ticket, parsed.message);
  await Promise.all([
    sendSupportTicketInboxEmail({ ...emailInput, to: [], event: "created" }),
    sendSupportTicketConfirmationEmail({
      ...emailInput,
      to: uniqueEmails([ticket.contactEmail, ticket.company.hrContactEmail, ticket.company.ownerEmail]),
      event: "created"
    })
  ]);

  revalidateTicketPaths(ticket.uid);
  redirect(`/company/support/${ticket.uid}?created=1`);
}

export async function replyToCompanySupportTicket(ticketUid: string, formData: FormData) {
  const { session, ticket } = await getCompanyTicket(ticketUid);
  const result = supportReplySchema.safeParse({ message: field(formData, "message") });
  if (!result.success) {
    redirect(`/company/support/${ticketUid}?error=reply`);
  }

  const message = result.data.message;
  const updated = await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: {
      status: "OPEN",
      resolvedAt: null,
      lastActivityAt: new Date(),
      messages: {
        create: {
          authorRole: "COMPANY",
          authorUserId: session.user.id,
          body: message
        }
      }
    },
    include: { company: true }
  });

  const emailInput = ticketEmailInput(updated, message);
  await Promise.all([
    sendSupportTicketInboxEmail({ ...emailInput, to: [], event: "company_reply" }),
    sendSupportTicketConfirmationEmail({
      ...emailInput,
      to: uniqueEmails([updated.contactEmail, updated.company.hrContactEmail, updated.company.ownerEmail]),
      event: "company_reply"
    })
  ]);

  revalidateTicketPaths(ticketUid);
  redirect(`/company/support/${ticketUid}?sent=1`);
}

export async function updateAdminSupportTicket(ticketUid: string, formData: FormData) {
  await requireAdmin();
  const result = supportTicketAdminSchema.safeParse({
    status: field(formData, "status"),
    priority: field(formData, "priority")
  });
  if (!result.success) {
    redirect(`/admin/tickets/${ticketUid}?error=update`);
  }

  await prisma.supportTicket.update({
    where: { uid: ticketUid },
    data: {
      ...result.data,
      resolvedAt: result.data.status === "RESOLVED" || result.data.status === "CLOSED" ? new Date() : null
    }
  });

  revalidateTicketPaths(ticketUid);
  redirect(`/admin/tickets/${ticketUid}?updated=1`);
}

export async function replyToAdminSupportTicket(ticketUid: string, formData: FormData) {
  const session = await requireAdmin();
  const result = supportReplySchema.safeParse({ message: field(formData, "message") });
  if (!result.success) {
    redirect(`/admin/tickets/${ticketUid}?error=reply`);
  }

  const message = result.data.message;
  const ticket = await prisma.supportTicket.update({
    where: { uid: ticketUid },
    data: {
      status: "WAITING_COMPANY",
      resolvedAt: null,
      lastActivityAt: new Date(),
      messages: {
        create: {
          authorRole: "ADMIN",
          authorUserId: session.user.id,
          body: message
        }
      }
    },
    include: { company: true }
  });

  const emailInput = ticketEmailInput(ticket, message);
  await sendSupportTicketAdminReplyEmail({
    ...emailInput,
    to: uniqueEmails([ticket.contactEmail, ticket.company.hrContactEmail, ticket.company.ownerEmail])
  });

  revalidateTicketPaths(ticketUid);
  redirect(`/admin/tickets/${ticketUid}?sent=1`);
}
