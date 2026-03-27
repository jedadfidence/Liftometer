"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MappingSectionProps {
  title: string;
  status: "complete" | "needs-input";
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function MappingSection({ title, status, defaultOpen, children }: MappingSectionProps) {
  const [open, setOpen] = useState(defaultOpen ?? status === "needs-input");
  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <CardTitle className="text-base font-medium">{title}</CardTitle>
          </div>
          <Badge className={cn(status === "complete" ? "bg-[var(--color-mapped)] text-white" : "bg-[var(--color-action-needed)] text-black")}>
            {status === "complete" ? "Fully mapped" : "Needs input"}
          </Badge>
        </div>
      </CardHeader>
      {open && <CardContent>{children}</CardContent>}
    </Card>
  );
}
