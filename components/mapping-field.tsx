import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MappingFieldProps {
  label: string;
  sourceValue: string;
  mappedValue: string;
  onMappedValueChange: (value: string) => void;
  status: "mapped" | "action-needed";
  editable?: boolean;
  maxLength?: number;
}

export function MappingField({ label, sourceValue, mappedValue, onMappedValueChange, status, editable = true, maxLength }: MappingFieldProps) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="w-1/4 text-sm text-muted-foreground">{label}</div>
      <div className="w-1/4 text-sm font-mono">{sourceValue}</div>
      <div className="w-1/4">
        {editable ? (
          <Input value={mappedValue} onChange={(e) => onMappedValueChange(e.target.value)} maxLength={maxLength}
            className={cn("text-sm", status === "action-needed" && !mappedValue && "border-[var(--color-action-needed)]")} />
        ) : (
          <span className="text-sm font-mono">{mappedValue}</span>
        )}
      </div>
      <div className="w-1/4 flex justify-end">
        <Badge className={cn(status === "mapped" ? "bg-[var(--color-mapped)] text-white" : "bg-[var(--color-action-needed)] text-black")}>
          {status === "mapped" ? "Mapped" : "Action needed"}
        </Badge>
      </div>
    </div>
  );
}
