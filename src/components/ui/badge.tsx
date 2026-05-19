import { STATUS_LABELS } from "@/lib/constants";

const colorMap: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  TARGET_PROFILE_GENERATED: "bg-teal/10 text-teal",
  EVALUATION_GENERATED: "bg-graphite/10 text-graphite",
  INVITATIONS_SENT: "bg-gold/20 text-graphite",
  INVITED: "bg-gold/20 text-graphite",
  STARTED: "bg-teal/10 text-teal",
  COMPLETED: "bg-graphite text-white",
  EXPIRED: "bg-red-50 text-red-700",
  PAID: "bg-teal/10 text-teal",
  PENDING: "bg-gold/20 text-graphite",
  LOW: "bg-teal/10 text-teal",
  MEDIUM: "bg-gold/20 text-graphite",
  HIGH: "bg-red-50 text-red-700"
};

export function Badge({ value }: { value: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colorMap[value] ?? "bg-gray-100 text-gray-700"}`}>
      {STATUS_LABELS[value] ?? value}
    </span>
  );
}
