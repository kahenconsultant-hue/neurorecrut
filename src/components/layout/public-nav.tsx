import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";

export function PublicNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <BrandLogo priority />
        <nav className="flex min-w-0 items-center gap-1 text-sm sm:gap-2" aria-label="Navigation publique">
          <Link className="hidden rounded-md px-3 py-2 font-medium text-graphite hover:bg-mist sm:inline-flex" href="/pricing">
            Tarifs
          </Link>
          <Link className="rounded-md px-3 py-2 font-medium text-graphite hover:bg-mist" href="/login">
            Connexion
          </Link>
          <Link className="hidden rounded-md px-3 py-2 font-medium text-graphite hover:bg-mist md:inline-flex" href="/candidate/register">
            Espace candidat
          </Link>
          <Link className="btn-primary whitespace-nowrap" href="/register">
            Créer un compte
          </Link>
        </nav>
      </div>
    </header>
  );
}
