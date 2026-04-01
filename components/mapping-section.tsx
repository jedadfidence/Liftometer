"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";

type Level = "campaign" | "ad-set" | "creative";

const LEVEL_CONFIG: Record<Level, { label: string; className: string }> = {
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

interface MappingSectionProps {
  title: string;
  level: Level;
  status: "complete" | "needs-input";
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function MappingSection({ title, level, status, defaultOpen, children }: MappingSectionProps) {
  const [open, setOpen] = useState(defaultOpen ?? status === "needs-input");
  const levelConfig = LEVEL_CONFIG[level];

  return (
    <Card>
      <CardHeader className="cursor-pointer py-3 px-4" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            <Badge
              variant="outline"
              className={`${levelConfig.className} text-[10px] font-semibold tracking-[0.5px] uppercase rounded-full px-2 py-0`}
            >
              {levelConfig.label}
            </Badge>
            <span className="text-sm font-medium">{title}</span>
          </div>
          <Badge
            variant="outline"
            className={
              status === "complete"
                ? "bg-[var(--color-status-mapped-bg)] text-[var(--color-mapped)] border-[var(--color-status-mapped-border)] text-[10px] rounded-full"
                : "bg-[var(--color-status-action-bg)] text-[var(--color-action-needed)] border-[var(--color-status-action-border)] text-[10px] rounded-full"
            }
          >
            {status === "complete" ? "Fully mapped" : "Needs input"}
          </Badge>
        </div>
      </CardHeader>
      {open && <CardContent>{children}</CardContent>}
    </Card>
  );
}
