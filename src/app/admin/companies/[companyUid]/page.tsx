import Link from "next/link";
import { adminAddCredits, getAdminCompanyDetail, toggleCompanyStatus, updateAdminCompany, updateAdminCreditBalance, updateAdminInvitation } from "@/actions/workflow";
import { AdminJsonBlock, AdminMetaGrid, AdminEmptyState } from "@/components/admin/admin-json";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatDate } from "@/lib/format";

const companyFields = [
  ["name", "Nom"],
  ["siretSiren", "SIRET / SIREN"],
  ["sector", "Secteur"],
  ["size", "Taille"],
  ["website", "Site web"],
  ["address", "Adresse"],
  ["hrContactName", "Contact RH"],
  ["hrContactEmail", "Email RH"],
  ["ownerEmail", "Email propriétaire"]
] as const;

const companyTextareas = [
  ["culture", "Culture"],
  ["values", "Valeurs"],
  ["managementStyle", "Management"],
  ["teamWorkingStyle", "Travail équipe"],
  ["workEnvironment", "Environnement"]
] as const;

export default async function AdminCompanyDetailPage({ params }: { params: { companyUid: string } }) {
  const company = await getAdminCompanyDetail(params.companyUid);
  const remainingCredits = company.creditBalances.reduce((sum, balance) => sum + balance.creditsPurchased - balance.creditsUsed, 0);
  const paidRevenue = company.purchases.filter((purchase) => purchase.status === "PAID").reduce((sum, purchase) => sum + purchase.amountCents, 0);
  const averageMatching =
    company.reports.length > 0
      ? Math.round(company.reports.reduce((sum, report) => sum + report.matchingScore, 0) / company.reports.length)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-gray-500">{company.code ?? company.uid}</p>
          <h1 className="text-3xl font-bold text-ink">{company.name ?? "Entreprise sans nom"}</h1>
          <p className="mt-2 text-sm text-gray-600">{company.hrContactEmail ?? company.ownerEmail ?? "Email non renseigné"}</p>
        </div>
        <form action={toggleCompanyStatus.bind(null, company.uid)}>
          <button className="btn-secondary" type="submit">Activer/désactiver</button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Postes" value={company.jobs.length} />
        <StatCard label="Candidats" value={company.candidates.length} />
        <StatCard label="Crédits restants" value={remainingCredits} />
        <StatCard label="CA payé" value={formatCurrency(paidRevenue)} />
        <StatCard label="Évaluations" value={company.evaluations.length} />
        <StatCard label="Réponses" value={company.responses.length} />
        <StatCard label="Rapports" value={company.reports.length} />
        <StatCard label="Matching moyen" value={`${averageMatching}/100`} />
      </div>

      <AdminMetaGrid
        items={[
          ["Statut", <Badge key="status" value={company.status} />],
          ["Code", company.code ?? company.uid],
          ["Créée", formatDate(company.createdAt)],
          ["Mise à jour", formatDate(company.updatedAt)],
          ["Utilisateurs", company.users.length]
        ]}
      />

      <form action={updateAdminCompany.bind(null, company.uid)} className="panel space-y-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-ink">Modifier le profil entreprise</h2>
          <select name="status" defaultValue={company.status} className="field w-auto">
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {companyFields.map(([name, label]) => (
            <label key={name}>
              <span className="label">{label}</span>
              <input className="field" name={name} defaultValue={String(company[name] ?? "")} />
            </label>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {companyTextareas.map(([name, label]) => (
            <label key={name}>
              <span className="label">{label}</span>
              <textarea className="field min-h-24" name={name} defaultValue={String(company[name] ?? "")} />
            </label>
          ))}
        </div>
        <button className="btn-primary" type="submit">Enregistrer l&apos;entreprise</button>
      </form>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="panel p-5">
          <h2 className="font-semibold text-ink">Ajouter des crédits</h2>
          <form action={adminAddCredits.bind(null, company.uid)} className="mt-4 grid gap-3 md:grid-cols-2">
            <label><span className="label">Crédits achetés</span><input className="field" name="creditsPurchased" type="number" defaultValue="1" min="0" /></label>
            <label><span className="label">Crédits déjà utilisés</span><input className="field" name="creditsUsed" type="number" defaultValue="0" min="0" /></label>
            <label>
              <span className="label">Poste lié</span>
              <select className="field" name="jobUid">
                <option value="">Crédits globaux</option>
                {company.jobs.map((job) => <option key={job.id} value={job.uid}>{job.title}</option>)}
              </select>
            </label>
            <label><span className="label">Limite mensuelle</span><input className="field" name="monthlyLimit" type="number" placeholder="Optionnel" /></label>
            <label className="flex items-center gap-2 text-sm text-graphite"><input type="checkbox" name="active" defaultChecked /> Solde actif</label>
            <button className="btn-primary md:justify-self-start" type="submit">Ajouter</button>
          </form>
        </div>

        <div className="panel overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-semibold text-ink">Soldes crédits</h2>
          </div>
          <div className="max-h-[360px] overflow-auto">
            {company.creditBalances.length === 0 ? <div className="p-5 text-sm text-gray-500">Aucun crédit.</div> : company.creditBalances.map((balance) => (
              <form key={balance.id} action={updateAdminCreditBalance.bind(null, balance.uid)} className="grid gap-2 border-b border-line p-4 md:grid-cols-5">
                <div className="md:col-span-2">
                  <p className="font-semibold text-ink">{balance.job?.title ?? "Global"}</p>
                  <p className="text-xs text-gray-500">{balance.plan?.name ?? "Crédit manuel"}</p>
                </div>
                <input className="field" name="creditsPurchased" type="number" defaultValue={balance.creditsPurchased} />
                <input className="field" name="creditsUsed" type="number" defaultValue={balance.creditsUsed} />
                <button className="btn-secondary" type="submit">OK</button>
                <label className="flex items-center gap-2 text-xs text-graphite"><input type="checkbox" name="active" defaultChecked={balance.active} /> Actif</label>
                <input type="hidden" name="monthlyLimit" defaultValue={balance.monthlyLimit ?? ""} />
              </form>
            ))}
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-line px-5 py-4"><h2 className="font-semibold text-ink">Postes</h2></div>
        <table className="responsive-table">
          <thead className="bg-mist text-gray-500"><tr><th className="px-5 py-3">Poste</th><th className="px-5 py-3">Code</th><th className="px-5 py-3">Statut</th><th className="px-5 py-3">Pipeline</th></tr></thead>
          <tbody>
            {company.jobs.map((job) => (
              <tr key={job.id} className="border-t border-line">
                <td className="px-5 py-3" data-label="Poste"><Link href={`/admin/jobs/${job.uid}`} className="font-semibold text-ink hover:text-coral">{job.title}</Link></td>
                <td className="px-5 py-3" data-label="Code"><code className="text-xs">{job.code ?? job.uid}</code></td>
                <td className="px-5 py-3" data-label="Statut"><Badge value={job.status} /></td>
                <td className="px-5 py-3 text-xs text-gray-600" data-label="Pipeline">{job.evaluations.length} eval · {job.invitations.length} invitations · {job.reports.length} rapports</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-line px-5 py-4"><h2 className="font-semibold text-ink">Invitations candidates</h2></div>
        {company.invitations.length === 0 ? <div className="p-5 text-sm text-gray-500">Aucune invitation.</div> : (
          <table className="responsive-table">
            <tbody>
              {company.invitations.slice(0, 20).map((invitation) => (
                <tr key={invitation.id} className="border-t border-line">
                  <td className="px-5 py-3" data-label="Email">{invitation.candidateEmail}</td>
                  <td className="px-5 py-3" data-label="Poste"><Link href={`/admin/jobs/${invitation.job.uid}`} className="hover:text-coral">{invitation.job.title}</Link></td>
                  <td className="px-5 py-3" data-label="Statut"><Badge value={invitation.status} /></td>
                  <td className="px-5 py-3" data-label="Admin">
                    <form action={updateAdminInvitation.bind(null, invitation.uid)} className="flex flex-wrap gap-2">
                      <input type="hidden" name="candidateEmail" value={invitation.candidateEmail} />
                      <select className="field w-auto" name="status" defaultValue={invitation.status}>
                        {["INVITED", "STARTED", "COMPLETED", "EXPIRED"].map((status) => <option key={status}>{status}</option>)}
                      </select>
                      <input className="field w-auto" name="expiresAt" type="date" defaultValue={invitation.expiresAt.toISOString().slice(0, 10)} />
                      <button className="btn-secondary" type="submit">OK</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="panel overflow-hidden">
          <div className="border-b border-line px-5 py-4"><h2 className="font-semibold text-ink">Candidats</h2></div>
          {company.candidates.length === 0 ? <div className="p-5 text-sm text-gray-500">Aucun candidat.</div> : company.candidates.slice(0, 12).map((candidate) => (
            <Link key={candidate.id} href={`/admin/candidates/${candidate.uid}`} className="block border-b border-line px-5 py-3 hover:bg-mist">
              <span className="font-semibold text-ink">{candidate.firstName} {candidate.lastName}</span>
              <span className="ml-2 text-sm text-gray-500">{candidate.email}</span>
            </Link>
          ))}
        </div>
        <div className="panel overflow-hidden">
          <div className="border-b border-line px-5 py-4"><h2 className="font-semibold text-ink">Rapports</h2></div>
          {company.reports.length === 0 ? <div className="p-5 text-sm text-gray-500">Aucun rapport.</div> : company.reports.slice(0, 12).map((report) => (
            <Link key={report.id} href={`/admin/reports/${report.uid}`} className="block border-b border-line px-5 py-3 hover:bg-mist">
              <span className="font-semibold text-ink">{report.candidate.email}</span>
              <span className="ml-2 text-sm text-gray-500">{report.job.title} · {Math.round(report.matchingScore)}/100</span>
            </Link>
          ))}
        </div>
      </section>

      {company.aiLogs.length > 0 ? <AdminJsonBlock title="Derniers logs IA liés à cette entreprise" data={company.aiLogs} /> : <AdminEmptyState label="Aucun log IA pour cette entreprise." />}
    </div>
  );
}
