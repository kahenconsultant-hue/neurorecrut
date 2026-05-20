import type { LegalDoc } from "@/lib/legal-docs";

export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <article className="space-y-7">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-coral">NeuroRecrut</p>
        <h1 className="mt-2 text-3xl font-bold text-ink md:text-4xl">{doc.title}</h1>
        {doc.updatedAt ? <p className="mt-2 text-sm text-gray-500">Dernière mise à jour : {doc.updatedAt}</p> : null}
      </header>

      <div className="space-y-6">
        {doc.sections.map((section, index) => (
          <section key={`${section.heading ?? "section"}-${index}`} className="space-y-3">
            {section.heading ? <h2 className="text-lg font-semibold text-ink">{section.heading}</h2> : null}
            <div className="space-y-3 text-sm leading-7 text-gray-700 md:text-base">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
