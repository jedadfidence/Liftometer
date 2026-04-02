"use client";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function MappingSection({ title, level, status, defaultOpen, open: controlledOpen, onOpenChange, children }: MappingSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? status === "needs-input");
  const isOpen = controlledOpen ?? internalOpen;
  const levelConfig = LEVEL_CONFIG[level];

  function toggle() {
    const next = !isOpen;
    onOpenChange?.(next);
    if (controlledOpen === undefined) setInternalOpen(next);
  }

  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(isOpen ? undefined : 0);

  useEffect(() => {
    if (!contentRef.current) return;
    if (isOpen) {
      const h = contentRef.current.scrollHeight;
      setHeight(h);
      const timer = setTimeout(() => setHeight(undefined), 200);
      return () => clearTimeout(timer);
    } else {
      const h = contentRef.current.scrollHeight;
      setHeight(h);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0));
      });
    }
  }, [isOpen]);

  return (
    <div className="min-w-0 overflow-hidden rounded-xl bg-card text-sm text-card-foreground ring-1 ring-foreground/10">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between cursor-pointer py-3 px-4"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
          <Badge
            variant="outline"
            className={`${levelConfig.className} text-[10px] font-semibold tracking-[0.5px] uppercase rounded-full px-2 py-0 shrink-0`}
          >
            {levelConfig.label}
          </Badge>
          <span className="text-sm font-medium truncate">{title}</span>
        </div>
        <Badge
          variant="outline"
          className={`shrink-0 ml-2 ${
            status === "complete"
              ? "bg-[var(--color-status-mapped-bg)] text-[var(--color-mapped)] border-[var(--color-status-mapped-border)] text-[10px] rounded-full"
              : "bg-[var(--color-status-action-bg)] text-[var(--color-action-needed)] border-[var(--color-status-action-border)] text-[10px] rounded-full"
          }`}
        >
          {status === "complete" ? "Fully mapped" : "Needs input"}
        </Badge>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-[height] duration-200 ease-in-out"
        style={{ height: height === undefined ? "auto" : height }}
      >
        <div className="px-4 pb-3">{children}</div>
      </div>
    </div>
  );
}
