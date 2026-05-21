import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/security";
import { formatDate } from "@/lib/format";
import { getParam, matchesDateRange, matchesQuery, matchesSelect, uniqueOptions, type AdminSearchParams } from "@/lib/admin-filters";
import { supportCategoryLabel } from "@/lib/support";

export default async function AdminTicketsPage({ searchParams }: { searchParams?: AdminSearchParams }) {
  await requireAdmin();
  const tickets = await prisma.supportTicket.findMany({
    include: {
      company: true,
      job: true,
      createdBy: true,
      _count: { select: { messages: true } }
    },
    orderBy: { lastActivityAt: "desc" }
  });

  const filteredTickets = tickets.filter((ticket) => {
    return (
      matchesQuery(getParam(searchParams, "q"), [
        ticket.uid,
        ticket.code,
        ticket.subject,
        ticket.contactName,
        ticket.contactEmail,
        ticket.company.name,
        ticket.company.code,
        ticket.company.hrContactEmail,
        ticket.job?.title,
        ticket.job?.code,
        ticket.impact
      ]) &&
      matchesSelect(getParam(searchParams, "company"), ticket.company.name ?? ticket.company.uid) &&
      matchesSelect(getParam(searchParams, "status"), ticket.status) &&
      matchesSelect(getParam(searchParams, "category"), ticket.category) &&
      matchesSelect(getParam(searchParams, "priority"), ticket.priority) &&
      matchesDateRange(ticket.lastActivityAt, getParam(searchParams, "from"), getParam(searchParams, "to"))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-coral">Support plateforme</p>
        <h1 className="text-3xl font-bold text-ink">Tickets entreprises</h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600">Suivi des incidents et demandes RH, avec conversation, statut, priorité et références métier.</p>
      </div>

      <AdminFilterBar
        searchParams={searchParams}
        resetHref="/admin/tickets"
        totalCount={tickets.length}
        resultCount={filteredTickets.length}
        placeholder="Ticket, entreprise, email, poste, objet..."
        selects={[
          { name: "company", label: "Entreprise", options: uniqueOptions(tickets.map((ticket) => ticket.company.name ?? ticket.company.uid)) },
          { name: "status", label: "Statut", options: uniqueOptions(tickets.map((ticket) => ticket.status)) },
          { name: "category", label: "Catégorie", options: uniqueOptions(tickets.map((ticket) => ticket.category)) },
          { name: "priority", label: "Priorité", options: uniqueOptions(tickets.map((ticket) => ticket.priority)) }
        ]}
      />

      <section className="panel overflow-hidden">
        <table className="responsive-table">
          <thead className="bg-mist text-gray-500">
            <tr>
              <th className="px-5 py-3">Ticket</th>
              <th className="px-5 py-3">Entreprise</th>
              <th className="px-5 py-3">Catégorie</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Priorité</th>
              <th className="px-5 py-3">Messages</th>
              <th className="px-5 py-3">Activité</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="border-t border-line align-top">
                <td className="px-5 py-3" data-label="Ticket">
                  <Link href={`/admin/tickets/${ticket.uid}`} className="font-semibold text-ink hover:text-coral">{ticket.subject}</Link>
                  <p className="mt-1 font-mono text-xs text-gray-400">{ticket.code ?? ticket.uid}</p>
                  <p className="mt-1 text-xs text-gray-500">{ticket.contactEmail}</p>
                </td>
                <td className="px-5 py-3" data-label="Entreprise">
                  <Link href={`/admin/companies/${ticket.company.uid}`} className="font-semibold hover:text-coral">{ticket.company.name ?? ticket.company.uid}</Link>
                  {ticket.job ? <p className="mt-1 text-xs text-gray-500">{ticket.job.title}</p> : null}
                </td>
                <td className="px-5 py-3" data-label="Catégorie">{supportCategoryLabel(ticket.category)}</td>
                <td className="px-5 py-3" data-label="Statut"><Badge value={ticket.status} /></td>
                <td className="px-5 py-3" data-label="Priorité"><Badge value={ticket.priority} /></td>
                <td className="px-5 py-3" data-label="Messages">{ticket._count.messages}</td>
                <td className="px-5 py-3" data-label="Activité">{formatDate(ticket.lastActivityAt)}</td>
              </tr>
            ))}
            {filteredTickets.length === 0 ? (
              <tr><td className="px-5 py-6 text-sm text-gray-500" colSpan={7}>Aucun ticket ne correspond aux filtres.</td></tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
