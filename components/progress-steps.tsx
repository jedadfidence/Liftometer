import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

interface Step { label: string; status: "pending" | "active" | "complete"; }
interface ProgressStepsProps { steps: Step[]; }

export function ProgressSteps({ steps }: ProgressStepsProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium",
            step.status === "complete" && "bg-[var(--color-mapped)] border-[var(--color-mapped)] text-white",
            step.status === "active" && "border-primary bg-primary text-primary-foreground",
            step.status === "pending" && "border-border text-muted-foreground")}>
            {step.status === "complete" ? <Check className="h-4 w-4" /> : step.status === "active" ? <Loader2 className="h-4 w-4 animate-spin" /> : i + 1}
          </div>
          <span className={cn("text-sm", step.status === "active" ? "font-medium" : "text-muted-foreground")}>{step.label}</span>
          {i < steps.length - 1 && <div className="h-px w-8 bg-border" />}
        </div>
      ))}
    </div>
  );
}
