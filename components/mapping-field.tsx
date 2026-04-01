"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

export type MappingFieldType =
  | "text"
  | "number"
  | "select"
  | "multi-select"
  | "date";

interface MappingFieldOption {
  value: string;
  label: string;
}

interface MappingFieldProps {
  label: string;
  sourceValue: string;
  mappedValue: string;
  onMappedValueChange: (value: string) => void;
  status: "mapped" | "action-needed";
  editable?: boolean;
  maxLength?: number;
  fieldType?: MappingFieldType;
  options?: MappingFieldOption[];
  /** For date fields: allow "no end date" toggle */
  allowNone?: boolean;
  noneLabel?: string;
}

export function MappingField({
  label,
  sourceValue,
  mappedValue,
  onMappedValueChange,
  status,
  editable = true,
  maxLength,
  fieldType = "text",
  options = [],
  allowNone = false,
  noneLabel = "No end date",
}: MappingFieldProps) {
  const [noneChecked, setNoneChecked] = useState(!mappedValue && allowNone);

  function renderControl() {
    if (!editable) {
      return <span className="text-sm font-mono">{mappedValue}</span>;
    }

    switch (fieldType) {
      case "select":
        return (
          <Select value={mappedValue} onValueChange={onMappedValueChange}>
            <SelectTrigger className="text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multi-select": {
        const selected = mappedValue ? mappedValue.split(",") : [];
        return (
          <div className="flex flex-wrap gap-1.5">
            {options.map((opt) => {
              const isSelected = selected.includes(opt.value);
              return (
                <Button
                  key={opt.value}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    const next = isSelected
                      ? selected.filter((v) => v !== opt.value)
                      : [...selected, opt.value];
                    onMappedValueChange(next.join(","));
                  }}
                >
                  {opt.label}
                </Button>
              );
            })}
          </div>
        );
      }

      case "date": {
        if (allowNone && noneChecked) {
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={noneChecked}
                onCheckedChange={(checked) => {
                  setNoneChecked(checked);
                  if (checked) onMappedValueChange("");
                }}
              />
              <span className="text-sm text-muted-foreground">{noneLabel}</span>
            </div>
          );
        }

        const dateValue = mappedValue ? new Date(mappedValue + "T00:00:00") : undefined;
        return (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-9 w-full justify-start text-left text-sm font-normal",
                    !mappedValue && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {mappedValue || "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateValue}
                  onSelect={(date) => {
                    if (date) {
                      const yyyy = date.getFullYear();
                      const mm = String(date.getMonth() + 1).padStart(2, "0");
                      const dd = String(date.getDate()).padStart(2, "0");
                      onMappedValueChange(`${yyyy}-${mm}-${dd}`);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {allowNone && (
              <div className="flex items-center gap-1.5 shrink-0">
                <Switch
                  checked={noneChecked}
                  onCheckedChange={(checked) => {
                    setNoneChecked(checked);
                    if (checked) onMappedValueChange("");
                  }}
                />
                <span className="text-xs text-muted-foreground">{noneLabel}</span>
              </div>
            )}
          </div>
        );
      }

      case "number":
        return (
          <Input
            type="number"
            value={mappedValue}
            onChange={(e) => onMappedValueChange(e.target.value)}
            className={cn(
              "text-sm font-mono",
              status === "action-needed" && !mappedValue && "border-[var(--color-action-needed)]"
            )}
          />
        );

      default:
        return (
          <Input
            value={mappedValue}
            onChange={(e) => onMappedValueChange(e.target.value)}
            maxLength={maxLength}
            className={cn(
              "text-sm",
              status === "action-needed" && !mappedValue && "border-[var(--color-action-needed)]"
            )}
          />
        );
    }
  }

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="w-1/4 text-sm text-muted-foreground">{label}</div>
      <div className="w-1/4 text-sm font-mono truncate" title={sourceValue}>{sourceValue}</div>
      <div className="w-1/4">{renderControl()}</div>
      <div className="w-1/4 flex justify-end">
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] rounded-full",
            status === "mapped"
              ? "bg-[var(--color-status-mapped-bg)] text-[var(--color-mapped)] border-[var(--color-status-mapped-border)]"
              : "bg-[var(--color-status-action-bg)] text-[var(--color-action-needed)] border-[var(--color-status-action-border)]"
          )}
        >
          {status === "mapped" ? "Mapped" : "Action needed"}
        </Badge>
      </div>
    </div>
  );
}
