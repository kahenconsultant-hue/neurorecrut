"use client";

import { Activity, Building2, ClipboardList, CreditCard, FileText, ListChecks, Receipt, ScrollText, Sparkles, Users } from "lucide-react";
import { ResponsiveSidebar } from "@/components/layout/responsive-sidebar";

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
  return <ResponsiveSidebar homeHref="/admin/dashboard" label="Admin" links={links} />;
}
