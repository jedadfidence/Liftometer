"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";

type DraftLevel = "campaign" | "ad-set" | "creative";

const LEVEL_CONFIG: Record<DraftLevel, { label: string; className: string }> = {
  campaign: {
    label: "CAMPAIGN",
    className: "bg-[var(--color-level-campaign-bg)] text-[var(--color-level-campaign)] border-[var(--color-level-campaign-border)]",
  },
  "ad-set": {
    label: "AD SET",
    className: "bg-[var(--color-level-ad-set-bg)] text-[var(--color-level-ad-set)] border-[var(--color-level-ad-set-border)]",
  },
  creative: {
    label: "CREATIVE",
    className: "bg-[var(--color-level-creative-bg)] text-[var(--color-level-creative)] border-[var(--color-level-creative-border)]",
  },
};

interface DraftSectionProps {
  title: string;
  level: DraftLevel;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function DraftSection({ title, level, defaultOpen = false, open: controlledOpen, onOpenChange, children }: DraftSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? internalOpen;
  const levelConfig = LEVEL_CONFIG[level];

  function toggle() {
    const next = !isOpen;
    onOpenChange?.(next);
    if (controlledOpen === undefined) setInternalOpen(next);
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer py-3 px-4" onClick={toggle}>
        <div className="flex items-center gap-2.5">
          {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <Badge
            variant="outline"
            className={`${levelConfig.className} text-[10px] font-semibold tracking-[0.5px] uppercase rounded-full px-2 py-0`}
          >
            {levelConfig.label}
          </Badge>
          <span className="text-sm font-medium">{title}</span>
        </div>
      </CardHeader>
      {isOpen && <CardContent>{children}</CardContent>}
    </Card>
  );
}

export function DraftField({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-1.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-mono mt-0.5">{value || "—"}</div>
    </div>
  );
}
