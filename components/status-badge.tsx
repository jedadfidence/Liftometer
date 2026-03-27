import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ENABLED: { label: "Enabled", className: "bg-[var(--color-status-enabled)] text-white" },
  PAUSED: { label: "Paused", className: "bg-[var(--color-status-paused)] text-black" },
  DRAFT: { label: "Draft", className: "bg-[var(--color-status-draft)] text-white" },
  REMOVED: { label: "Removed", className: "bg-[var(--color-status-removed)] text-white" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "" };
  return <Badge className={cn(config.className)}>{config.label}</Badge>;
}
