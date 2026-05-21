import { formatCompatibilityScore } from "@/lib/format";

function tone(score: number) {
  if (score >= 85) return "bg-teal/10 text-teal";
  if (score >= 70) return "bg-sky-50 text-sky-800";
  if (score >= 55) return "bg-gold/20 text-graphite";
  if (score >= 40) return "bg-orange-50 text-orange-800";
  return "bg-red-50 text-red-700";
}

export function CompatibilityScore({ score }: { score: number }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone(score)}`}>
      {formatCompatibilityScore(score)}
    </span>
  );
}
