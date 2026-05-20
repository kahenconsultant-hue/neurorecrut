export type AdminSearchParams = Record<string, string | string[] | undefined>;

export type AdminFilterValue = string | number | Date | null | undefined;

export function getParam(searchParams: AdminSearchParams | undefined, key: string) {
  const value = searchParams?.[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function normalizeFilterValue(value: AdminFilterValue) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function matchesQuery(query: string | undefined, values: AdminFilterValue[]) {
  const normalizedQuery = normalizeFilterValue(query);
  if (!normalizedQuery) return true;
  return values.some((value) => normalizeFilterValue(value).includes(normalizedQuery));
}

export function matchesSelect(selected: string | undefined, value: AdminFilterValue) {
  const normalizedSelected = normalizeFilterValue(selected);
  if (!normalizedSelected || normalizedSelected === "all") return true;
  return normalizeFilterValue(value) === normalizedSelected;
}

export function matchesDateRange(date: Date | string | null | undefined, from?: string, to?: string) {
  if (!date) return true;
  const current = new Date(date);
  if (Number.isNaN(current.getTime())) return true;

  if (from) {
    const start = new Date(`${from}T00:00:00.000Z`);
    if (!Number.isNaN(start.getTime()) && current < start) return false;
  }

  if (to) {
    const end = new Date(`${to}T23:59:59.999Z`);
    if (!Number.isNaN(end.getTime()) && current > end) return false;
  }

  return true;
}

export function uniqueOptions(values: AdminFilterValue[]) {
  const options = new Map<string, string>();
  values.forEach((value) => {
    const label = String(value ?? "").trim();
    if (!label) return;
    options.set(normalizeFilterValue(label), label);
  });
  return Array.from(options.entries())
    .sort(([, a], [, b]) => a.localeCompare(b, "fr"))
    .map(([value, label]) => ({ value, label }));
}
