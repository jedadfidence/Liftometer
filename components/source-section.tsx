"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SourceSectionProps {
  title: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function SourceSection({ title, defaultOpen = true, open: controlledOpen, onOpenChange, children }: SourceSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? internalOpen;

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
        {title}
      </button>
      {isOpen && <div className="px-3 py-2">{children}</div>}
    </div>
  );
}
