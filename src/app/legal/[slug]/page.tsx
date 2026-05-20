import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicNav } from "@/components/layout/public-nav";
import { LegalDocument } from "@/components/legal/legal-document";
import { getLegalDoc, LEGAL_DOCS } from "@/lib/legal-docs";

export function generateStaticParams() {
  return LEGAL_DOCS.map((doc) => ({ slug: doc.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const doc = getLegalDoc(params.slug);
  return {
    title: doc ? `${doc.title} | NeuroRecrut` : "Document légal | NeuroRecrut"
  };
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const doc = getLegalDoc(params.slug);
  if (!doc) notFound();

  return (
    <>
      <PublicNav />
      <main className="bg-mist px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-lg border border-line bg-white p-6 shadow-panel md:p-8">
          <LegalDocument doc={doc} />
        </div>
      </main>
    </>
  );
}
