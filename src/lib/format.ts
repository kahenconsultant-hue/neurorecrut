export function formatCurrency(cents: number, currency = "eur") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(cents / 100);
}

export function formatDate(date?: Date | string | null) {
  if (!date) return "Non renseigné";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function compatibilityScoreFromPercentage(score: number) {
  return clamp(Number.isFinite(score) ? score : 0, 0, 100) / 20;
}

export function formatCompatibilityScore(score: number) {
  return `${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(compatibilityScoreFromPercentage(score))}/5`;
}
