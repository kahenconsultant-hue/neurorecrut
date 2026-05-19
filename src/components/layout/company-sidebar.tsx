import Link from "next/link";
import { BriefcaseBusiness, Building2, CreditCard, FileText, LayoutDashboard } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { BrandLogo } from "@/components/layout/brand-logo";

const links = [
  { href: "/company/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/company/profile", label: "Profil entreprise", icon: Building2 },
  { href: "/company/jobs", label: "Postes", icon: BriefcaseBusiness },
  { href: "/company/reports", label: "Rapports", icon: FileText },
  { href: "/company/billing", label: "Crédits & facturation", icon: CreditCard }
];

export function CompanySidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-line bg-white p-5 lg:flex lg:flex-col">
      <BrandLogo href="/company/dashboard" compact />
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
