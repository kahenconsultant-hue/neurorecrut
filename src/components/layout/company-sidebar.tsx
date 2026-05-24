"use client";

import { BriefcaseBusiness, Building2, CreditCard, FileText, Headset, LayoutDashboard, Send } from "lucide-react";
import { ResponsiveSidebar } from "@/components/layout/responsive-sidebar";

const links = [
  { href: "/company/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/company/profile", label: "Profil entreprise", icon: Building2 },
  { href: "/company/jobs", label: "Postes", icon: BriefcaseBusiness },
  { href: "/company/invitations", label: "Invitation des candidats", icon: Send },
  { href: "/company/reports", label: "Rapports", icon: FileText },
  { href: "/company/support", label: "Support & tickets", icon: Headset },
  { href: "/company/billing", label: "Crédits & facturation", icon: CreditCard }
];

export function CompanySidebar() {
  return <ResponsiveSidebar homeHref="/company/dashboard" links={links} />;
}
