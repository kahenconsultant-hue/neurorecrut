"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { BrandLogo } from "@/components/layout/brand-logo";

type SidebarLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type ResponsiveSidebarProps = {
  homeHref: string;
  label?: string;
  links: SidebarLink[];
};

function navItemClass(active: boolean) {
  return [
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
    active ? "bg-mist text-ink" : "text-graphite hover:bg-mist"
  ].join(" ");
}

export function ResponsiveSidebar({ homeHref, label, links }: ResponsiveSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const nav = (
    <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
      {links.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={navItemClass(active)}>
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur lg:hidden">
        <BrandLogo href={homeHref} label={label} compact priority />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-line bg-white text-graphite shadow-sm"
          aria-label="Ouvrir le menu"
          aria-expanded={open}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 overflow-y-auto border-r border-line bg-white p-5 lg:flex lg:flex-col">
        <BrandLogo href={homeHref} label={label} compact />
        {nav}
        <LogoutButton />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-ink/35"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(20rem,calc(100vw-2rem))] flex-col overflow-y-auto border-r border-line bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <BrandLogo href={homeHref} label={label} compact />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white text-graphite"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
            <LogoutButton />
          </aside>
        </div>
      ) : null}
    </>
  );
}
