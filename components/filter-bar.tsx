"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GadsCampaign } from "@/lib/types/gads";

export interface Filters {
  account: string[];
  status: string[];
  type: string[];
  bidding: string[];
}

interface FilterBarProps {
  campaigns: GadsCampaign[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const FRIENDLY_TYPE: Record<string, string> = {
  SEARCH: "Search",
  DISPLAY: "Display",
  SHOPPING: "Shopping",
  VIDEO: "Video",
  PERFORMANCE_MAX: "Performance Max",
  DEMAND_GEN: "Demand Gen",
  MULTI_CHANNEL: "Multi Channel",
  LOCAL: "Local",
  SMART: "Smart",
  LOCAL_SERVICES: "Local Services",
  DISCOVERY: "Discovery",
  TRAVEL: "Travel",
};

const FRIENDLY_BIDDING: Record<string, string> = {
  MANUAL_CPC: "Manual CPC",
  MANUAL_CPV: "Manual CPV",
  MANUAL_CPM: "Manual CPM",
  TARGET_CPA: "Target CPA",
  MAXIMIZE_CONVERSIONS: "Maximize Conversions",
  MAXIMIZE_CONVERSION_VALUE: "Maximize Conv. Value",
  TARGET_ROAS: "Target ROAS",
  TARGET_SPEND: "Target Spend",
  PERCENT_CPC: "Percent CPC",
  TARGET_IMPRESSION_SHARE: "Target Impression Share",
};

function formatLabel(key: string, category: keyof Filters): string {
  if (category === "type") return FRIENDLY_TYPE[key] ?? key;
  if (category === "bidding") return FRIENDLY_BIDDING[key] ?? key;
  if (category === "status") return key.charAt(0) + key.slice(1).toLowerCase();
  return key;
}

export function FilterBar({ campaigns, filters, onFiltersChange }: FilterBarProps) {
  const options = useMemo(() => {
    const accounts = [...new Set(campaigns.map((c) => c.accountName))].sort();
    const statuses = [...new Set(campaigns.map((c) => c.status))].sort();
    const types = [...new Set(campaigns.map((c) => c.advertisingChannelType))].sort();
    const bidding = [...new Set(campaigns.map((c) => c.biddingStrategyType))].sort();
    return { accounts, statuses, types, bidding };
  }, [campaigns]);

  const hasActiveFilters =
    filters.account.length > 0 ||
    filters.status.length > 0 ||
    filters.type.length > 0 ||
    filters.bidding.length > 0;

  function toggleFilter(category: keyof Filters, value: string) {
    const current = filters[category];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [category]: next });
  }

  function removeFilter(category: keyof Filters, value: string) {
    onFiltersChange({
      ...filters,
      [category]: filters[category].filter((v) => v !== value),
    });
  }

  function clearAll() {
    onFiltersChange({ account: [], status: [], type: [], bidding: [] });
  }

  // Active filter chips
  const activeChips: { category: keyof Filters; value: string; label: string }[] = [];
  for (const [category, values] of Object.entries(filters) as [keyof Filters, string[]][]) {
    for (const value of values) {
      activeChips.push({ category, value, label: formatLabel(value, category) });
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Account filter */}
        <Select
          value=""
          onValueChange={(value) => toggleFilter("account", value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Account" />
          </SelectTrigger>
          <SelectContent>
            {options.accounts.map((a) => (
              <SelectItem key={a} value={a}>
                {filters.account.includes(a) ? `\u2713 ${a}` : a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status filter */}
        <Select
          value=""
          onValueChange={(value) => toggleFilter("status", value)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {options.statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {filters.status.includes(s)
                  ? `\u2713 ${formatLabel(s, "status")}`
                  : formatLabel(s, "status")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type filter */}
        <Select
          value=""
          onValueChange={(value) => toggleFilter("type", value)}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Campaign Type" />
          </SelectTrigger>
          <SelectContent>
            {options.types.map((t) => (
              <SelectItem key={t} value={t}>
                {filters.type.includes(t)
                  ? `\u2713 ${formatLabel(t, "type")}`
                  : formatLabel(t, "type")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Bidding strategy filter */}
        <Select
          value=""
          onValueChange={(value) => toggleFilter("bidding", value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Bidding Strategy" />
          </SelectTrigger>
          <SelectContent>
            {options.bidding.map((b) => (
              <SelectItem key={b} value={b}>
                {filters.bidding.includes(b)
                  ? `\u2713 ${formatLabel(b, "bidding")}`
                  : formatLabel(b, "bidding")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
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
      )}
    </div>
  );
}
