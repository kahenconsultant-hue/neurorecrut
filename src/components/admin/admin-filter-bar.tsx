import Link from "next/link";
import { getParam, type AdminSearchParams } from "@/lib/admin-filters";

type SelectFilter = {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
};

type AdminFilterBarProps = {
  searchParams?: AdminSearchParams;
  selects?: SelectFilter[];
  showDateRange?: boolean;
  totalCount: number;
  resultCount: number;
  resetHref: string;
  placeholder?: string;
};

export function AdminFilterBar({
  searchParams,
  selects = [],
  showDateRange = true,
  totalCount,
  resultCount,
  resetHref,
  placeholder = "Entreprise, candidat, poste, email..."
}: AdminFilterBarProps) {
  return (
    <section className="panel p-4">
      <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-6 2xl:grid-cols-8">
        <label className="md:col-span-2 xl:col-span-2">
          <span className="label">Recherche</span>
          <input className="field" name="q" defaultValue={getParam(searchParams, "q")} placeholder={placeholder} />
        </label>

        {selects.map((select) => (
          <label key={select.name}>
            <span className="label">{select.label}</span>
            <select className="field" name={select.name} defaultValue={getParam(searchParams, select.name) || "all"}>
              <option value="all">Tous</option>
              {select.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        {showDateRange ? (
          <>
            <label>
              <span className="label">Depuis</span>
              <input className="field" type="date" name="from" defaultValue={getParam(searchParams, "from")} />
            </label>
            <label>
              <span className="label">Jusqu&apos;à</span>
              <input className="field" type="date" name="to" defaultValue={getParam(searchParams, "to")} />
            </label>
          </>
        ) : null}

        <div className="flex min-w-0 items-end gap-2 md:col-span-2 xl:col-span-2 2xl:col-span-1">
          <button className="btn-primary min-h-10 flex-1" type="submit">
            Filtrer
          </button>
          <Link className="btn-secondary min-h-10 flex-1" href={resetHref}>
            Réinitialiser
          </Link>
        </div>
      </form>
      <p className="mt-3 text-xs text-gray-500">
        {resultCount} résultat{resultCount > 1 ? "s" : ""} affiché{resultCount > 1 ? "s" : ""} sur {totalCount}.
      </p>
    </section>
  );
}
