"use client";

import { useEffect, useId, useState } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { LegalDocument } from "@/components/legal/legal-document";
import { getLegalDoc, type LegalDocSlug } from "@/lib/legal-docs";

type LegalModalLinkProps = {
  slug: LegalDocSlug;
  children?: ReactNode;
  className?: string;
};

export function LegalModalLink({ slug, children, className }: LegalModalLinkProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const doc = getLegalDoc(slug);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!doc) return null;

  return (
    <>
      <a
        href={`/legal/${doc.slug}`}
        className={className}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
      >
        {children ?? doc.shortTitle}
      </a>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button className="absolute inset-0 cursor-default" type="button" aria-label="Fermer" onClick={() => setOpen(false)} />
          <div className="relative max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
              <h2 id={titleId} className="text-base font-semibold text-ink md:text-lg">
                {doc.title}
              </h2>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-graphite hover:bg-mist"
                type="button"
                aria-label="Fermer"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[calc(88vh-73px)] overflow-y-auto px-5 py-6 md:px-8">
              <LegalDocument doc={doc} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
