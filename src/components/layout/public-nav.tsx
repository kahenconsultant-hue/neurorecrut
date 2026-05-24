"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/pricing", label: "Tarifs" },
    { href: "/contact", label: "Contact" },
    { href: "/login", label: "Connexion" },
    { href: "/candidate/register", label: "Espace candidat" }
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4">
        <BrandLogo compact priority />
        <nav className="hidden min-w-0 items-center gap-2 text-sm md:flex" aria-label="Navigation publique">
          {links.map((link) => (
            <Link key={link.href} className="rounded-md px-3 py-2 font-medium text-graphite hover:bg-mist" href={link.href}>
              {link.label}
            </Link>
          ))}
          <Link className="btn-primary whitespace-nowrap px-4" href="/register">
            Créer un compte recruteur
          </Link>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <Link className="rounded-md px-3 py-2 text-sm font-medium text-graphite hover:bg-mist" href="/login">
            Connexion
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-line bg-white text-graphite shadow-sm"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-line bg-white px-4 py-3 shadow-panel md:hidden">
          <nav className="mx-auto grid max-w-6xl gap-1 text-sm" aria-label="Navigation mobile publique">
            {links.map((link) => (
              <Link
                key={link.href}
                className="rounded-md px-3 py-3 font-medium text-graphite hover:bg-mist"
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link className="btn-primary mt-2 w-full" href="/register" onClick={() => setOpen(false)}>
              Créer un compte recruteur
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
