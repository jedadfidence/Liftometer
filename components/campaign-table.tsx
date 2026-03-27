"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, SlidersHorizontal } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { FilterBar, type Filters } from "@/components/filter-bar";
import { formatBudget, microsToUsd } from "@/lib/utils";
import type { GadsCampaign } from "@/lib/types/gads";

type SortColumn =
  | "accountName"
  | "name"
  | "id"
  | "advertisingChannelType"
  | "status"
  | "budget"
  | "biddingStrategyType";

type SortDirection = "asc" | "desc";

const COLUMN_LABELS: Record<SortColumn, string> = {
  accountName: "Account",
  name: "Campaign Name",
  id: "Campaign ID",
  advertisingChannelType: "Type",
  status: "Status",
  budget: "Budget",
  biddingStrategyType: "Bidding Strategy",
};

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
  MAXIMIZE_CONVERSIONS: "Max. Conversions",
  MAXIMIZE_CONVERSION_VALUE: "Max. Conv. Value",
  TARGET_ROAS: "Target ROAS",
  TARGET_SPEND: "Target Spend",
  PERCENT_CPC: "Percent CPC",
  TARGET_IMPRESSION_SHARE: "Target Imp. Share",
};

function getSortValue(campaign: GadsCampaign, column: SortColumn): string | number {
  switch (column) {
    case "budget":
      return campaign.budget.amountMicros;
    default:
      return campaign[column];
  }
}

interface CampaignTableProps {
  campaigns: GadsCampaign[];
}

export function CampaignTable({ campaigns }: CampaignTableProps) {
  const [rawSearch, setRawSearch] = useState("");
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<SortColumn>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filters, setFilters] = useState<Filters>({
    account: [],
    status: [],
    type: [],
    bidding: [],
  });

  // Debounced search — 300ms
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setSearch(rawSearch);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [rawSearch]);

  const handleSort = useCallback(
    (column: SortColumn) => {
      if (sortColumn === column) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortColumn(column);
        setSortDirection("asc");
      }
    },
    [sortColumn],
  );

  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase();

    return campaigns
      .filter((c) => {
        // Search across name and id
        if (
          lowerSearch &&
          !c.name.toLowerCase().includes(lowerSearch) &&
          !c.id.toLowerCase().includes(lowerSearch)
        ) {
          return false;
        }
        // Filters (AND logic between categories)
        if (filters.account.length > 0 && !filters.account.includes(c.accountName)) return false;
        if (filters.status.length > 0 && !filters.status.includes(c.status)) return false;
        if (
          filters.type.length > 0 &&
          !filters.type.includes(c.advertisingChannelType)
        )
          return false;
        if (
          filters.bidding.length > 0 &&
          !filters.bidding.includes(c.biddingStrategyType)
        )
          return false;
        return true;
      })
      .sort((a, b) => {
        const aVal = getSortValue(a, sortColumn);
        const bVal = getSortValue(b, sortColumn);
        const cmp = typeof aVal === "number" && typeof bVal === "number"
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));
        return sortDirection === "asc" ? cmp : -cmp;
      });
  }, [campaigns, search, filters, sortColumn, sortDirection]);

  function SortIcon({ column }: { column: SortColumn }) {
    if (sortColumn !== column) {
      return <ArrowUpDown className="size-3.5 text-muted-foreground/50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="size-3.5" />
    ) : (
      <ArrowDown className="size-3.5" />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search campaigns by name or ID..."
          value={rawSearch}
          onChange={(e) => setRawSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Filter bar */}
      <FilterBar
        campaigns={campaigns}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Table or empty state */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={SlidersHorizontal}
          title="No campaigns match your filters"
          description="Try adjusting your search or filter criteria."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRawSearch("");
                setSearch("");
                setFilters({ account: [], status: [], type: [], bidding: [] });
              }}
            >
              Clear all filters
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {(Object.keys(COLUMN_LABELS) as SortColumn[]).map((col) => (
                <TableHead key={col}>
                  <button
                    type="button"
                    onClick={() => handleSort(col)}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    {COLUMN_LABELS[col]}
                    <SortIcon column={col} />
                  </button>
                </TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.accountName}</TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="font-mono text-muted-foreground text-xs">
                  {c.id}
                </TableCell>
                <TableCell>
                  {FRIENDLY_TYPE[c.advertisingChannelType] ?? c.advertisingChannelType}
                </TableCell>
                <TableCell>
                  <StatusBadge status={c.status} />
                </TableCell>
                <TableCell className="font-mono">
                  {formatBudget(microsToUsd(c.budget.amountMicros))}
                  <span className="text-xs text-muted-foreground">/day</span>
                </TableCell>
                <TableCell>
                  {FRIENDLY_BIDDING[c.biddingStrategyType] ?? c.biddingStrategyType}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="outline" size="xs" asChild>
                      <Link href={`/dashboard/campaigns/${c.id}`}>View</Link>
                    </Button>
                    <Button variant="secondary" size="xs" asChild>
                      <Link href={`/dashboard/clone/${c.id}`}>Clone to OAI</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
