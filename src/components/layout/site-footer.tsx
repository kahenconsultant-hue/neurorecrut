import { LEGAL_DOCS } from "@/lib/legal-docs";
import { LegalModalLink } from "@/components/legal/legal-modal-link";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} NeuroRecrut. Tous droits réservés.</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Documents légaux">
          <Link className="hover:text-coral" href="/contact">Contact</Link>
          {LEGAL_DOCS.map((doc) => (
            <LegalModalLink key={doc.slug} slug={doc.slug} className="hover:text-coral">
              {doc.shortTitle}
            </LegalModalLink>
          ))}
        </nav>
      </div>
    </footer>
  );
}
