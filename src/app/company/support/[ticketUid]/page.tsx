import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { replyToCompanySupportTicket } from "@/actions/support-actions";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/security";
import { supportCategoryLabel } from "@/lib/support";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function CompanySupportTicketPage({
  params,
  searchParams
}: {
  params: { ticketUid: string };
  searchParams?: { created?: string; sent?: string; error?: string };
}) {
  const { company } = await requireCompanyUser();
  if (!company) redirect("/admin/tickets");

  const ticket = await prisma.supportTicket.findFirst({
    where: { uid: params.ticketUid, companyId: company.id },
    include: {
      company: true,
      job: true,
      messages: { include: { author: true }, orderBy: { createdAt: "asc" } }
    }
  });
  if (!ticket) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/company/support" className="text-sm font-semibold text-coral">← Tous les tickets</Link>
          <h1 className="mt-2 text-3xl font-bold text-ink">{ticket.subject}</h1>
          <p className="mt-2 font-mono text-xs text-gray-500">{ticket.code ?? ticket.uid}</p>
        </div>
        <div className="flex flex-wrap gap-2"><Badge value={ticket.status} /><Badge value={ticket.priority} /></div>
      </div>

      {searchParams?.created ? (
        <p className="rounded-md border border-teal/20 bg-teal/10 px-4 py-3 text-sm font-medium text-teal" role="status">
          Ticket envoyé. Une confirmation email a été transmise.
        </p>
      ) : null}
      {searchParams?.sent ? (
        <p className="rounded-md border border-teal/20 bg-teal/10 px-4 py-3 text-sm font-medium text-teal" role="status">
          Réponse ajoutée et confirmée par email.
        </p>
      ) : null}
      {searchParams?.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          Ajoutez une réponse avant l&apos;envoi.
        </p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm text-gray-500">Catégorie</p>
          <p className="mt-2 font-semibold text-ink">{supportCategoryLabel(ticket.category)}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-gray-500">Poste associé</p>
          <p className="mt-2 font-semibold text-ink">{ticket.job?.title ?? "Aucun"}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-gray-500">Dernière activité</p>
          <p className="mt-2 font-semibold text-ink">{formatDateTime(ticket.lastActivityAt)}</p>
        </div>
      </section>

      <section className="panel p-5 md:p-6">
        <h2 className="font-semibold text-ink">Conversation support</h2>
        <div className="mt-5 space-y-4">
          {ticket.messages.map((message) => (
            <article
              key={message.id}
              className={`rounded-lg border p-4 ${message.authorRole === "ADMIN" ? "border-teal/20 bg-teal/10" : "border-line bg-mist"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <p className="font-semibold text-ink">
                  {message.authorRole === "ADMIN" ? "Support NeuroRecrut" : message.author?.name ?? ticket.contactName ?? "Entreprise"}
                </p>
                <time className="text-gray-500">{formatDateTime(message.createdAt)}</time>
              </div>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-700">{message.body}</p>
            </article>
          ))}
        </div>
      </section>

      <form action={replyToCompanySupportTicket.bind(null, ticket.uid)} className="panel space-y-4 p-5 md:p-6">
        <div>
          <h2 className="font-semibold text-ink">Ajouter une réponse</h2>
          <p className="mt-1 text-sm text-gray-600">Votre message relance le ticket et avertit le support par email.</p>
        </div>
        <textarea className="field min-h-32" name="message" required placeholder="Ajoutez une précision, une capture décrite ou le résultat d'un nouveau test." />
        <button className="btn-primary" type="submit">Envoyer la réponse</button>
      </form>
    </div>
  );
}
