import type { ReactNode } from "react";

type AdminJsonBlockProps = {
  title: string;
  data: unknown;
  defaultOpen?: boolean;
};

export function AdminJsonBlock({ title, data, defaultOpen = false }: AdminJsonBlockProps) {
  return (
    <details className="panel overflow-hidden" open={defaultOpen}>
      <summary className="cursor-pointer border-b border-line bg-mist px-5 py-3 text-sm font-semibold text-ink">
        {title}
      </summary>
      <pre className="max-h-[560px] overflow-auto p-5 text-xs leading-5 text-graphite">
        {JSON.stringify(data ?? null, null, 2)}
      </pre>
    </details>
  );
}

export function AdminEmptyState({ label }: { label: string }) {
  return (
    <div className="panel p-6 text-sm text-gray-500">
      {label}
    </div>
  );
}

export function AdminMetaGrid({ items }: { items: Array<[string, ReactNode]> }) {
  return (
    <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="panel p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
          <dd className="mt-2 break-words text-sm font-medium text-ink">{value ?? "Non renseigné"}</dd>
        </div>
      ))}
    </dl>
  );
}
