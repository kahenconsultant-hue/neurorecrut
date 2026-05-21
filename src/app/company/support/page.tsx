import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import { createCompanySupportTicket } from "@/actions/support-actions";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { requireCompanyUser } from "@/lib/security";
import { formatDate } from "@/lib/format";
import { SUPPORT_CATEGORY_OPTIONS, SUPPORT_PRIORITY_OPTIONS, supportCategoryLabel } from "@/lib/support";

const errors: Record<string, string> = {
  validation: "Complétez l'objet, la catégorie et un message suffisamment précis.",
  job: "Le poste associé n'appartient pas à cette entreprise.",
  email: "Aucun email de contact n'est disponible pour ce compte."
};

export default async function CompanySupportPage({ searchParams }: { searchParams?: { error?: string } }) {
  const { company } = await requireCompanyUser();
  if (!company) redirect("/admin/tickets");

  const [tickets, jobs] = await Promise.all([
    prisma.supportTicket.findMany({
      where: { companyId: company.id },
      include: { job: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { lastActivityAt: "desc" }
    }),
    prisma.jobPosition.findMany({
      where: { companyId: company.id },
      select: { uid: true, title: true, code: true },
      orderBy: { createdAt: "desc" }
    })
  ]);
  const error = searchParams?.error ? errors[searchParams.error] ?? "Le ticket n'a pas pu être créé." : null;
  const openCount = tickets.filter((ticket) => ticket.status === "OPEN" || ticket.status === "IN_PROGRESS" || ticket.status === "WAITING_COMPANY").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-coral">Support entreprise</p>
          <h1 className="text-3xl font-bold text-ink">Tickets NeuroRecrut</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Ouvrez un ticket pour un problème de compte, crédit, évaluation, rapport ou invitation candidat. Chaque réponse est suivie dans ce fil et confirmée par email.
          </p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm text-gray-500">Tickets ouverts</p>
          <p className="mt-2 text-3xl font-bold text-ink">{openCount}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-gray-500">Tickets clôturés</p>
          <p className="mt-2 text-3xl font-bold text-ink">{tickets.filter((ticket) => ticket.status === "RESOLVED" || ticket.status === "CLOSED").length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-gray-500">Canal support</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-ink">Suivi panel + confirmation email</p>
        </div>
      </section>

      <section className="panel p-5 md:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-teal/10 text-teal">
            <MessageSquarePlus className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-ink">Nouveau ticket</h2>
            <p className="text-sm text-gray-600">Ajoutez les références utiles pour réduire les allers-retours.</p>
          </div>
        </div>
        {error ? <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p> : null}
        <form action={createCompanySupportTicket} className="mt-5 grid gap-4 lg:grid-cols-2">
          <label>
            <span className="label">Catégorie</span>
            <select className="field" name="category" required defaultValue="TECHNICAL">
              {SUPPORT_CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Priorité</span>
            <select className="field" name="priority" required defaultValue="NORMAL">
              {SUPPORT_PRIORITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label} - {option.hint}</option>)}
            </select>
          </label>
          <label className="lg:col-span-2">
            <span className="label">Objet</span>
            <input className="field" name="subject" required maxLength={180} placeholder="Exemple: un candidat ne retrouve pas son invitation" />
          </label>
          <label>
            <span className="label">Poste concerné</span>
            <select className="field" name="jobUid" defaultValue="">
              <option value="">Aucun poste spécifique</option>
              {jobs.map((job) => <option key={job.uid} value={job.uid}>{job.title}{job.code ? ` · ${job.code}` : ""}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Lien concerné</span>
            <input className="field" name="relatedUrl" type="url" placeholder="https://app.neurorecrut.com/..." />
          </label>
          <label className="lg:col-span-2">
            <span className="label">Impact ou échéance</span>
            <input className="field" name="impact" placeholder="Exemple: entretien prévu demain, paiement bloqué, PDF urgent..." />
          </label>
          <label className="lg:col-span-2">
            <span className="label">Message</span>
            <textarea
              className="field min-h-36"
              name="message"
              required
              minLength={20}
              placeholder="Décrivez les étapes, le résultat attendu et ce que vous voyez. Évitez les données candidat sensibles non nécessaires."
            />
          </label>
          <div className="lg:col-span-2">
            <button className="btn-primary" type="submit">Envoyer le ticket</button>
          </div>
        </form>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-semibold text-ink">Historique des tickets</h2>
        </div>
        <table className="responsive-table">
          <thead className="bg-mist text-gray-500">
            <tr>
              <th className="px-5 py-3">Ticket</th>
              <th className="px-5 py-3">Catégorie</th>
              <th className="px-5 py-3">Poste</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Priorité</th>
              <th className="px-5 py-3">Activité</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-t border-line align-top">
                <td className="px-5 py-3" data-label="Ticket">
                  <Link href={`/company/support/${ticket.uid}`} className="font-semibold text-ink hover:text-coral">{ticket.subject}</Link>
                  <p className="font-mono text-xs text-gray-400">{ticket.code ?? ticket.uid}</p>
                </td>
                <td className="px-5 py-3" data-label="Catégorie">{supportCategoryLabel(ticket.category)}</td>
                <td className="px-5 py-3" data-label="Poste">{ticket.job?.title ?? "-"}</td>
                <td className="px-5 py-3" data-label="Statut"><Badge value={ticket.status} /></td>
                <td className="px-5 py-3" data-label="Priorité"><Badge value={ticket.priority} /></td>
                <td className="px-5 py-3" data-label="Activité">{formatDate(ticket.lastActivityAt)}</td>
              </tr>
            ))}
            {tickets.length === 0 ? (
              <tr><td className="px-5 py-6 text-sm text-gray-500" colSpan={6}>Aucun ticket pour le moment.</td></tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
