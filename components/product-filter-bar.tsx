"use client";

import { useMemo } from "react";
import { X, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GmcProduct, GmcAvailability } from "@/lib/types/gmc";

export interface ProductFilters {
  account: string[];
  availability: GmcAvailability[];
  brand: string[];
}

interface ProductFilterBarProps {
  products: GmcProduct[];
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}

const FRIENDLY_AVAILABILITY: Record<GmcAvailability, string> = {
  IN_STOCK: "In Stock",
  OUT_OF_STOCK: "Out of Stock",
  PREORDER: "Preorder",
  LIMITED_AVAILABILITY: "Limited",
  BACKORDER: "Backorder",
  AVAILABILITY_UNSPECIFIED: "Unspecified",
};

function formatProductLabel(key: string, category: keyof ProductFilters): string {
  if (category === "availability") return FRIENDLY_AVAILABILITY[key as GmcAvailability] ?? key;
  return key;
}

function MultiSelectFilter({
  label,
  options,
  selected,
  category,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  category: keyof ProductFilters;
  onToggle: (category: keyof ProductFilters, value: string) => void;
}) {
  const count = selected.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 gap-1.5",
            count > 0 && "border-primary/50"
          )}
        >
          {label}
          {count > 0 && (
            <Badge variant="secondary" className="ml-0.5 h-5 min-w-5 px-1 text-xs">
              {count}
            </Badge>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2" align="start">
        <div className="space-y-1">
          {options.map((opt) => {
            const isSelected = selected.includes(opt);
            return (
              <label
                key={opt}
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggle(category, opt)}
                />
                {formatProductLabel(opt, category)}
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ProductFilterBar({ products, filters, onFiltersChange }: ProductFilterBarProps) {
  const options = useMemo(() => {
    const accounts = [...new Set(products.map((p) => p.accountName))].sort();
    const availability = [...new Set(products.map((p) => p.productAttributes.availability))].sort();
    const brands = [...new Set(products.map((p) => p.productAttributes.brand))].filter(Boolean).sort();
    return { accounts, availability, brands };
  }, [products]);

  function toggleFilter(category: keyof ProductFilters, value: string) {
    const current = filters[category] as string[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [category]: next });
  }

  return (
    <>
      <MultiSelectFilter label="Account" options={options.accounts} selected={filters.account} category="account" onToggle={toggleFilter} />
      <MultiSelectFilter label="Availability" options={options.availability} selected={filters.availability} category="availability" onToggle={toggleFilter} />
      <MultiSelectFilter label="Brand" options={options.brands} selected={filters.brand} category="brand" onToggle={toggleFilter} />
    </>
  );
}

export function ProductFilterChips({ filters, onFiltersChange }: { filters: ProductFilters; onFiltersChange: (filters: ProductFilters) => void }) {
  const activeChips: { category: keyof ProductFilters; value: string; label: string }[] = [];
  for (const [category, values] of Object.entries(filters) as [keyof ProductFilters, string[]][]) {
    for (const value of values) {
      activeChips.push({ category, value, label: formatProductLabel(value, category) });
    }
  }

  if (activeChips.length === 0) return null;

  function removeFilter(category: keyof ProductFilters, value: string) {
    onFiltersChange({
      ...filters,
      [category]: (filters[category] as string[]).filter((v) => v !== value),
    });
  }

  function clearAll() {
    onFiltersChange({ account: [], availability: [], brand: [] });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {activeChips.map(({ category, value, label }) => (
        <Badge
          key={`${category}-${value}`}
          variant="secondary"
          className="gap-1 pr-1"
        >
          {label}
          <button
            type="button"
            onClick={() => removeFilter(category, value)}
            className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
            aria-label={`Remove ${label} filter`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <Button variant="link" size="xs" onClick={clearAll}>
        Clear all
      </Button>
    </div>
  );
}
