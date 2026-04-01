"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";

type SourceLevel = "campaign" | "ad-group";

const SOURCE_LEVEL_CONFIG: Record<SourceLevel, { label: string; className: string }> = {
  campaign: {
    label: "CAMPAIGN",
    className: "bg-[var(--color-level-campaign-bg)] text-[var(--color-level-campaign)] border-[var(--color-level-campaign-border)]",
  },
  "ad-group": {
    label: "AD GROUP",
    className: "bg-[var(--color-level-ad-set-bg)] text-[var(--color-level-ad-set)] border-[var(--color-level-ad-set-border)]",
  },
};

interface SourceSectionProps {
  title: string;
  level?: SourceLevel;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function SourceSection({ title, level, defaultOpen = true, open: controlledOpen, onOpenChange, children }: SourceSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? internalOpen;
  const levelConfig = level ? SOURCE_LEVEL_CONFIG[level] : null;

  function toggle() {
    const next = !isOpen;
    onOpenChange?.(next);
    if (controlledOpen === undefined) setInternalOpen(next);
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        {levelConfig && (
          <Badge
            variant="outline"
            className={`${levelConfig.className} text-[10px] font-semibold tracking-[0.5px] uppercase rounded-full px-2 py-0`}
          >
            {levelConfig.label}
          </Badge>
        )}
        {title}
      </button>
      {isOpen && <div className="px-3 py-2">{children}</div>}
    </div>
  );
}
