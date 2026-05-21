import Link from "next/link";
import { notFound } from "next/navigation";
import { replyToAdminSupportTicket, updateAdminSupportTicket } from "@/actions/support-actions";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/security";
import {
  SUPPORT_PRIORITY_OPTIONS,
  SUPPORT_STATUS_OPTIONS,
  supportCategoryLabel
} from "@/lib/support";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function AdminTicketPage({
  params,
  searchParams
}: {
  params: { ticketUid: string };
  searchParams?: { sent?: string; updated?: string; error?: string };
}) {
  await requireAdmin();
  const ticket = await prisma.supportTicket.findUnique({
    where: { uid: params.ticketUid },
    include: {
      company: true,
      job: true,
      createdBy: true,
      assignedTo: true,
      messages: { include: { author: true }, orderBy: { createdAt: "asc" } }
    }
  });
  if (!ticket) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/tickets" className="text-sm font-semibold text-coral">← Tickets support</Link>
          <h1 className="mt-2 text-3xl font-bold text-ink">{ticket.subject}</h1>
          <p className="mt-1 font-mono text-xs text-gray-500">{ticket.code ?? ticket.uid}</p>
        </div>
        <div className="flex flex-wrap gap-2"><Badge value={ticket.status} /><Badge value={ticket.priority} /></div>
      </div>

      {searchParams?.sent ? (
        <p className="rounded-md border border-teal/20 bg-teal/10 px-4 py-3 text-sm font-medium text-teal" role="status">
          Réponse envoyée. Les contacts de l&apos;entreprise ont reçu l&apos;email de suivi.
        </p>
      ) : null}
      {searchParams?.updated ? (
        <p className="rounded-md border border-teal/20 bg-teal/10 px-4 py-3 text-sm font-medium text-teal" role="status">
          Statut du ticket mis à jour.
        </p>
      ) : null}
      {searchParams?.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          Vérifiez le message, le statut ou la priorité avant de valider.
        </p>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1fr_0.82fr]">
        <div className="panel p-5">
          <h2 className="font-semibold text-ink">Contexte entreprise</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-gray-500">Entreprise</dt><dd className="font-semibold text-ink"><Link href={`/admin/companies/${ticket.company.uid}`} className="hover:text-coral">{ticket.company.name ?? ticket.company.uid}</Link></dd></div>
            <div><dt className="text-gray-500">Contact</dt><dd className="font-semibold text-ink">{ticket.contactName ?? ticket.contactEmail}</dd><dd className="text-gray-600">{ticket.contactEmail}</dd></div>
            <div><dt className="text-gray-500">Catégorie</dt><dd className="font-semibold text-ink">{supportCategoryLabel(ticket.category)}</dd></div>
            <div><dt className="text-gray-500">Poste</dt><dd className="font-semibold text-ink">{ticket.job ? <Link href={`/admin/jobs/${ticket.job.uid}`} className="hover:text-coral">{ticket.job.title}</Link> : "-"}</dd></div>
            <div><dt className="text-gray-500">Impact</dt><dd className="whitespace-pre-wrap text-ink">{ticket.impact ?? "-"}</dd></div>
            <div><dt className="text-gray-500">Lien</dt><dd className="break-all text-ink">{ticket.relatedUrl ?? "-"}</dd></div>
          </dl>
        </div>

        <form action={updateAdminSupportTicket.bind(null, ticket.uid)} className="panel space-y-4 p-5">
          <div>
            <h2 className="font-semibold text-ink">Pilotage du ticket</h2>
            <p className="mt-1 text-sm text-gray-600">Classez la demande après lecture et clôturez-la lorsque le suivi est terminé.</p>
          </div>
          <label>
            <span className="label">Statut</span>
            <select className="field" name="status" defaultValue={ticket.status}>
              {SUPPORT_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Priorité</span>
            <select className="field" name="priority" defaultValue={ticket.priority}>
              {SUPPORT_PRIORITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <button className="btn-secondary" type="submit">Mettre à jour</button>
        </form>
      </section>

      <section className="panel p-5 md:p-6">
        <h2 className="font-semibold text-ink">Conversation</h2>
        <div className="mt-5 space-y-4">
          {ticket.messages.map((message) => (
            <article
              key={message.id}
              className={`rounded-lg border p-4 ${message.authorRole === "ADMIN" ? "border-teal/20 bg-teal/10" : "border-line bg-mist"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-ink">
                  {message.authorRole === "ADMIN" ? message.author?.name ?? "Admin NeuroRecrut" : message.author?.name ?? ticket.contactName ?? ticket.contactEmail}
                </p>
                <time className="text-sm text-gray-500">{formatDateTime(message.createdAt)}</time>
              </div>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-700">{message.body}</p>
            </article>
          ))}
        </div>
      </section>

      <form action={replyToAdminSupportTicket.bind(null, ticket.uid)} className="panel space-y-4 p-5 md:p-6">
        <div>
          <h2 className="font-semibold text-ink">Répondre à l&apos;entreprise</h2>
          <p className="mt-1 text-sm text-gray-600">L&apos;envoi place le ticket en attente de réponse entreprise et notifie ses contacts par email.</p>
        </div>
        <textarea className="field min-h-36" name="message" required placeholder="Réponse support, action effectuée ou information complémentaire demandée." />
        <button className="btn-primary" type="submit">Envoyer la réponse</button>
      </form>
    </div>
  );
}
