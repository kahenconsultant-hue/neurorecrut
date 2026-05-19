import Link from "next/link";
import { Activity, Building2, ClipboardList, CreditCard, FileText, ListChecks, Receipt, ScrollText, Sparkles, Users } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { BrandLogo } from "@/components/layout/brand-logo";

const links = [
  { href: "/admin/dashboard", label: "KPIs", icon: Activity },
  { href: "/admin/companies", label: "Entreprises", icon: Building2 },
  { href: "/admin/candidates", label: "Candidats", icon: Users },
  { href: "/admin/jobs", label: "Postes", icon: ListChecks },
  { href: "/admin/purchases", label: "Achats", icon: Receipt },
  { href: "/admin/pricing", label: "Offres & crédits", icon: CreditCard },
  { href: "/admin/evaluations", label: "Évaluations", icon: ScrollText },
  { href: "/admin/responses", label: "Réponses", icon: ClipboardList },
  { href: "/admin/reports", label: "Rapports", icon: FileText },
  { href: "/admin/ai-logs", label: "Logs IA", icon: Sparkles }
];

export function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-line bg-white p-5 lg:flex lg:flex-col">
      <BrandLogo href="/admin/dashboard" label="Admin" compact />
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-graphite hover:bg-mist">
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <LogoutButton />
    </aside>
  );
}
