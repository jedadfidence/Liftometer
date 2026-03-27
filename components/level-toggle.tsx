"use client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface LevelToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function LevelToggle({ label, description, checked, onCheckedChange, disabled }: LevelToggleProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
