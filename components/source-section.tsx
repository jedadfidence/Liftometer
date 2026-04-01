"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SourceSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SourceSection({ title, defaultOpen = true, children }: SourceSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        {title}
      </button>
      {open && <div className="px-3 py-2">{children}</div>}
    </div>
  );
}
