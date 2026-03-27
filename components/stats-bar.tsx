import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface StatsBarProps {
  mapped: number;
  actionNeeded: number;
}

export function StatsBar({ mapped, actionNeeded }: StatsBarProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-6 py-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-[var(--color-mapped)]" />
          <span className="text-sm font-medium">{mapped} fields auto-mapped</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-[var(--color-action-needed)]" />
          <span className="text-sm font-medium">{actionNeeded} fields need input</span>
        </div>
      </CardContent>
    </Card>
  );
}
