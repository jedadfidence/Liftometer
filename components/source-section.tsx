"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

type SourceLevel = "campaign" | "ad-group" | "ad-set" | "creative";

const SOURCE_LEVEL_CONFIG: Record<SourceLevel, { label: string; className: string }> = {
  campaign: {
    label: "CAMPAIGN",
    className: "bg-[var(--color-level-campaign-bg)] text-[var(--color-level-campaign)] border-[var(--color-level-campaign-border)]",
  },
  "ad-group": {
    label: "AD GROUP",
    className: "bg-[var(--color-level-ad-set-bg)] text-[var(--color-level-ad-set)] border-[var(--color-level-ad-set-border)]",
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
    <div>
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
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
      <div
        ref={contentRef}
        className="overflow-hidden transition-[height] duration-200 ease-in-out"
        style={{ height: height === undefined ? "auto" : height }}
      >
        <div className="px-3 py-2">{children}</div>
      </div>
    </div>
  );
}
